import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

type Answers = Record<string, string>;

function optionToScore(option: string): number {
  switch (option) {
    case 'Not at all': return 0;
    case 'Rarely': return 1;
    case 'Frequently': return 2;
    case 'Always': return 3;
    default: return 0;
  }
}

function normalizedAverage(ids: string[], answers: Answers): number {
  const maxPerQ = 3;
  const totalMax = ids.length * maxPerQ;
  if (totalMax === 0) return 0;
  const sum = ids.reduce((acc, id) => acc + optionToScore(answers[id] ?? ''), 0);
  return Math.max(0, Math.min(1, sum / totalMax)); // 0..1
}

function classifySeverityPercent(pct: number): 'high' | 'moderate' | 'low' {
  // pct: 0..100
  if (pct > 65) return 'high';
  if (pct >= 35 && pct <= 65) return 'moderate';
  return 'low';
}

export async function POST(req: NextRequest) {
  let body: { answers?: Answers } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const answers = body.answers ?? {};
  // Group by prefixes from your questionnaire IDs
  const phqIds = Object.keys(answers).filter(k => k.startsWith('mh_')); // PHQ-9
  const gadIds = Object.keys(answers).filter(k => k.startsWith('ed_')); // GAD-7
  const asrsIds = Object.keys(answers).filter(k => k.startsWith('nd_')); // ASRS

  const phqNorm = normalizedAverage(phqIds, answers);
  const gadNorm = normalizedAverage(gadIds, answers);
  const asrsNorm = normalizedAverage(asrsIds, answers);

  // Convert to integer percentage 0..100 for int4 columns
  const phq9_score = Math.round(phqNorm * 100);
  const gad7_score = Math.round(gadNorm * 100);
  const asrs_score = Math.round(asrsNorm * 100);

  const payload = {
    phq9_score,
    phq9_severity: classifySeverityPercent(phq9_score),
    gad7_score,
    gad7_severity: classifySeverityPercent(gad7_score),
    asrs_score,
    asrs_severity: classifySeverityPercent(asrs_score),
    // mmse/ran/srs left null unless you send them in later flows
  };

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: () => {},
      },
    }
  );

  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const upsertData = { user_id: user.id, ...payload };
  const { error: upsertErr } = await supabase
    .from('questionnaire_results')
    .upsert(upsertData, { onConflict: 'user_id' });

  if (upsertErr) {
    return NextResponse.json({ error: upsertErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: upsertData }, { status: 200 });
}