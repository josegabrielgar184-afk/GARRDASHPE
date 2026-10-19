import { auth } from '@/lib/firebase';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function headers(): Record<string, string> {
  return { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}`, 'Content-Type': 'application/json' };
}

export interface PollOption {
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  options: string[];
  is_active: boolean;
  created_at: string;
  closed_at: string | null;
  my_vote?: number | null;
  total_votes: number;
}

export interface AdminPoll extends Poll {
  votes_breakdown: number[];
}

function parsePoll(row: any, myVoteMap?: Map<string, number>): Poll {
  const votes: any[] = row.votes ?? [];
  const breakdown = new Array(row.options.length).fill(0);
  for (const v of votes) {
    if (typeof v.option_index === 'number' && v.option_index >= 0 && v.option_index < row.options.length) {
      breakdown[v.option_index]++;
    }
  }
  return {
    id: row.id,
    question: row.question,
    options: row.options,
    is_active: row.is_active,
    created_at: row.created_at,
    closed_at: row.closed_at,
    my_vote: myVoteMap?.get(row.id) ?? null,
    total_votes: votes.length,
  };
}

// Jugador: obtener encuesta activa + si ya votó
export async function fetchActivePoll(): Promise<Poll | null> {
  const user = auth.currentUser;
  if (!user) return null;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/polls?select=id,question,options,votes,is_active,created_at,closed_at&is_active=eq.true&limit=1&order=created_at.desc`,
      { headers: headers() },
    );
    if (!res.ok) return null;
    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) return null;

    // Check if user already voted
    const pollId = rows[0].id;
    const voteRes = await fetch(
      `${SUPABASE_URL}/rest/v1/poll_votes?select=option_index&poll_id=eq.${encodeURIComponent(pollId)}&uid=eq.${encodeURIComponent(user.uid)}`,
      { headers: headers() },
    );
    let myVote: number | null = null;
    if (voteRes.ok) {
      const voteRows = await voteRes.json();
      if (Array.isArray(voteRows) && voteRows.length > 0) {
        myVote = voteRows[0].option_index;
      }
    }
    const myVoteMap = new Map<string, number>();
    if (myVote !== null) myVoteMap.set(pollId, myVote);
    return parsePoll(rows[0], myVoteMap);
  } catch {
    return null;
  }
}

// Jugador: votar
export async function submitVote(pollId: string, optionIndex: number): Promise<{ ok: boolean; duplicate?: boolean }> {
  const user = auth.currentUser;
  if (!user) return { ok: false };
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/poll_votes`, {
      method: 'POST',
      headers: { ...headers(), Prefer: 'return=minimal' },
      body: JSON.stringify({ poll_id: pollId, uid: user.uid, option_index: optionIndex }),
    });
    if (res.ok) return { ok: true };
    if (res.status === 409) return { ok: false, duplicate: true };
    return { ok: false };
  } catch {
    return { ok: false };
  }
}

// Admin: obtener todas las encuestas (via service role edge function)
export async function fetchAdminPolls(): Promise<AdminPoll[]> {
  const user = auth.currentUser;
  if (!user) return [];
  try {
    const token = await user.getIdToken();
    const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-ops`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'polls_list' }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data.polls)) return [];
    return data.polls.map((r: any) => ({
      ...parsePoll(r),
      votes_breakdown: (() => {
        const breakdown = new Array(r.options.length).fill(0);
        for (const v of (r.votes ?? [])) {
          if (typeof v.option_index === 'number' && v.option_index >= 0 && v.option_index < r.options.length) {
            breakdown[v.option_index]++;
          }
        }
        return breakdown;
      })(),
    }));
  } catch {
    return [];
  }
}

// Admin: crear encuesta
export async function createPoll(question: string, options: string[]): Promise<{ ok: boolean; error?: string }> {
  const user = auth.currentUser;
  if (!user) return { ok: false, error: 'No autenticado' };
  if (options.length < 2 || options.length > 5) return { ok: false, error: 'Debe tener 2-5 respuestas' };
  try {
    const token = await user.getIdToken();
    const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-ops`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'polls_create', question, options }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { ok: false, error: data.error || 'Error al crear' };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: 'Error de red' };
  }
}

// Admin: cerrar encuesta
export async function closePoll(pollId: string): Promise<{ ok: boolean }> {
  const user = auth.currentUser;
  if (!user) return { ok: false };
  try {
    const token = await user.getIdToken();
    const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-ops`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'polls_close', poll_id: pollId }),
    });
    return { ok: res.ok };
  } catch {
    return { ok: false };
  }
}

// Admin: eliminar encuesta
export async function deletePoll(pollId: string): Promise<{ ok: boolean }> {
  const user = auth.currentUser;
  if (!user) return { ok: false };
  try {
    const token = await user.getIdToken();
    const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-ops`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'polls_delete', poll_id: pollId }),
    });
    return { ok: res.ok };
  } catch {
    return { ok: false };
  }
}
