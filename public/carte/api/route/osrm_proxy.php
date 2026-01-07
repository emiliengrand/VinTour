<?php
require_once __DIR__ . "/../lib.php";

/**
 * Proxy OSRM robuste (MAMP/Mac).
 *
 * Stratégie :
 *  1) cURL PHP (extension) -> rapide mais parfois TLS cassé sous MAMP
 *  2) /usr/bin/curl (curl système macOS) -> TLS OK (utilise la stack système)
 *  3) file_get_contents -> dernier fallback
 *
 * On renvoie toujours HTTP 200 avec {"ok":false,"geometry":[]} si ça échoue,
 * pour que l'UI fasse le fallback ligne droite.
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

foreach ($parts as $p) {
  $p = trim($p);
  if (!preg_match('/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/', $p)) {
    error_response("coords invalide: " . $p, 400);
  }
}

$url =
  "https://router.project-osrm.org/route/v1/" .
  $profile . "/" .
  $coords .
  "?overview=full&geometries=geojson";

/**
 * 1) HTTP via extension cURL PHP
 */
function http_get_via_php_curl(string $url): array {
  if (!function_exists("curl_init")) {
    return ["ok" => false, "error" => "curl extension not available", "via" => "php_curl"];
  }

  $ch = curl_init($url);

  // Valeur numérique pour TLS1.2 (évite les soucis de constantes manquantes)
  // CURL_SSLVERSION_TLSv1_2 = 6
  $TLS12 = 6;

  curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_CONNECTTIMEOUT => 10,
    CURLOPT_TIMEOUT => 20,
    CURLOPT_USERAGENT => "TadaoPopBusMVP",
    CURLOPT_HTTPHEADER => ["Accept: application/json"],
    CURLOPT_IPRESOLVE => CURL_IPRESOLVE_V4,
    CURLOPT_ENCODING => "",

    // 🔧 tente de forcer TLS1.2 (peut ne pas suffire sur certains MAMP)
    CURLOPT_SSLVERSION => $TLS12,
  ]);

  $raw  = curl_exec($ch);
  $err  = curl_error($ch);
  $code = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
  curl_close($ch);

  if ($raw !== false && $code >= 200 && $code < 300) {
    return ["ok" => true, "raw" => $raw, "via" => "php_curl", "http_code" => $code];
  }

  return [
    "ok" => false,
    "error" => $err ?: ("HTTP " . ($code ?: 0)),
    "via" => "php_curl",
    "http_code" => $code ?: null
  ];
}

/**
 * 2) HTTP via curl système macOS (/usr/bin/curl)
 * (Très efficace quand MAMP a un TLS/openssl cassé)
 */
function http_get_via_system_curl(string $url): array {
  $curlBin = "/usr/bin/curl";
  if (!is_file($curlBin) || !is_executable($curlBin)) {
    return ["ok" => false, "error" => "system curl not available", "via" => "system_curl"];
  }

  // --fail : code non-2xx => exit != 0
  // --compressed : accepte gzip/br
  // -sS : silent mais montre erreurs
  // --max-time : timeout global
  // --connect-timeout : timeout connexion
  // -A : user-agent
  $cmd =
    escapeshellcmd($curlBin) .
    " --fail --compressed -sS" .
    " --max-time 20 --connect-timeout 10" .
    " -A " . escapeshellarg("TadaoPopBusMVP") .
    " -H " . escapeshellarg("Accept: application/json") .
    " " . escapeshellarg($url) .
    " 2>&1";

  $out = shell_exec($cmd);

  if ($out === null || $out === false || $out === "") {
    return ["ok" => false, "error" => "system curl failed (empty output)", "via" => "system_curl"];
  }

  // Si c'est une erreur curl, ça ressemble souvent à "curl: (35) ..."
  if (preg_match('/^curl:\s*\(\d+\)/i', trim($out))) {
    return ["ok" => false, "error" => trim($out), "via" => "system_curl"];
  }

  return ["ok" => true, "raw" => $out, "via" => "system_curl"];
}

/**
 * 3) HTTP via file_get_contents (dernier recours)
 */
function http_get_via_fgc(string $url): array {
  $ctx = stream_context_create([
    "http" => [
      "method" => "GET",
      "timeout" => 20,
      "header" => "User-Agent: TadaoPopBusMVP\r\nAccept: application/json\r\n"
    ]
  ]);

  $raw = @file_get_contents($url, false, $ctx);
  if ($raw === false) {
    return ["ok" => false, "error" => "file_get_contents failed", "via" => "file_get_contents"];
  }
  return ["ok" => true, "raw" => $raw, "via" => "file_get_contents"];
}

/**
 * Pipeline de fetch
 */
$res = http_get_via_php_curl($url);

// Si handshake TLS MAMP / php_curl pète -> fallback direct curl système
if (!$res["ok"]) {
  $res2 = http_get_via_system_curl($url);
  if ($res2["ok"]) {
    $res = $res2;
  } else {
    // Dernier fallback
    $res3 = http_get_via_fgc($url);
    if ($res3["ok"]) {
      $res = $res3;
    } else {
      // On garde l'erreur la plus utile (souvent system_curl est explicite)
      $res = $res2["error"] ? $res2 : $res;
    }
  }
}

if (!$res["ok"]) {
  json_response([
    "ok" => false,
    "error" => "OSRM indisponible",
    "debug" => $res["error"] ?? null,
    "via" => $res["via"] ?? null,
    "osrm_url" => $url,
    "geometry" => []
  ]);
}

$data = json_decode($res["raw"], true);
if (!is_array($data) || ($data["code"] ?? "") !== "Ok") {
  json_response([
    "ok" => false,
    "error" => "OSRM réponse invalide",
    "debug" => "json_decode failed or code != Ok",
    "via" => $res["via"] ?? null,
    "osrm_url" => $url,
    "geometry" => []
  ]);
}

$route = $data["routes"][0] ?? null;
$geom  = $route["geometry"]["coordinates"] ?? null;

if (!$geom || !is_array($geom)) {
  json_response([
    "ok" => false,
    "error" => "OSRM geometry manquante",
    "debug" => "routes[0].geometry.coordinates missing",
    "via" => $res["via"] ?? null,
    "osrm_url" => $url,
    "geometry" => []
  ]);
}

json_response([
  "ok" => true,
  "via" => $res["via"] ?? null,
  "distance_m" => $route["distance"] ?? null,
  "duration_s" => $route["duration"] ?? null,
  "geometry" => $geom
]);
