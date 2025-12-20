import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

type Summary = {
  rtNeutralMs: number;
  rtEmotionalMs: number;
  accuracyNeutralPct: number;
  accuracyEmotionalPct: number;
  interferenceMs: number;
};

type BodyShape =
  | { summary: Summary; user_id?: string }
  | {
      rt_neutral_avg: number;
      rt_emotional_avg: number;
      accuracy_neutral: number;
      accuracy_emotional: number;
      interference_score: number;
      user_id?: string;
    };

const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export async function POST(req: NextRequest) {
  // Build a server-side Supabase client that uses auth cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => req.cookies.getAll(), setAll: () => {} } }
  );

  // Require an authenticated user
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Parse and normalize body
  let body: BodyShape;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Accept either { summary: {...} } or direct snake_case fields
  let rt_neutral_avg: number;
  let rt_emotional_avg: number;
  let accuracy_neutral: number;
  let accuracy_emotional: number;
  let interference_score: number;

  if ('summary' in body) {
    const s = body.summary;
    rt_neutral_avg = num(s?.rtNeutralMs);
    rt_emotional_avg = num(s?.rtEmotionalMs);
    accuracy_neutral = num(s?.accuracyNeutralPct);
    accuracy_emotional = num(s?.accuracyEmotionalPct);
    interference_score = num(s?.interferenceMs);
  } else {
    rt_neutral_avg = num((body as any)?.rt_neutral_avg);
    rt_emotional_avg = num((body as any)?.rt_emotional_avg);
    accuracy_neutral = num((body as any)?.accuracy_neutral);
    accuracy_emotional = num((body as any)?.accuracy_emotional);
    interference_score = num((body as any)?.interference_score);
  }

  // Basic validation
  const fields = { rt_neutral_avg, rt_emotional_avg, accuracy_neutral, accuracy_emotional, interference_score };
  const missing = Object.entries(fields).filter(([, v]) => !Number.isFinite(v));
  if (missing.length > 0) {
    return NextResponse.json(
      { error: 'Missing or invalid fields', details: missing.map(([k]) => k) },
      { status: 400 }
    );
  }

  // Optional: if user_id provided, ensure it matches the session user
  if ('user_id' in body && body.user_id && body.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden: user mismatch' }, { status: 403 });
  }

  // Insert into stroop_results
  const { data, error } = await supabase
    .from('stroop_results')
    .insert({
      user_id: user.id,
      rt_neutral_avg,
      rt_emotional_avg,
      accuracy_neutral,
      accuracy_emotional,
      interference_score,
      created_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, id: data?.id, data: fields }, { status: 200 });
}