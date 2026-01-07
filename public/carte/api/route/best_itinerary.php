<?php
require_once __DIR__ . "/../lib.php";

/**
 * Itinéraire vers le bus pop-up — version "toujours une solution"
 * - Recherche un trajet GTFS avec correspondances (bus + marche)
 * - Si aucun service actif pour la date (GTFS hors période) : mode "relaxed" (on ignore calendar)
 * - Si aucun trajet transit n'est trouvé : solution "tout à pied"
 * - Tracé : renvoie des waypoints (user -> arrêts clés -> bus)
 *
 * NB: GTFS statique (horaires théoriques). Pas de temps réel.
 */

$lat = get_float("lat");
$lon = get_float("lon");

$when = get_str("when", "");
$dt = ($when !== "") ? parse_iso_datetime($when) : new DateTimeImmutable("now", new DateTimeZone("Europe/Paris"));
$nowSec = seconds_since_midnight($dt);

$radiusFrom = floatval(get_str("radius_from_m", "1200"));
$maxFrom    = get_int("max_from", 30);

$maxDuration = get_int("max_duration_s", 6*3600);
$maxExpansions = get_int("max_expansions", 14000);
$transferWalkM = floatval(get_str("transfer_walk_m", "700"));
$boardLookaheadS = get_int("board_lookahead_s", 6*3600);

if ($radiusFrom <= 0) $radiusFrom = 1200;
if ($maxFrom <= 0 || $maxFrom > 120) $maxFrom = 30;
if ($maxDuration <= 0 || $maxDuration > 12*3600) $maxDuration = 6*3600;
if ($maxExpansions <= 0 || $maxExpansions > 80000) $maxExpansions = 14000;
if ($transferWalkM < 0) $transferWalkM = 0;
if ($boardLookaheadS <= 0 || $boardLookaheadS > 12*3600) $boardLookaheadS = 6*3600;

$walkSpeed = 1.2; // m/s

$busPath = __DIR__ . "/../bus.json";
if (!file_exists($busPath)) error_response("bus.json introuvable", 500);
$bus = json_decode(file_get_contents($busPath), true);
if (!is_array($bus)) error_response("bus.json invalide", 500);
$busLat = floatval($bus["lat"] ?? 0);
$busLon = floatval($bus["lon"] ?? 0);
if (!$busLat || !$busLon) error_response("bus.json: lat/lon invalides", 500);

$pdo = db();

function nearby_stops_expand(PDO $pdo, float $lat, float $lon, float $radiusStart, int $limit): array {
  $radii = [$radiusStart, max(2000, $radiusStart*1.8), 5000, 9000, 14000];
  foreach ($radii as $radius) {
    $lat_deg = $radius / 111320.0;
    $lon_deg = $radius / (111320.0 * cos(deg2rad($lat)) + 1e-9);

    $stmt = $pdo->prepare("SELECT stop_id, stop_name, stop_lat, stop_lon FROM stops WHERE stop_lat BETWEEN :minLat AND :maxLat AND stop_lon BETWEEN :minLon AND :maxLon");
    $stmt->execute([
      ":minLat" => $lat - $lat_deg, ":maxLat" => $lat + $lat_deg,
      ":minLon" => $lon - $lon_deg, ":maxLon" => $lon + $lon_deg,
    ]);

    $stops = [];
    foreach ($stmt->fetchAll() as $r) {
      $d = haversine_m($lat, $lon, floatval($r["stop_lat"]), floatval($r["stop_lon"]));
      if ($d <= $radius) {
        $stops[] = [
          "stop_id" => $r["stop_id"],
          "stop_name" => $r["stop_name"] ?? "",
          "stop_lat" => floatval($r["stop_lat"]),
          "stop_lon" => floatval($r["stop_lon"]),
          "distance_m" => $d,
        ];
      }
    }
    usort($stops, fn($a,$b) => $a["distance_m"] <=> $b["distance_m"]);
    $stops = array_slice($stops, 0, $limit);
    if (count($stops) > 0) return $stops;
  }
  return [];
}

$fromStops = nearby_stops_expand($pdo, $lat, $lon, $radiusFrom, $maxFrom);

