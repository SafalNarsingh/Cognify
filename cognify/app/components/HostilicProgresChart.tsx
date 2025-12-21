"use client";

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function HolisticProgressChart() {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function fetchEntries() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('progress_entries')
        .select('date, cognitive_score, meditation_score')
        .eq('user_id', user.id)
        .order('date', { ascending: true })
        .limit(7);

      if (data && data.length > 0) {
        setChartData({
          labels: data.map(d => new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })),
          datasets: [
            {
              label: 'Cognitive (60%)',
              data: data.map(d => (d.cognitive_score || 0) * 0.6),
              backgroundColor: '#5F7A7B',
              borderRadius: 8,
            },
            {
              label: 'Meditation (40%)',
              data: data.map(d => (d.meditation_score || 0) * 0.4),
              backgroundColor: '#D1D1D1',
              borderRadius: 8,
            },
          ],
        });
      }
      setLoading(false);
    }
    fetchEntries();
  }, [supabase]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.dataset.label}: ${context.raw.toFixed(1)}%`
        }
      }
    },
    scales: {
      x: { stacked: true, grid: { display: false } },
      y: { stacked: true, beginAtZero: true, max: 100, grid: { color: '#f8f8f8' } }
    },
  };

  if (loading) return <div className="h-full flex items-center justify-center text-[10px] text-gray-400 uppercase tracking-widest">Updating Index...</div>;
  if (!chartData) return <div className="h-full flex items-center justify-center text-[10px] text-gray-400 uppercase tracking-widest">Complete a task to see progress</div>;

  return <Bar data={chartData} options={options} />;
}