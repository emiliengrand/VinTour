<?php
require_once __DIR__ . "/../lib.php";

$stop_id = get_str("stop_id", "");
if ($stop_id === "") error_response("Paramètre manquant: stop_id", 400);

$when = get_str("when", "");
$limit = get_int("limit", 15);
if ($limit <= 0 || $limit > 50) $limit = 15;

$dt = ($when !== "") ? parse_iso_datetime($when) : new DateTimeImmutable("now", new DateTimeZone("Europe/Paris"));
$sec = seconds_since_midnight($dt);

$pdo = db();
$services = active_service_ids($pdo, $dt);
if (count($services) === 0) {
  json_response(["stop_id" => $stop_id, "when" => $dt->format(DateTimeInterface::ATOM), "departures" => []]);
}

$placeholders = implode(",", array_fill(0, count($services), "?"));

$sql = "
SELECT
  st.trip_id,
  st.departure_time,
  st.arrival_time,
  t.route_id,
  COALESCE(r.route_short_name, '') AS route_short_name,
  COALESCE(r.route_long_name, '') AS route_long_name,
  COALESCE(t.trip_headsign, '') AS headsign,
  st.departure_seconds
FROM stop_times st
JOIN trips t ON t.trip_id = st.trip_id
LEFT JOIN routes r ON r.route_id = t.route_id
WHERE st.stop_id = ?
  AND st.departure_seconds >= ?
  AND t.service_id IN ($placeholders)
ORDER BY st.departure_seconds ASC
LIMIT $limit
";

$params = array_merge([$stop_id, $sec], $services);

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$rows = $stmt->fetchAll();

json_response([
  "stop_id" => $stop_id,
  "when" => $dt->format(DateTimeInterface::ATOM),
  "departures" => $rows
]);
