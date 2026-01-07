<?php
require_once __DIR__ . "/../lib.php";

$lat = get_float("lat");
$lon = get_float("lon");

$when = get_str("when", "");
$dt = ($when !== "") ? parse_iso_datetime($when) : new DateTimeImmutable("now", new DateTimeZone("Europe/Paris"));
$sec = seconds_since_midnight($dt);

$radiusFrom = floatval(get_str("radius_from_m", "800")); // stops around user
$radiusTo   = floatval(get_str("radius_to_m", "900"));   // stops around bus
$maxFrom    = get_int("max_from", 20);
$maxTo      = get_int("max_to", 15);

if ($radiusFrom <= 0) $radiusFrom = 800;
if ($radiusTo <= 0) $radiusTo = 900;
if ($maxFrom <= 0 || $maxFrom > 50) $maxFrom = 20;
if ($maxTo <= 0 || $maxTo > 50) $maxTo = 15;

$busPath = __DIR__ . "/../bus.json";
if (!file_exists($busPath)) error_response("bus.json introuvable", 500);
$bus = json_decode(file_get_contents($busPath), true);
if (!is_array($bus)) error_response("bus.json invalide", 500);
$busLat = floatval($bus["lat"] ?? 0);
$busLon = floatval($bus["lon"] ?? 0);
if (!$busLat || !$busLon) error_response("bus.json: lat/lon invalides", 500);

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

$fromStops = nearby_stops($pdo, $lat, $lon, $radiusFrom, $maxFrom);
$toStops   = nearby_stops($pdo, $busLat, $busLon, $radiusTo, $maxTo);

if (count($fromStops) === 0) error_response("Aucun arrêt proche de toi (augmente radius_from_m).", 404);
if (count($toStops) === 0) error_response("Aucun arrêt proche du bus (augmente radius_to_m).", 404);

$services = active_service_ids($pdo, $dt);
if (count($services) === 0) {
  json_response(["bus" => $bus, "recommended" => null, "alternatives" => []]);
}

$fromIds = array_map(fn($s) => $s["stop_id"], $fromStops);
$toIds   = array_map(fn($s) => $s["stop_id"], $toStops);

$fromDist = [];
foreach ($fromStops as $s) $fromDist[$s["stop_id"]] = $s["distance_m"];

$phFrom = implode(",", array_fill(0, count($fromIds), "?"));
$phTo   = implode(",", array_fill(0, count($toIds), "?"));
$phSrv  = implode(",", array_fill(0, count($services), "?"));

/**
 * On récupère les prochains trips (directs) qui vont d'un arrêt proche user vers un arrêt proche bus
 * Puis on garde le meilleur par arrêt départ (le plus tôt).
 */
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
LIMIT 800
";

$params = array_merge($fromIds, $toIds, [$sec], $services);
$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$rows = $stmt->fetchAll();

if (!$rows || count($rows) === 0) {
  json_response(["bus" => $bus, "recommended" => null, "alternatives" => []]);
}

// Keep earliest option per from_stop_id
$bestByFrom = [];
foreach ($rows as $r) {
  $fid = $r["from_stop_id"];
  if (!isset($bestByFrom[$fid])) $bestByFrom[$fid] = $r;
}

$alts = [];
foreach ($fromStops as $s) {
  $fid = $s["stop_id"];
  if (!isset($bestByFrom[$fid])) continue; // not eligible
  $r = $bestByFrom[$fid];
  $waitS = max(0, intval($r["from_departure_seconds"]) - $sec);
  $alts[] = [
    "stop" => $s,
    "next" => [
      "trip_id" => $r["trip_id"],
      "from_departure_time" => $r["from_departure_time"],
      "to_arrival_time" => $r["to_arrival_time"],
      "to_stop_id" => $r["to_stop_id"],
      "route" => [
        "route_id" => $r["route_id"],
        "short_name" => $r["route_short_name"],
        "long_name" => $r["route_long_name"],
      ],
      "headsign" => $r["headsign"],
      "wait_seconds" => $waitS,
    ]
  ];
}

// Sort: nearest stop first, tie-breaker by soonest departure
usort($alts, function($a,$b){
  $da = $a["stop"]["distance_m"];
  $db = $b["stop"]["distance_m"];
  if (abs($da - $db) > 1e-6) return $da <=> $db;
  return $a["next"]["wait_seconds"] <=> $b["next"]["wait_seconds"];
});

$recommended = count($alts) ? $alts[0] : null;
$alternatives = array_slice($alts, 0, 5);

json_response([
  "bus" => $bus,
  "when" => $dt->format(DateTimeInterface::ATOM),
  "recommended" => $recommended,
  "alternatives" => $alternatives
]);
