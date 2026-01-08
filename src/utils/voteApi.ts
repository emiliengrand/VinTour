export type VoteResultsRow = {
  optionId: string;
  votes: number;
  percentage: number;
};

export type VoteResultsResponse = {
  ok: boolean;
  poll_id: string;
  total: number;
  results: VoteResultsRow[];
  error?: string;
};

export type VoteSessionResponse = {
  ok: boolean;
  poll_id: string;
  hasVoted: boolean;
  myVote?: string | null;
  error?: string;
};

function cleanBase(base: string): string {
  if (!base) return "";
  return base.endsWith("/") ? base.slice(0, -1) : base;
}

export function getApiBase(): string {
  // If you run PHP on another port/path (WAMP/MAMP), set this in .env.local:
  // VITE_API_BASE=http://localhost/tadao
  // (empty = same origin)
  const base = (import.meta as any).env?.VITE_API_BASE as string | undefined;
  return cleanBase(base ?? "");
}

export function apiUrl(path: string): string {
  const base = getApiBase();
  if (!path.startsWith("/")) path = "/" + path;
  return base ? `${base}${path}` : path;
}

// ISO week id like: 2026-W02
export function getPollId(date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // Thursday in current week decides the year.
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  const y = d.getUTCFullYear();
  const w = String(weekNo).padStart(2, "0");
  return `${y}-W${w}`;
}

export function getPreviousPollId(date = new Date()): string {
  const prev = new Date(date);
  prev.setDate(prev.getDate() - 7);
  return getPollId(prev);
}

export function getTimeLeftToNextWeek(date = new Date()): string {
  // End of week = next Monday 00:00 (local time)
  const d = new Date(date);
  const day = d.getDay(); // 0..6
  const daysToMonday = (8 - day) % 7 || 7; // 1..7
  const end = new Date(d);
  end.setDate(d.getDate() + daysToMonday);
  end.setHours(0, 0, 0, 0);

  let diffMs = end.getTime() - d.getTime();
  if (diffMs < 0) diffMs = 0;

  const totalMinutes = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes - days * 60 * 24) / 60);
  const minutes = totalMinutes - days * 60 * 24 - hours * 60;

  return `${days}j ${hours}h ${minutes}min`;
}

async function safeJson(res: Response): Promise<any> {
  const txt = await res.text();
  try {
    return JSON.parse(txt);
  } catch {
    return { ok: false, error: txt || "Réponse non JSON" };
  }
}

export async function voteSession(pollId: string): Promise<VoteSessionResponse> {
  const url = apiUrl(`/api/vote/session.php?poll_id=${encodeURIComponent(pollId)}`);
  const res = await fetch(url, { credentials: "include" });
  const data = await safeJson(res);
  return data as VoteSessionResponse;
}

export async function voteResults(pollId: string): Promise<VoteResultsResponse> {
  const url = apiUrl(`/api/vote/results.php?poll_id=${encodeURIComponent(pollId)}`);
  const res = await fetch(url, { credentials: "include" });
  const data = await safeJson(res);
  return data as VoteResultsResponse;
}

export async function castVote(
  pollId: string,
  optionId: string
): Promise<{ ok: boolean; error?: string; myVote?: string }> {
  const url = apiUrl("/api/vote/cast.php");
  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ poll_id: pollId, option_id: optionId }),
  });
  const data = await safeJson(res);
  return data as any;
}