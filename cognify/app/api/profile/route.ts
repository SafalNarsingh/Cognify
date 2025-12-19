import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';

export async function POST(request: Request) {
  try {
    const { full_name, age, gender, prior_mental_health_history, daily_routine, user_id } = await request.json();

    // Validate required fields
    if (!user_id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (!full_name || !age || !gender) {
      return NextResponse.json({ error: 'Full name, age, and gender are required' }, { status: 400 });
    }

    // Check if user profile already exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('user_profile')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from('user_profile')
        .update({
          full_name,
          age: parseInt(age),
          gender,
          prior_mental_health_history: prior_mental_health_history || null,
          daily_routine: daily_routine || null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user_id)
        .select()
        .single();

      if (error) {
        console.error('Error updating user profile:', error.message);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ data, message: 'Profile updated successfully' }, { status: 200 });
    } else {
      // Insert new profile
      const { data, error } = await supabase
        .from('user_profile')
        .insert([
          {
            user_id,
            full_name,
            age: parseInt(age),
            gender,
            prior_mental_health_history: prior_mental_health_history || null,
            daily_routine: daily_routine || null,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating user profile:', error.message);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ data, message: 'Profile created successfully' }, { status: 201 });
    }
  } catch (error) {
    console.error('ERROR PROCESSING REQUEST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('user_profile')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error.message);
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('ERROR FETCHING PROFILE:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}