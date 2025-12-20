import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'


import { supabase } from '@/lib/supabaseClient'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { metrics, user } = body

    if (!user?.id) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    // Map metrics → DB columns explicitly (no spreading)
    const insertPayload = {
      user_id: user.id,
      accuracy: metrics.accuracy,
      hits: metrics.hits,
      misses: metrics.misses,
      falsePositives: metrics.falsePositives,
      correctRejections: metrics.correctRejections,
      avgReactionTime: metrics.avgReactionTime,
      totalTrials: metrics.totalTrials,
      totalTargets: metrics.totalTargets,
    }

    const { data, error } = await supabase
      .from('nback')
      .insert(insertPayload)
      .select()
      .single()

    if (error) {
      console.error('DB insert error:', error)
      return NextResponse.json(
        { error: 'Failed to save metrics' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      session: data,
    })
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json(
      { error: 'Invalid request payload' },
      { status: 400 }
    )
  }
}