// walk-only baseline (always present)
$walkOnlyM = haversine_m($lat, $lon, $busLat, $busLon);
$walkOnlyS = intval(round($walkOnlyM / $walkSpeed));
$walkOnlySolution = [
  "type" => "walk_only",
  "summary" => [
    "total_seconds" => $walkOnlyS,
    "total_walk_m" => round($walkOnlyM, 1),
    "transfers" => 0,
    "ride_legs" => 0
  ],
  "recommended_start" => null,
  "itinerary" => [[
    "type" => "walk",
    "from" => "user",
    "to" => "bus",
    "distance_m" => $walkOnlyM,
    "duration_seconds" => $walkOnlyS
  ]],
  "waypoints" => [
    ["lat"=>$lat,"lon"=>$lon],
    ["lat"=>$busLat,"lon"=>$busLon]
  ]
];

if (count($fromStops) === 0) {
  json_response([
    "bus" => $bus,
    "when" => $dt->format(DateTimeInterface::ATOM),
    "user" => ["lat"=>$lat,"lon"=>$lon],
    "note" => "Aucun arrêt trouvé près de toi (même en élargissant). Solution à pied.",
    "solutions" => [$walkOnlySolution]
  ]);
}

// services
$services = active_service_ids($pdo, $dt);
$relaxed = false;
if (count($services) === 0) {
  // GTFS hors période (ex: feed 2025, date système 2026) -> on ignore calendar
  $relaxed = true;
}

// stop cache
$stopCache = [];
function get_stop(PDO $pdo, array &$stopCache, string $stopId): ?array {
  if (array_key_exists($stopId, $stopCache)) return $stopCache[$stopId];
  $stmt = $pdo->prepare("SELECT stop_id, stop_name, stop_lat, stop_lon FROM stops WHERE stop_id = ?");
  $stmt->execute([$stopId]);
  $r = $stmt->fetch();
  if (!$r) { $stopCache[$stopId] = null; return null; }
  $stopCache[$stopId] = [
    "stop_id" => $r["stop_id"],
    "stop_name" => $r["stop_name"] ?? "",
    "stop_lat" => floatval($r["stop_lat"]),
    "stop_lon" => floatval($r["stop_lon"]),
  ];
  return $stopCache[$stopId];
}

// neighbors for walking transfers
$neighborsCache = [];
function transfer_neighbors(PDO $pdo, array &$neighborsCache, array &$stopCache, string $stopId, float $radius): array {
  $key = $stopId . ":" . intval(round($radius));
  if (isset($neighborsCache[$key])) return $neighborsCache[$key];

  $s = get_stop($pdo, $stopCache, $stopId);
  if (!$s) { $neighborsCache[$key] = []; return []; }

  $lat = $s["stop_lat"]; $lon = $s["stop_lon"];
  $lat_deg = $radius / 111320.0;
  $lon_deg = $radius / (111320.0 * cos(deg2rad($lat)) + 1e-9);

  $stmt = $pdo->prepare("SELECT stop_id, stop_lat, stop_lon FROM stops WHERE stop_lat BETWEEN :minLat AND :maxLat AND stop_lon BETWEEN :minLon AND :maxLon");
  $stmt->execute([
    ":minLat" => $lat - $lat_deg, ":maxLat" => $lat + $lat_deg,
    ":minLon" => $lon - $lon_deg, ":maxLon" => $lon + $lon_deg,
  ]);

  $out = [];
  foreach ($stmt->fetchAll() as $r) {
    $nid = $r["stop_id"];
    if ($nid === $stopId) continue;
    $d = haversine_m($lat, $lon, floatval($r["stop_lat"]), floatval($r["stop_lon"]));
    if ($d <= $radius) $out[] = ["stop_id" => $nid, "distance_m" => $d];
  }
  usort($out, fn($a,$b) => $a["distance_m"] <=> $b["distance_m"]);
  $neighborsCache[$key] = array_slice($out, 0, 28);
  return $neighborsCache[$key];
}

// departures query (calendar-filtered or relaxed)
$depSql = "
SELECT
  st.trip_id, st.stop_sequence, st.departure_seconds, st.departure_time,
  t.route_id,
  COALESCE(r.route_short_name,'') AS route_short_name,
  COALESCE(r.route_long_name,'')  AS route_long_name,
  COALESCE(t.trip_headsign,'')    AS headsign
