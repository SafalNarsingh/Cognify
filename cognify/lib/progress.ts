// lib/progress.ts
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function updateDailyProgress(type: 'cognitive' | 'meditation', score: number) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const today = new Date().toISOString().split('T')[0];

  // 1. Fetch current daily entry
  const { data: existing } = await supabase
    .from('progress_entries')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .single();

  let cognitive = existing?.cognitive_score || 0;
  let meditation = existing?.meditation_score || 0;

  if (type === 'cognitive') cognitive = score;
  if (type === 'meditation') meditation = score;

  // 2. Calculate Improvement Index: 60% Cog + 40% Med
  const index = (cognitive * 0.6) + (meditation * 0.4);

  // 3. Save to Supabase
  await supabase.from('progress_entries').upsert({
    user_id: user.id,
    date: today,
    cognitive_score: cognitive,
    meditation_score: meditation,
    improvement_index: index,
  }, { onConflict: 'user_id, date' });
}