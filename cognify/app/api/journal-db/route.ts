import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

type AnalyzerResponse = {
  Sentiment?: string;                       // expects sentiment_type enum values
  'Detected Emotions'?: string | string[];  // free text
  'Cognitive Distortion'?: string;          // free text
  'Mental Health Signal'?: string;          // expects mental_condition enum values
};

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Helpers to normalize enum inputs
const normalizeSentiment = (v: any): 'positive' | 'negative' | 'neutral' | null => {
  const s = String(v ?? '').trim().toLowerCase();
  if (!s) return null;
  if (s.includes('pos')) return 'positive';
  if (s.includes('neg')) return 'negative';
  if (s.includes('neu')) return 'neutral';
  // unknown string — reject to avoid enum error
  return null;
};

const normalizeMentalCondition = (v: any): 'anxiety' | 'depression' | 'adhd' | null => {
  const s = String(v ?? '').trim().toLowerCase();
  if (!s) return null;
  if (s.includes('adhd') || s.includes('attention')) return 'adhd';
  if (s.includes('depres')) return 'depression';
  if (s.includes('anx')) return 'anxiety';
  // unknown string — reject to avoid enum error
  return null;
};

const toFloatOrNull = (v: any): number | null => {
  const n = typeof v === 'string' ? Number.parseFloat(v) : Number(v);
  return Number.isFinite(n) ? n : null;
};

const toText = (v: any): string | null => {
  if (v == null) return null;
  if (typeof v === 'string') return v;
  if (Array.isArray(v)) return v.map((x) => String(x ?? '')).filter(Boolean).join(', ') || null;
  try { return JSON.stringify(v); } catch { return String(v); }
};

export async function POST(req: NextRequest) {
  try {
    if (!SUPABASE_URL) {
      return NextResponse.json({ detail: 'Missing SUPABASE_URL' }, { status: 500 });
    }

    const payload = await req.json();

    const user_id = payload?.user_id as string | undefined;
    const journal_id = payload?.journal_id as string | undefined;
    const access_token = payload?.access_token as string | undefined;

    const analysis: AnalyzerResponse =
      payload?.analysis ?? {
        Sentiment: payload?.Sentiment,
        'Detected Emotions': payload?.['Detected Emotions'],
        'Cognitive Distortion': payload?.['Cognitive Distortion'],
        'Mental Health Signal': payload?.['Mental Health Signal'],
      };

    if (!user_id || !journal_id || !analysis) {
      return NextResponse.json(
        { detail: 'user_id, journal_id, and analysis are required' },
        { status: 400 }
      );
    }

    // Create Supabase client:
    // - Prefer service role (bypasses RLS).
    // - Otherwise use anon + Authorization header from the caller’s access_token to satisfy RLS.
    const supabase = SERVICE_KEY
      ? createClient(SUPABASE_URL, SERVICE_KEY)
      : createClient(SUPABASE_URL, ANON_KEY, {
          global: access_token ? { headers: { Authorization: `Bearer ${access_token}` } } : undefined,
        });

    // If not using service role, ensure we have an authenticated user context and it matches user_id
    if (!SERVICE_KEY) {
      if (!access_token) {
        return NextResponse.json(
          { detail: 'Missing access_token and no service role key configured' },
          { status: 401 }
        );
      }
      const { data: authUser, error: authErr } = await supabase.auth.getUser();
      if (authErr) {
        return NextResponse.json({ detail: 'Auth check failed', message: authErr.message }, { status: 401 });
      }
      if (!authUser?.user?.id || authUser.user.id !== user_id) {
        return NextResponse.json({ detail: 'Forbidden: user mismatch' }, { status: 403 });
      }
    }

    // Normalize values to match DB schema (enums + types)
    const sentiment = normalizeSentiment(analysis.Sentiment);
    const dominant_prediction = normalizeMentalCondition(analysis['Mental Health Signal']);
    const detected_emotions = toText(analysis['Detected Emotions']);
    const cognitive_distortion = toText(analysis['Cognitive Distortion']);

    const insertPayload = {
      journal_id,
      user_id,
      sentiment,                      // sentiment_type enum: 'positive' | 'negative' | 'neutral' | null
      cognitive_distortion,           // text
      dominant_prediction,            // mental_condition enum: 'anxiety' | 'depression' | 'adhd' | null
      detected_emotions,              // text
      model_version: process.env.JOURNAL_MODEL_VERSION ?? 'cognify-v1',
      anxiety_score: toFloatOrNull(payload?.anxiety_score),
      depression_score: toFloatOrNull(payload?.depression_score),
      adhd_score: toFloatOrNull(payload?.adhd_score),
    };

    // Insert; avoid post-insert select unless using service role
    const insertQuery = supabase.from('journal_analysis').insert(insertPayload);

    const { data, error } = SERVICE_KEY
      ? await insertQuery.select('id').single()
      : await insertQuery;

    if (error) {
      return NextResponse.json(
        {
          detail: 'Insert failed',
          message: error.message,
          hint: (error as any)?.hint,
          code: (error as any)?.code,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: 'ok',
      journal_analysis_id: (data as any)?.id,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'journal-db insert failed', detail: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}