FROM stop_times st
JOIN trips t ON t.trip_id = st.trip_id
LEFT JOIN routes r ON r.route_id = t.route_id
WHERE st.stop_id = ?
  AND st.departure_seconds >= ?
  AND st.departure_seconds <= ?
";
$paramsTail = [];
if (!$relaxed) {
  $phSrv = implode(",", array_fill(0, count($services), "?"));
  $depSql .= " AND t.service_id IN ($phSrv) ";
  $paramsTail = $services;
}
$depSql .= " ORDER BY st.departure_seconds ASC LIMIT 36";
$depStmt = $pdo->prepare($depSql);

// trip cache
$tripCache = [];
function trip_stoptimes(PDO $pdo, array &$tripCache, string $tripId): array {
  if (isset($tripCache[$tripId])) return $tripCache[$tripId];
  $stmt = $pdo->prepare("SELECT stop_sequence, stop_id, arrival_seconds, arrival_time FROM stop_times WHERE trip_id = ? ORDER BY stop_sequence ASC");
  $stmt->execute([$tripId]);
  $tripCache[$tripId] = $stmt->fetchAll();
  return $tripCache[$tripId];
}

// Time-dependent Dijkstra (earliest arrival)
$bestTime = [];
$bestWalk = [];
$bestPrev = [];
$bestStart = [];

$pq = new SplPriorityQueue();
$pq->setExtractFlags(SplPriorityQueue::EXTR_BOTH);

$maxTime = $nowSec + $maxDuration;

// init states from walking to nearby stops
foreach ($fromStops as $s) {
  $sid = $s["stop_id"];
  $walkM = floatval($s["distance_m"]);
  $arr = $nowSec + intval(round($walkM / $walkSpeed));

  if (!isset($bestTime[$sid]) || $arr < $bestTime[$sid]) {
    $bestTime[$sid] = $arr;
    $bestWalk[$sid] = $walkM;
    $bestStart[$sid] = $sid;
    $bestPrev[$sid] = [
      "mode" => "walk_from_user",
      "prev_stop_id" => null,
      "distance_m" => $walkM
    ];
    $pq->insert($sid, -$arr);

    $stopCache[$sid] = [
      "stop_id" => $sid,
      "stop_name" => $s["stop_name"],
      "stop_lat" => $s["stop_lat"],
      "stop_lon" => $s["stop_lon"],
    ];
  }
}

$bestSolution = null;
$exp = 0;

