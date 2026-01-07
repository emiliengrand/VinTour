<?php
require_once __DIR__ . "/lib.php";
try {
  $pdo = db();
  $nStops = $pdo->query("SELECT COUNT(*) AS n FROM stops")->fetch()["n"] ?? 0;
  json_response(["ok" => true, "stops" => intval($nStops)]);
} catch (Exception $e) {
  error_response("DB error: " . $e->getMessage(), 500);
}
