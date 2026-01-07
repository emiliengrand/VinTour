<?php
require_once __DIR__ . "/lib.php";

json_response([
  "php_version" => PHP_VERSION,
  "sapi" => php_sapi_name(),
  "pdo_drivers" => PDO::getAvailableDrivers(),
  "extensions" => [
    "pdo" => extension_loaded("pdo"),
    "pdo_sqlite" => extension_loaded("pdo_sqlite"),
    "sqlite3" => extension_loaded("sqlite3"),
  ],
  "db_file_exists" => file_exists(__DIR__ . "/../data/gtfs.sqlite"),
  "timezone" => date_default_timezone_get(),
]);
