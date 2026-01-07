<?php
require_once __DIR__ . "/../lib.php";

$fromStopId = get_str("from_stop_id", "");
if ($fromStopId === "") error_response("Paramètre manquant: from_stop_id", 400);

$when = get_str("when", "");
$dt = ($when !== "") ? parse_iso_datetime($when) : new DateTimeImmutable("now", new DateTimeZone("Europe/Paris"));
$sec = seconds_since_midnight($dt);

$radiusTo   = floatval(get_str("radius_to_m", "900"));
$maxTo      = get_int("max_to", 15);
$limit      = get_int("limit", 3);

if ($radiusTo <= 0) $radiusTo = 900;
if ($maxTo <= 0 || $maxTo > 50) $maxTo = 15;
if ($limit <= 0 || $limit > 10) $limit = 3;

$busPath = __DIR__ . "/../bus.json";
if (!file_exists($busPath)) error_response("bus.json introuvable", 500);
$bus = json_decode(file_get_contents($busPath), true);
if (!is_array($bus)) error_response("bus.json invalide", 500);
$busLat = floatval($bus["lat"] ?? 0);
$busLon = floatval($bus["lon"] ?? 0);
if (!$busLat || !$busLon) error_response("bus.json: lat/lon invalides", 500);

$pdo = db();

// from stop info
$stmt = $pdo->prepare("SELECT stop_id, stop_name, stop_lat, stop_lon FROM stops WHERE stop_id = ?");
$stmt->execute([$fromStopId]);
$fromStop = $stmt->fetch();
if (!$fromStop) error_response("Stop inconnu: ".$fromStopId, 404);
$fromStop = [
  "stop_id" => $fromStop["stop_id"],
  "stop_name" => $fromStop["stop_name"] ?? "",
  "stop_lat" => floatval($fromStop["stop_lat"]),
  "stop_lon" => floatval($fromStop["stop_lon"]),
];

// to-stops near bus
$lat_deg = $radiusTo / 111320.0;
$lon_deg = $radiusTo / (111320.0 * cos(deg2rad($busLat)) + 1e-9);

$stmt = $pdo->prepare("SELECT stop_id, stop_name, stop_lat, stop_lon FROM stops WHERE stop_lat BETWEEN :minLat AND :maxLat AND stop_lon BETWEEN :minLon AND :maxLon");
$stmt->execute([
  ":minLat" => $busLat - $lat_deg, ":maxLat" => $busLat + $lat_deg,
  ":minLon" => $busLon - $lon_deg, ":maxLon" => $busLon + $lon_deg,
]);

$toStops = [];
foreach ($stmt->fetchAll() as $r) {
  $d = haversine_m($busLat, $busLon, floatval($r["stop_lat"]), floatval($r["stop_lon"]));
  if ($d <= $radiusTo) {
    $toStops[] = [
      "stop_id" => $r["stop_id"],
      "stop_name" => $r["stop_name"] ?? "",
      "stop_lat" => floatval($r["stop_lat"]),
      "stop_lon" => floatval($r["stop_lon"]),
      "distance_to_bus_m" => $d,
    ];
  }
}
usort($toStops, fn($a,$b) => $a["distance_to_bus_m"] <=> $b["distance_to_bus_m"]);
$toStops = array_slice($toStops, 0, $maxTo);
if (count($toStops) === 0) error_response("Aucun arrêt proche du bus (augmente radius_to_m).", 404);

$services = active_service_ids($pdo, $dt);
if (count($services) === 0) json_response(["bus"=>$bus,"fromStop"=>$fromStop,"options"=>[]]);

$toIds = array_map(fn($s) => $s["stop_id"], $toStops);
$phTo = implode(",", array_fill(0, count($toIds), "?"));
$phSrv = implode(",", array_fill(0, count($services), "?"));

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
WHERE st1.stop_id = ?
  AND st2.stop_id IN ($phTo)
  AND st1.stop_sequence < st2.stop_sequence
  AND st1.departure_seconds >= ?
  AND t.service_id IN ($phSrv)
ORDER BY st1.departure_seconds ASC
LIMIT 200
";

$params = array_merge([$fromStopId], $toIds, [$sec], $services);
$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$rows = $stmt->fetchAll();
if (!$rows) json_response(["bus"=>$bus,"fromStop"=>$fromStop,"options"=>[]]);

// Lookup toStop info
$toById = [];
foreach ($toStops as $s) $toById[$s["stop_id"]] = $s;

$options = [];
foreach ($rows as $r) {
  $toId = $r["to_stop_id"];
  $toStop = $toById[$toId] ?? null;
  if (!$toStop) continue;

  $waitS = max(0, intval($r["from_departure_seconds"]) - $sec);
  $rideS = max(0, intval($r["to_arrival_seconds"]) - intval($r["from_departure_seconds"]));

  $options[] = [
    "trip_id" => $r["trip_id"],
    "route" => [
      "route_id" => $r["route_id"],
      "short_name" => $r["route_short_name"],
      "long_name" => $r["route_long_name"],
    ],
    "headsign" => $r["headsign"],
    "from" => [
      "stop_id" => $fromStopId,
      "stop_name" => $fromStop["stop_name"],
      "stop_lat" => $fromStop["stop_lat"],
      "stop_lon" => $fromStop["stop_lon"],
      "departure_time" => $r["from_departure_time"],
    ],
    "to" => [
      "stop_id" => $toStop["stop_id"],
      "stop_name" => $toStop["stop_name"],
      "stop_lat" => $toStop["stop_lat"],
      "stop_lon" => $toStop["stop_lon"],
      "arrival_time" => $r["to_arrival_time"],
      "walk_to_bus_m" => $toStop["distance_to_bus_m"],
    ],
    "wait_seconds" => $waitS,
    "ride_seconds" => $rideS,
  ];
  if (count($options) >= $limit) break;
}

json_response([
  "bus" => $bus,
  "when" => $dt->format(DateTimeInterface::ATOM),
  "fromStop" => $fromStop,
  "options" => $options
]);
