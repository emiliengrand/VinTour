<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  vote_json(['ok' => false, 'error' => 'method_not_allowed'], 405);
}

$body = vote_read_json_body();
$pollId = vote_clean_poll_id($body['poll_id'] ?? null) ?? vote_current_poll_id();
$optionId = vote_clean_option_id($body['option_id'] ?? null);

if (!$optionId) {
  vote_json(['ok' => false, 'error' => 'missing_option'], 400);
}

$voterId = vote_get_voter_id();

try {
  $pdo = vote_pdo();

  // If already voted, return that vote
  $check = $pdo->prepare('SELECT option_id FROM votes WHERE poll_id = :poll AND voter_id = :voter LIMIT 1');
  $check->execute([':poll' => $pollId, ':voter' => $voterId]);
  $existing = $check->fetch(PDO::FETCH_ASSOC);

  if ($existing) {
    vote_json([
      'ok' => false,
      'error' => 'already_voted',
      'poll_id' => $pollId,
      'myVote' => $existing['option_id'],
    ], 409);
  }

  $insert = $pdo->prepare('
    INSERT INTO votes (poll_id, voter_id, option_id, created_at)
    VALUES (:poll, :voter, :opt, :ts)
  ');
  $insert->execute([
    ':poll' => $pollId,
    ':voter' => $voterId,
    ':opt' => $optionId,
    ':ts' => (new DateTimeImmutable('now'))->format(DateTimeInterface::ATOM),
  ]);

  vote_json([
    'ok' => true,
    'poll_id' => $pollId,
    'myVote' => $optionId,
  ]);
} catch (Throwable $e) {
  vote_json(['ok' => false, 'error' => 'db_error'], 500);
}