while (!$pq->isEmpty() && $exp < $maxExpansions) {
  $cur = $pq->extract();
  $stopId = $cur["data"];
  $t = -intval($cur["priority"]);
  $exp++;

  if (!isset($bestTime[$stopId]) || $t !== $bestTime[$stopId]) continue;
  if ($t > $maxTime) continue;

  $stop = get_stop($pdo, $stopCache, $stopId);
  if (!$stop) continue;

  // Evaluate finish by walking to bus from this stop (any distance)
  $walkToBusM = haversine_m($stop["stop_lat"], $stop["stop_lon"], $busLat, $busLon);
  $finish = $t + intval(round($walkToBusM / $walkSpeed));
  $totalS = $finish - $nowSec;
  $totalWalk = floatval($bestWalk[$stopId]) + $walkToBusM;

  $better = false;
  if ($bestSolution === null) $better = true;
  else if ($totalS < $bestSolution["total_seconds"] - 1) $better = true;
  else if (abs($totalS - $bestSolution["total_seconds"]) <= 60 && $totalWalk < $bestSolution["total_walk_m"] - 50) $better = true;

  if ($better) {
    $bestSolution = [
      "end_stop_id" => $stopId,
      "arrive_stop_sec" => $t,
      "walk_to_bus_m" => $walkToBusM,
      "total_seconds" => intval($totalS),
      "total_walk_m" => round($totalWalk, 1),
    ];
    // optional prune: if we already beat walk-only by a lot, we can stop earlier
  }

  // 1) walking transfers
  if ($transferWalkM > 0) {
    $nbrs = transfer_neighbors($pdo, $neighborsCache, $stopCache, $stopId, $transferWalkM);
    foreach ($nbrs as $n) {
      $nid = $n["stop_id"];
      $d = floatval($n["distance_m"]);
      $nt = $t + intval(round($d / $walkSpeed));
      if ($nt > $maxTime) continue;

      $nwalk = floatval($bestWalk[$stopId]) + $d;

      $ok = false;
      if (!isset($bestTime[$nid])) $ok = true;
      else if ($nt < $bestTime[$nid] - 1) $ok = true;
      else if (abs($nt - $bestTime[$nid]) <= 60 && $nwalk < floatval($bestWalk[$nid]) - 50) $ok = true;

      if ($ok) {
        $bestTime[$nid] = $nt;
        $bestWalk[$nid] = $nwalk;
        $bestStart[$nid] = $bestStart[$stopId];
        $bestPrev[$nid] = [
          "mode" => "walk_transfer",
          "prev_stop_id" => $stopId,
          "distance_m" => $d
        ];
        $pq->insert($nid, -$nt);
      }
    }
  }

  // 2) bus rides
  $timeEnd = min($maxTime, $t + $boardLookaheadS);
  $params = array_merge([$stopId, $t, $timeEnd], $paramsTail);
  $depStmt->execute($params);
  $deps = $depStmt->fetchAll();
  if (!$deps) continue;

  foreach ($deps as $d) {
    $tripId = $d["trip_id"];
    $boardSeq = intval($d["stop_sequence"]);
    $depSec = intval($d["departure_seconds"]);
    if ($depSec < $t) continue;

    $sts = trip_stoptimes($pdo, $tripCache, $tripId);
    if (!$sts || count($sts) < 2) continue;

    $seenAfter = 0;
    foreach ($sts as $row) {
      $seq = intval($row["stop_sequence"]);
      if ($seq <= $boardSeq) continue;

      $toId = $row["stop_id"];
      $arrSec = intval($row["arrival_seconds"]);
      if ($arrSec <= 0) continue;
      if ($arrSec > $maxTime) break;

      $nwalk = floatval($bestWalk[$stopId]); // ride does not add walking

      $ok = false;
      if (!isset($bestTime[$toId])) $ok = true;
      else if ($arrSec < $bestTime[$toId] - 1) $ok = true;
      else if (abs($arrSec - $bestTime[$toId]) <= 60 && $nwalk < floatval($bestWalk[$toId]) - 50) $ok = true;

      if ($ok) {
        $bestTime[$toId] = $arrSec;
        $bestWalk[$toId] = $nwalk;
        $bestStart[$toId] = $bestStart[$stopId];
        $bestPrev[$toId] = [
          "mode" => "ride",
          "prev_stop_id" => $stopId,
          "trip_id" => $tripId,
          "route" => [
            "route_id" => $d["route_id"],
            "short_name" => $d["route_short_name"],
            "long_name" => $d["route_long_name"],
          ],
          "headsign" => $d["headsign"],
          "from_stop_id" => $stopId,
          "from_departure_time" => $d["departure_time"],
          "from_departure_sec" => $depSec,
          "to_stop_id" => $toId,
          "to_arrival_time" => $row["arrival_time"],
          "to_arrival_sec" => $arrSec
        ];
        $pq->insert($toId, -$arrSec);
      }

      $seenAfter++;
      if ($seenAfter > 120) break;
    }
  }
}

// Build solutions (always include walk-only)
$solutions = [$walkOnlySolution];

