import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const UPSTREAM = process.env.JOURNAL_API_BASE ?? 'http://10.10.254.183:8000';
const SUMMARIZER_PATH = '/summarizer';

const SUPABASE_URL =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function makeSupabase(access_token?: string) {
  if (!SUPABASE_URL) throw new Error('Missing SUPABASE_URL');
  if (SERVICE_KEY) return createClient(SUPABASE_URL, SERVICE_KEY);
  return createClient(SUPABASE_URL, ANON_KEY, {
    global: access_token ? { headers: { Authorization: `Bearer ${access_token}` } } : undefined,
  });
}

function mapSeverityToRiskLabel(severity?: string | null): string {
  const s = (severity || '').toLowerCase();
  if (!s) return 'Unknown';
  if (s.includes('none') || s.includes('minimal') || s.includes('mild') || s.includes('low')) return 'Low risk';
  if (s.includes('moderate')) return 'Moderate risk';
  if (s.includes('severe') || s.includes('high')) return 'High risk';
  return 'Unknown';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const user_id = body?.user_id as string | undefined;
    const access_token = body?.access_token as string | undefined;
    const journal_id = body?.journal_id as string | undefined;
    const limit = Number.isFinite(body?.limit) ? Math.max(1, Math.min(50, body.limit)) : 10;

    if (!user_id) {
      return NextResponse.json(
        { detail: [{ type: 'value_error', loc: ['body', 'user_id'], msg: 'user_id is required' }] },
        { status: 400 }
      );
    }

    const supabase = makeSupabase(access_token);

    if (!SERVICE_KEY) {
      if (!access_token) {
        return NextResponse.json({ detail: 'Missing access_token without service role' }, { status: 401 });
      }
      const { data: authUser, error: authErr } = await supabase.auth.getUser();
      if (authErr) return NextResponse.json({ detail: 'Auth check failed', message: authErr.message }, { status: 401 });
      if (!authUser?.user?.id || authUser.user.id !== user_id) {
        return NextResponse.json({ detail: 'Forbidden: user mismatch' }, { status: 403 });
      }
    }

    let jQuery = supabase
      .from('journals')
      .select('id, user_id, content, created_at')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (journal_id) {
      jQuery = supabase
        .from('journals')
        .select('id, user_id, content, created_at')
        .eq('id', journal_id)
        .limit(1);
    }

    const { data: journals, error: jErr } = await jQuery;
    if (jErr) return NextResponse.json({ detail: 'journals fetch failed', message: jErr.message }, { status: 500 });
    if (!journals || journals.length === 0) {
      return NextResponse.json({ detail: 'No journals found for user' }, { status: 404 });
    }

    const journalIds = journals.map((j) => j.id);
    const { data: analyses, error: aErr } = await supabase
      .from('journal_analysis')
      .select(
        'id, journal_id, user_id, sentiment, cognitive_distortion, dominant_prediction, detected_emotions'
      )
      .in('journal_id', journalIds)
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });
    if (aErr) return NextResponse.json({ detail: 'journal_analysis fetch failed', message: aErr.message }, { status: 500 });

    const analysisByJournal = new Map<string, any>();
    (analyses || []).forEach((a) => analysisByJournal.set(a.journal_id, a));

    const journalPayload = journals.map((j) => {
      const a = analysisByJournal.get(j.id);
      return {
        id: String(j.id),
        content: j.content ?? '',
        user_id: j.user_id,
        sentiment: a?.sentiment ?? '',
        cognitive_distortion: a?.cognitive_distortion ?? '',
        dominant_prediction: a?.dominant_prediction ?? '',
        detected_emotions: a?.detected_emotions ?? '',
      };
    });

    const { data: profileRow, error: pErr } = await supabase
      .from('user_profile')
      .select('full_name, age, gender, prior_mental_health_history, daily_routine')
      .eq('user_id', user_id)
      .single();
    if (pErr && pErr.code !== 'PGRST116') {
      return NextResponse.json({ detail: 'user_profile fetch failed', message: pErr.message }, { status: 500 });
    }

    const { data: results, error: rErr } = await supabase
      .from('result_q')
      .select('*')
      .eq('user_id', user_id)
      .single();
    if (rErr && rErr.code !== 'PGRST116') {
      return NextResponse.json({ detail: 'result_q fetch failed', message: rErr.message }, { status: 500 });
    }

    const phq9 = Number(results?.phq9_score ?? 0);
    const gad7 = Number(results?.gad7_score ?? 0);
    const asrs = Number(results?.asrs_score ?? 0);
    const top = [{ v: phq9 }, { v: gad7 }, { v: asrs }].sort((a, b) => b.v - a.v)[0];
    const baseline = (top?.v ?? 0) > 50 ? 'Elevated risk' : 'Stable';
    const severity = mapSeverityToRiskLabel(results?.phq9_severity ?? null);

    const payload = {
      journal: journalPayload,
      user_profile: profileRow
        ? {
            fullname: profileRow.full_name ?? '',
            age: profileRow.age ?? null,
            gender: profileRow.gender ?? '',
            prior_mental_health_issue: profileRow.prior_mental_health_history ?? '',
            daily_routine: profileRow.daily_routine ?? '',
          }
        : {
            fullname: '',
            age: null,
            gender: '',
            prior_mental_health_issue: '',
            daily_routine: '',
          },
      user_status: {
        baseline,
        severity,
      },
    };

    const upstream = await fetch(`${UPSTREAM}${SUMMARIZER_PATH}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const bodyText = await upstream.text();
    return new NextResponse(bodyText, {
      status: upstream.status,
      headers: { 'Content-Type': upstream.headers.get('content-type') ?? 'application/json' },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'journal-summarizer failed', detail: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}