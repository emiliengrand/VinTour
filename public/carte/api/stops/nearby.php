<?php
require_once __DIR__ . "/../lib.php";

$lat = get_float("lat");
$lon = get_float("lon");
$radius = floatval(get_str("radius_m", "600"));
$limit = get_int("limit", 50);
if ($radius <= 0) $radius = 600;
if ($limit <= 0 || $limit > 200) $limit = 50;

$pdo = db();

// Bounding box
$lat_deg = $radius / 111320.0;
$lon_deg = $radius / (111320.0 * cos(deg2rad($lat)) + 1e-9);

$minLat = $lat - $lat_deg;
$maxLat = $lat + $lat_deg;
$minLon = $lon - $lon_deg;
$maxLon = $lon + $lon_deg;

$stmt = $pdo->prepare("SELECT stop_id, stop_name, stop_lat, stop_lon FROM stops WHERE stop_lat BETWEEN :minLat AND :maxLat AND stop_lon BETWEEN :minLon AND :maxLon");
$stmt->execute([
  ":minLat" => $minLat, ":maxLat" => $maxLat,
  ":minLon" => $minLon, ":maxLon" => $maxLon,
]);
$candidates = $stmt->fetchAll();

$stops = [];
foreach ($candidates as $r) {
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

json_response(["stops" => $stops]);