if ($bestSolution !== null) {
  $endStopId = $bestSolution["end_stop_id"];

  // reconstruct
  $steps = [];
  $curr = $endStopId;
  $rideLegs = 0;

  while (isset($bestPrev[$curr])) {
    $p = $bestPrev[$curr];

    if ($p["mode"] === "walk_from_user") {
      $to = get_stop($pdo, $stopCache, $curr);
      $steps[] = [
        "type" => "walk",
        "from" => "user",
        "to_stop" => $to,
        "distance_m" => floatval($p["distance_m"]),
        "duration_seconds" => intval(round(floatval($p["distance_m"]) / $walkSpeed))
      ];
      break;
    }

    if ($p["mode"] === "walk_transfer") {
      $from = get_stop($pdo, $stopCache, $p["prev_stop_id"]);
      $to = get_stop($pdo, $stopCache, $curr);
      $steps[] = [
        "type" => "walk",
        "from_stop" => $from,
        "to_stop" => $to,
        "distance_m" => floatval($p["distance_m"]),
        "duration_seconds" => intval(round(floatval($p["distance_m"]) / $walkSpeed)),
        "purpose" => "transfer"
      ];
      $curr = $p["prev_stop_id"];
      continue;
    }

    if ($p["mode"] === "ride") {
      $from = get_stop($pdo, $stopCache, $p["from_stop_id"]);
      $to = get_stop($pdo, $stopCache, $p["to_stop_id"]);
      $steps[] = [
        "type" => "ride",
        "trip_id" => $p["trip_id"],
        "route" => $p["route"],
        "headsign" => $p["headsign"],
        "from" => [
          "stop" => $from,
          "departure_time" => $p["from_departure_time"],
          "departure_sec" => intval($p["from_departure_sec"])
        ],
        "to" => [
          "stop" => $to,
          "arrival_time" => $p["to_arrival_time"],
          "arrival_sec" => intval($p["to_arrival_sec"])
        ]
      ];
      $rideLegs++;
      $curr = $p["prev_stop_id"];
      continue;
    }

    break;
  }

  $steps = array_reverse($steps);

  // final walk to bus
  $endStop = get_stop($pdo, $stopCache, $endStopId);
  $steps[] = [
    "type" => "walk",
    "from_stop" => $endStop,
    "to" => "bus",
    "distance_m" => floatval($bestSolution["walk_to_bus_m"]),
    "duration_seconds" => intval(round(floatval($bestSolution["walk_to_bus_m"]) / $walkSpeed)),
    "purpose" => "to_bus"
  ];

  // recommended start
  $startStopId = $bestStart[$endStopId] ?? null;
  $startStop = $startStopId ? get_stop($pdo, $stopCache, $startStopId) : null;
  $walkFromM = null;
  if ($startStopId) {
    foreach ($fromStops as $s) {
      if ($s["stop_id"] === $startStopId) { $walkFromM = floatval($s["distance_m"]); break; }
    }
  }

  $summary = [
    "total_seconds" => intval($bestSolution["total_seconds"]),
    "total_walk_m" => round(floatval($bestSolution["total_walk_m"]), 1),
    "transfers" => max(0, $rideLegs - 1),
    "ride_legs" => $rideLegs
  ];

  // waypoints for trace (user -> start stop -> each ride to-stop -> end stop -> bus)
  $waypoints = [];
  $waypoints[] = ["lat"=>$lat,"lon"=>$lon];
  if ($startStop) $waypoints[] = ["lat"=>$startStop["stop_lat"],"lon"=>$startStop["stop_lon"]];
  foreach ($steps as $st) {
    if ($st["type"] === "ride") {
      $waypoints[] = ["lat"=>$st["to"]["stop"]["stop_lat"],"lon"=>$st["to"]["stop"]["stop_lon"]];
    }
  }
  if ($endStop) $waypoints[] = ["lat"=>$endStop["stop_lat"],"lon"=>$endStop["stop_lon"]];
  $waypoints[] = ["lat"=>$busLat,"lon"=>$busLon];

  // dedupe consecutive
  $clean = [];
  $prevKey = null;
  foreach ($waypoints as $p) {
    $key = round($p["lat"], 6).",".round($p["lon"], 6);
    if ($key === $prevKey) continue;
    $clean[] = $p;
    $prevKey = $key;
  }

  $solutions[] = [
    "type" => "transit",
    "summary" => $summary,
    "recommended_start" => $startStop ? [
      "stop" => $startStop,
      "walk_from_m" => $walkFromM
    ] : null,
    "itinerary" => $steps,
    "waypoints" => $clean,
    "relaxed_calendar" => $relaxed
  ];

  usort($solutions, fn($a,$b) => intval($a["summary"]["total_seconds"]) <=> intval($b["summary"]["total_seconds"]));
}

json_response([
  "bus" => $bus,
  "when" => $dt->format(DateTimeInterface::ATOM),
  "user" => ["lat"=>$lat,"lon"=>$lon],
  "solutions" => $solutions
]);
