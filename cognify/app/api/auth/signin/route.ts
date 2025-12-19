import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabaseClient';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

   // Set session cookies if login is successful
  const response = NextResponse.json({ data }, { status: 200 });

  if (data.session) {
    // Set access_token and refresh_token as HTTP-only cookies
    response.cookies.set('sb-access-token', data.session.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: data.session.expires_in,
    });
    response.cookies.set('sb-refresh-token', data.session.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      // Set a long expiry for refresh token (e.g., 30 days)
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  console.log(data.session);  
  return response;
}