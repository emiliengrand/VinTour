<?php
require_once __DIR__ . "/lib.php";

/**
 * Bus pop-up – propositions "les plus pertinentes"
 * - on teste plusieurs arrêts proches du user + proches du bus
 * - on renvoie les meilleures options DIRECTES (sans correspondance)
 * - score = marche + attente + durée de trajet
 */

$fromLat = get_float("fromLat");
$fromLon = get_float("fromLon");
$toLat   = get_float("toLat");
$toLon   = get_float("toLon");

$when = get_str("when", "");
$dt = ($when !== "") ? parse_iso_datetime($when) : new DateTimeImmutable("now", new DateTimeZone("Europe/Paris"));
$sec = seconds_since_midnight($dt);

$radiusFrom = floatval(get_str("radius_from_m", "700"));
$radiusTo   = floatval(get_str("radius_to_m", "900"));
$maxFrom    = get_int("max_from", 10);
$maxTo      = get_int("max_to", 10);
$limit      = get_int("limit", 6);

if ($radiusFrom <= 0) $radiusFrom = 700;
if ($radiusTo <= 0) $radiusTo = 900;
if ($maxFrom <= 0 || $maxFrom > 25) $maxFrom = 10;
if ($maxTo <= 0 || $maxTo > 25) $maxTo = 10;
if ($limit <= 0 || $limit > 15) $limit = 6;

$pdo = db();

function nearby_stops(PDO $pdo, float $lat, float $lon, float $radius, int $limit): array {
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
  return array_slice($stops, 0, $limit);
}

$fromStops = nearby_stops($pdo, $fromLat, $fromLon, $radiusFrom, $maxFrom);
$toStops   = nearby_stops($pdo, $toLat, $toLon, $radiusTo, $maxTo);

if (count($fromStops) === 0) error_response("Aucun arrêt proche de toi (augmente radius_from_m).", 404);
if (count($toStops) === 0) error_response("Aucun arrêt proche du bus (augmente radius_to_m).", 404);

$services = active_service_ids($pdo, $dt);
if (count($services) === 0) {
  json_response(["when" => $dt->format(DateTimeInterface::ATOM), "fromStops" => $fromStops, "toStops" => $toStops, "itineraries" => []]);
}

$fromIds = array_map(fn($s) => $s["stop_id"], $fromStops);
$toIds   = array_map(fn($s) => $s["stop_id"], $toStops);

$fromDist = [];
foreach ($fromStops as $s) $fromDist[$s["stop_id"]] = $s["distance_m"];
$toDist = [];
foreach ($toStops as $s) $toDist[$s["stop_id"]] = $s["distance_m"];

$phFrom = implode(",", array_fill(0, count($fromIds), "?"));
$phTo   = implode(",", array_fill(0, count($toIds), "?"));
$phSrv  = implode(",", array_fill(0, count($services), "?"));

$sql = "
SELECT
  st1.stop_id AS from_stop_id,
  st2.stop_id AS to_stop_id,
  st1.trip_id,
  st1.departure_time AS from_departure_time,
  st2.arrival_time   AS to_arrival_time,
  st1.departure_seconds AS from_departure_seconds,
  st2.arrival_seconds   AS to_arrival_seconds,
  t.route_id,
  COALESCE(r.route_short_name,'') AS route_short_name,
  COALESCE(r.route_long_name,'')  AS route_long_name,
  COALESCE(t.trip_headsign,'')    AS headsign
FROM stop_times st1
JOIN stop_times st2 ON st1.trip_id = st2.trip_id
JOIN trips t ON t.trip_id = st1.trip_id
LEFT JOIN routes r ON r.route_id = t.route_id
WHERE st1.stop_id IN ($phFrom)
  AND st2.stop_id IN ($phTo)
  AND st1.stop_sequence < st2.stop_sequence
  AND st1.departure_seconds >= ?
  AND t.service_id IN ($phSrv)
ORDER BY st1.departure_seconds ASC
LIMIT 600
";

$params = array_merge($fromIds, $toIds, [$sec], $services);
$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$rows = $stmt->fetchAll();

if (!$rows || count($rows) === 0) {
  json_response(["when" => $dt->format(DateTimeInterface::ATOM), "fromStops" => $fromStops, "toStops" => $toStops, "itineraries" => []]);
}

$stopName = [];
foreach ($fromStops as $s) $stopName[$s["stop_id"]] = $s["stop_name"];
foreach ($toStops as $s) $stopName[$s["stop_id"]] = $s["stop_name"];

// score (walk + wait + ride)
$walkSpeed = 1.2; // m/s ~ 4.3 km/h
$itins = [];
foreach ($rows as $r) {
  $fromId = $r["from_stop_id"];
  $toId   = $r["to_stop_id"];

  $walkFromM = floatval($fromDist[$fromId] ?? 999999);
  $walkToM   = floatval($toDist[$toId] ?? 999999);
  $depSec    = intval($r["from_departure_seconds"]);
  $arrSec    = intval($r["to_arrival_seconds"]);
  if ($arrSec < 0) $arrSec = $depSec;

  $waitS = max(0, $depSec - $sec);
  $rideS = max(0, $arrSec - $depSec);

  $walkFromS = $walkFromM / $walkSpeed;
  $walkToS   = $walkToM / $walkSpeed;

  $totalS = $walkFromS + $walkToS + $waitS + $rideS;

  $itins[] = [
    "score_seconds" => intval(round($totalS)),
    "walk_from_m" => round($walkFromM, 1),
    "walk_to_m" => round($walkToM, 1),
    "wait_seconds" => $waitS,
    "ride_seconds" => $rideS,

    "trip_id" => $r["trip_id"],
    "route" => [
      "route_id" => $r["route_id"],
      "short_name" => $r["route_short_name"],
      "long_name" => $r["route_long_name"],
    ],
    "headsign" => $r["headsign"],

    "from" => [
      "stop_id" => $fromId,
      "stop_name" => $stopName[$fromId] ?? $fromId,
      "departure_time" => $r["from_departure_time"],
    ],
    "to" => [
      "stop_id" => $toId,
      "stop_name" => $stopName[$toId] ?? $toId,
      "arrival_time" => $r["to_arrival_time"],
    ]
  ];
}

usort($itins, fn($a,$b) => $a["score_seconds"] <=> $b["score_seconds"]);

$uniq = [];
$best = [];
foreach ($itins as $it) {
  $key = $it["trip_id"] . "|" . $it["from"]["stop_id"] . "|" . $it["to"]["stop_id"];
  if (isset($uniq[$key])) continue;
  $uniq[$key] = true;
  $best[] = $it;
  if (count($best) >= $limit) break;
}

json_response([
  "when" => $dt->format(DateTimeInterface::ATOM),
  "fromStops" => $fromStops,
  "toStops" => $toStops,
  "itineraries" => $best
]);
