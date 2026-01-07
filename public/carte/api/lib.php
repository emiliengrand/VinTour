<?php
// --- Hardening: keep JSON responses clean even if PHP emits notices/warnings ---
ob_start();
ini_set('display_errors', '0');
ini_set('html_errors', '0');
ini_set('log_errors', '1');
error_reporting(E_ALL);

// Ensure local time for service day/time (GTFS is local)
date_default_timezone_set('Europe/Paris');

register_shutdown_function(function () {
  $err = error_get_last();
  if (!$err) return;
  $fatal = [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR, E_USER_ERROR];
  if (!in_array($err['type'], $fatal, true)) return;

  // Clean any previous output
  while (ob_get_level() > 0) { @ob_end_clean(); }

  http_response_code(500);
  header("Content-Type: application/json; charset=utf-8");
  echo json_encode([
    "error" => "Erreur PHP (fatal)",
    "detail" => $err["message"] ?? "unknown",
    "file" => $err["file"] ?? null,
    "line" => $err["line"] ?? null
  ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  exit;
});

function json_response($data, int $status = 200): void {
  // Remove any stray output (notices/warnings) so JSON stays valid
  if (ob_get_length()) { @ob_clean(); }
  http_response_code($status);
  header("Content-Type: application/json; charset=utf-8");
  echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  exit;
}

function error_response(string $message, int $status = 400): void {
  json_response(["error" => $message], $status);
}

function db(): PDO {
  static $pdo = null;
  if ($pdo !== null) return $pdo;

  $dbPath = __DIR__ . "/../data/gtfs.sqlite";

  if (!in_array('sqlite', PDO::getAvailableDrivers(), true)) {
    error_response("PDO SQLite n'est pas disponible dans ton PHP. Dans MAMP, choisis une version PHP avec sqlite activé (extensions pdo_sqlite/sqlite3).", 500);
  }
  if (!file_exists($dbPath)) {
    error_response("Base SQLite introuvable: " . $dbPath, 500);
  }

  $pdo = new PDO("sqlite:" . $dbPath, null, null, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
  ]);
  return $pdo;
}

function get_float(string $key): float {
  if (!isset($_GET[$key])) error_response("Paramètre manquant: $key", 400);
  return floatval($_GET[$key]);
}

function get_int(string $key, int $default = 0): int {
  if (!isset($_GET[$key])) return $default;
  return intval($_GET[$key]);
}

function get_str(string $key, string $default = ""): string {
  if (!isset($_GET[$key])) return $default;
  return strval($_GET[$key]);
}

function parse_iso_datetime(string $iso): DateTimeImmutable {
  try {
    // Accepts "2026-01-05T14:31:42.975Z" or without Z.
    // Convert to Europe/Paris so GTFS service day/time matches local operation.
    $dt = new DateTimeImmutable($iso);
    return $dt->setTimezone(new DateTimeZone("Europe/Paris"));
  } catch (Exception $e) {
    error_response("Paramètre 'when' invalide (ISO8601 attendu)", 400);
  }
}

function haversine_m(float $lat1, float $lon1, float $lat2, float $lon2): float {
  $R = 6371000.0;
  $phi1 = deg2rad($lat1);
  $phi2 = deg2rad($lat2);
  $dphi = deg2rad($lat2 - $lat1);
  $dlambda = deg2rad($lon2 - $lon1);
  $a = sin($dphi/2)**2 + cos($phi1)*cos($phi2)*sin($dlambda/2)**2;
  return 2*$R*asin(sqrt($a));
}

function active_service_ids(PDO $pdo, DateTimeImmutable $dt): array {
  $ymd = $dt->format("Ymd");
  $weekday = strtolower($dt->format("l")); // monday...
  $weekdayCols = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
  if (!in_array($weekday, $weekdayCols, true)) $weekday = "monday";

  $active = [];

  // calendar (optional)
  $hasCal = false;
  try {
    $stmt = $pdo->query("SELECT name FROM sqlite_master WHERE type='table' AND name='calendar'");
    $hasCal = (bool)$stmt->fetch();
  } catch (Exception $e) {}

  if ($hasCal) {
    $sql = "SELECT service_id FROM calendar WHERE start_date <= :d AND end_date >= :d AND $weekday = 1";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([":d" => $ymd]);
    foreach ($stmt->fetchAll() as $row) $active[$row["service_id"]] = true;
  }

  // calendar_dates exceptions (optional)
  $hasCd = false;
  try {
    $stmt = $pdo->query("SELECT name FROM sqlite_master WHERE type='table' AND name='calendar_dates'");
    $hasCd = (bool)$stmt->fetch();
  } catch (Exception $e) {}

  if ($hasCd) {
    $stmt = $pdo->prepare("SELECT service_id, exception_type FROM calendar_dates WHERE date = :d");
    $stmt->execute([":d" => $ymd]);
    foreach ($stmt->fetchAll() as $row) {
      $sid = $row["service_id"];
      $ex = intval($row["exception_type"]);
      if ($ex === 1) $active[$sid] = true;
      if ($ex === 2) unset($active[$sid]);
    }
  }

  return array_keys($active);
}

function seconds_since_midnight(DateTimeImmutable $dt): int {
  return intval($dt->format("H"))*3600 + intval($dt->format("i"))*60 + intval($dt->format("s"));
}
