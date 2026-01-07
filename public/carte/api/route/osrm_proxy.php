\
<?php
require_once __DIR__ . "/../lib.php";

/**
 * Proxy OSRM (public) pour récupérer une géométrie "sur routes".
 *
 * IMPORTANT (MAMP): selon la config, file_get_contents(https://...) peut échouer.
 * -> On tente d'abord cURL (si dispo), puis file_get_contents.
 *
 * On ne renvoie PAS d'erreur HTTP 502 quand OSRM est indisponible,
 * mais un JSON 200 avec geometry = [] pour que l'UI fasse un fallback.
 *
 * Query:
 *  - coords: "lon,lat;lon,lat;..." (min 2 points, max 25)
 *  - profile: (optionnel) "driving" | "foot" | "cycling" (défaut: driving)
 */
$profile = get_str("profile", "driving");
$allowedProfiles = ["driving", "foot", "cycling"];
if (!in_array($profile, $allowedProfiles, true)) {
  error_response("profile invalide (driving|foot|cycling)", 400);
}


$coords = get_str("coords", "");
if ($coords === "") error_response("Paramètre manquant: coords", 400);

$parts = explode(";", $coords);
if (count($parts) < 2) error_response("coords doit contenir au moins 2 points", 400);
if (count($parts) > 25) error_response("coords trop long (max 25 points)", 400);

// Basic sanitize
foreach ($parts as $p) {
  $p = trim($p);
  if (!preg_match('/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/', $p)) {
    error_response("coords invalide: " . $p, 400);
  }
}

$base = "https://router.project-osrm.org/route/v1/" . $profile . "/";
$url = $base . $coords . "?overview=full&geometries=geojson";

function http_get_osrm(string $url): array {
  // Try cURL first (more reliable on MAMP)
  if (function_exists("curl_init")) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_FOLLOWLOCATION => true,
      CURLOPT_CONNECTTIMEOUT => 5,
      CURLOPT_TIMEOUT => 8,
      CURLOPT_USERAGENT => "TadaoPopBusMVP",
      CURLOPT_HTTPHEADER => ["Accept: application/json"],
    ]);

    $raw = curl_exec($ch);
    $err = curl_error($ch);
    $code = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    curl_close($ch);

    if ($raw !== false && $code >= 200 && $code < 300) {
      return ["ok" => true, "raw" => $raw, "via" => "curl"];
    }

    // Some environments lack CA bundle -> retry without SSL verify (dev-only)
    $ch2 = curl_init($url);
    curl_setopt_array($ch2, [
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_FOLLOWLOCATION => true,
      CURLOPT_CONNECTTIMEOUT => 5,
      CURLOPT_TIMEOUT => 8,
      CURLOPT_USERAGENT => "TadaoPopBusMVP",
      CURLOPT_HTTPHEADER => ["Accept: application/json"],
      CURLOPT_SSL_VERIFYPEER => false,
      CURLOPT_SSL_VERIFYHOST => 0,
    ]);
    $raw2 = curl_exec($ch2);
    $err2 = curl_error($ch2);
    $code2 = curl_getinfo($ch2, CURLINFO_RESPONSE_CODE);
    curl_close($ch2);

    if ($raw2 !== false && $code2 >= 200 && $code2 < 300) {
      return ["ok" => true, "raw" => $raw2, "via" => "curl_no_ssl_verify"];
    }

    return ["ok" => false, "error" => $err ?: $err2 ?: ("HTTP " . ($code ?: $code2 ?: 0)), "via" => "curl"];
  }

  // Fallback file_get_contents
  $ctx = stream_context_create([
    "http" => [
      "method" => "GET",
      "timeout" => 8,
      "header" => "User-Agent: TadaoPopBusMVP\r\nAccept: application/json\r\n"
    ]
  ]);

  $raw = @file_get_contents($url, false, $ctx);
  if ($raw === false) {
    return ["ok" => false, "error" => "file_get_contents failed", "via" => "file_get_contents"];
  }
  return ["ok" => true, "raw" => $raw, "via" => "file_get_contents"];
}

$res = http_get_osrm($url);
if (!$res["ok"]) {
  json_response([
    "provider" => "router.project-osrm.org",
    "profile" => $profile,
    "ok" => false,
    "error" => "OSRM indisponible",
    "via" => $res["via"] ?? null,
    "geometry" => []
  ]);
}

$data = json_decode($res["raw"], true);
if (!is_array($data) || ($data["code"] ?? "") !== "Ok") {
  json_response([
    "provider" => "router.project-osrm.org",
    "profile" => $profile,
    "ok" => false,
    "error" => "OSRM réponse invalide",
    "via" => $res["via"] ?? null,
    "geometry" => []
  ]);
}

$route = $data["routes"][0] ?? null;
$geom = $route["geometry"]["coordinates"] ?? null;

if (!$geom || !is_array($geom)) {
  json_response([
    "provider" => "router.project-osrm.org",
    "profile" => $profile,
    "ok" => false,
    "error" => "OSRM geometry manquante",
    "via" => $res["via"] ?? null,
    "geometry" => []
  ]);
}

json_response([
  "provider" => "router.project-osrm.org",
  "profile" => $profile,
  "ok" => true,
  "via" => $res["via"] ?? null,
  "distance_m" => $route["distance"] ?? null,
  "duration_s" => $route["duration"] ?? null,
  "geometry" => $geom
]);
