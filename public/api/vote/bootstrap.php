<?php
declare(strict_types=1);

/**
 * Vote API bootstrap
 * - SQLite storage
 * - Cookie-based voter id (1 vote / poll / browser)
 * - Basic CORS (dev)
 */

function vote_json(array $data, int $status = 200): void {
  http_response_code($status);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  exit;
}

function vote_allowed_origins(): array {
  // Optional env override (comma separated)
  $env = getenv('VOTE_ALLOWED_ORIGINS');
  if ($env) {
    $parts = array_map('trim', explode(',', $env));
    return array_values(array_filter($parts));
  }

  return [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ];
}

function vote_apply_cors(): void {
  $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
  if (!$origin) return;

  $allowed = vote_allowed_origins();
  if (in_array($origin, $allowed, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
  }

  if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
  }
}

vote_apply_cors();

function vote_db_path(): string {
  $dataDir = __DIR__ . DIRECTORY_SEPARATOR . 'data';
  if (!is_dir($dataDir)) {
    @mkdir($dataDir, 0775, true);
  }
  return $dataDir . DIRECTORY_SEPARATOR . 'votes.sqlite';
}

function vote_pdo(): PDO {
  static $pdo = null;
  if ($pdo instanceof PDO) return $pdo;

  $path = vote_db_path();
  $pdo = new PDO('sqlite:' . $path);
  $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  $pdo->exec('PRAGMA journal_mode=WAL;');
  $pdo->exec('PRAGMA synchronous=NORMAL;');

  // Create schema
  $pdo->exec("
    CREATE TABLE IF NOT EXISTS votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      poll_id TEXT NOT NULL,
      voter_id TEXT NOT NULL,
      option_id TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  ");
  $pdo->exec("
    CREATE UNIQUE INDEX IF NOT EXISTS ux_votes_poll_voter
    ON votes(poll_id, voter_id);
  ");
  $pdo->exec("
    CREATE INDEX IF NOT EXISTS ix_votes_poll
    ON votes(poll_id);
  ");

  return $pdo;
}

function vote_uuidv4(): string {
  $data = random_bytes(16);
  $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);
  $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);
  return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}

function vote_cookie_secure(): bool {
  $https = $_SERVER['HTTPS'] ?? '';
  return !empty($https) && $https !== 'off';
}

function vote_get_voter_id(): string {
  $name = 'tadao_voter_id';
  $voterId = $_COOKIE[$name] ?? '';
  if (is_string($voterId) && preg_match('/^[a-f0-9\\-]{10,}$/i', $voterId)) {
    return $voterId;
  }

  $voterId = vote_uuidv4();
  setcookie($name, $voterId, [
    'expires' => time() + 60 * 60 * 24 * 365 * 2, // 2 years
    'path' => '/',
    'secure' => vote_cookie_secure(),
    'httponly' => true,
    'samesite' => 'Lax',
  ]);
  // Also set for current request
  $_COOKIE[$name] = $voterId;

  return $voterId;
}

function vote_current_poll_id(DateTimeImmutable $now = null): string {
  $now = $now ?? new DateTimeImmutable('now');

  // ISO-8601 year/week
  $year = (int)$now->format('o');
  $week = (int)$now->format('W');
  return sprintf('%04d-W%02d', $year, $week);
}

function vote_read_json_body(): array {
  $raw = file_get_contents('php://input');
  if (!$raw) return [];
  $data = json_decode($raw, true);
  return is_array($data) ? $data : [];
}

function vote_clean_poll_id(?string $pollId): ?string {
  if (!$pollId) return null;
  $pollId = trim($pollId);
  if (preg_match('/^\\d{4}-W\\d{2}$/', $pollId)) return $pollId;
  return null;
}

function vote_clean_option_id(?string $optionId): ?string {
  if (!$optionId) return null;
  $optionId = trim($optionId);
  if ($optionId === '') return null;

  // Limit length (avoid huge payloads)
  $max = 120;
  if (function_exists('mb_strlen') && function_exists('mb_substr')) {
    if (mb_strlen($optionId) > $max) $optionId = mb_substr($optionId, 0, $max);
  } else {
    if (strlen($optionId) > $max) $optionId = substr($optionId, 0, $max);
  }

  return $optionId;
}