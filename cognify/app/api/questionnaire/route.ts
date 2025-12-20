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
  return Math.max(0, Math.min(1, sum / totalMax));
}

function classifySeverityPercent(pct: number): 'high' | 'moderate' | 'low' {
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
  
  // Filtering for the three target assessments
  const phqIds = Object.keys(answers).filter(k => k.startsWith('mh_'));   // PHQ-9
  const srsIds = Object.keys(answers).filter(k => k.startsWith('asd_'));  // SRS
  const mocaIds = Object.keys(answers).filter(k => k.startsWith('eld_')); // MoCA

  const phqScore = Math.round(normalizedAverage(phqIds, answers) * 100);
  const srsScore = Math.round(normalizedAverage(srsIds, answers) * 100);
  const mocaScore = Math.round(normalizedAverage(mocaIds, answers) * 100);

  const payload = {
    phq9_score: phqScore,
    phq9_severity: classifySeverityPercent(phqScore),
    srs_score: srsScore,
    srs_severity: classifySeverityPercent(srsScore),
    moca_score: mocaScore,
    moca_severity: classifySeverityPercent(mocaScore),
  };

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => req.cookies.getAll(), setAll: () => {} } }
  );

  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { error: upsertErr } = await supabase
    .from('result_q')
    .upsert(
      { user_id: user.id, ...payload, updated_at: new Date().toISOString() }, 
      { onConflict: 'user_id' }
    );

  if (upsertErr) return NextResponse.json({ error: upsertErr.message }, { status: 500 });

  const getConditionFromScores = (results: any) => {
  if (!results) return "Analyzing...";
  
  const scores = [
    { name: "Depressive Tendencies (PHQ-9)", score: results.phq9_score },
    { name: "Anxiety Patterns (GAD-7)", score: results.gad7_score },
    { name: "Attention/Executive Focus (ASRS)", score: results.asrs_score }
  ];

  // Sort to find the highest score
  const topCondition = scores.sort((a, b) => b.score - a.score)[0];

  // If all scores are very low (e.g., < 20%), return a general baseline
  if (topCondition.score < 20) return "Healthy Baseline / General Wellness";
  
  return topCondition.name;
  };

  return NextResponse.json({ success: true, data: payload }, { status: 200 });
}