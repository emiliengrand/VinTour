<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';

$pollId = vote_clean_poll_id($_GET['poll_id'] ?? null) ?? vote_current_poll_id();

try {
  $pdo = vote_pdo();

  $stmt = $pdo->prepare('
    SELECT option_id, COUNT(*) as votes
    FROM votes
    WHERE poll_id = :poll
    GROUP BY option_id
    ORDER BY votes DESC, option_id ASC
  ');
  $stmt->execute([':poll' => $pollId]);
  $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

  $total = 0;
  foreach ($rows as $r) {
    $total += (int)$r['votes'];
  }

  $out = [];
  foreach ($rows as $r) {
    $votes = (int)$r['votes'];
    $pct = $total > 0 ? (int)round(($votes / $total) * 100) : 0;
    $out[] = [
      'optionId' => $r['option_id'],
      'votes' => $votes,
      'percentage' => $pct,
    ];
  }

  vote_json([
    'ok' => true,
    'poll_id' => $pollId,
    'total' => $total,
    'results' => $out,
  ]);
} catch (Throwable $e) {
  vote_json(['ok' => false, 'error' => 'db_error'], 500);
}