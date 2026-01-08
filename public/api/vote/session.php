<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';

$pollId = vote_clean_poll_id($_GET['poll_id'] ?? null) ?? vote_current_poll_id();
$voterId = vote_get_voter_id();

try {
  $pdo = vote_pdo();
  $stmt = $pdo->prepare('SELECT option_id FROM votes WHERE poll_id = :poll AND voter_id = :voter LIMIT 1');
  $stmt->execute([':poll' => $pollId, ':voter' => $voterId]);
  $row = $stmt->fetch(PDO::FETCH_ASSOC);

  vote_json([
    'ok' => true,
    'poll_id' => $pollId,
    'hasVoted' => $row ? true : false,
    'myVote' => $row ? $row['option_id'] : null,
  ]);
} catch (Throwable $e) {
  vote_json([
    'ok' => false,
    'poll_id' => $pollId,
    'hasVoted' => false,
    'error' => 'DB error',
  ], 500);
}