import { NextRequest, NextResponse } from 'next/server';

const UPSTREAM = process.env.JOURNAL_API_BASE ?? 'http://10.10.254.183:8000';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    let text: string | undefined;
    if (typeof payload?.text === 'string') {
      text = payload.text;
    } else if (Array.isArray(payload?.entries)) {
      text = payload.entries.filter((s: any) => typeof s === 'string' && s.trim())
                            .join('\n\n');
    }

    if (!text || !text.trim()) {
      return NextResponse.json(
        { detail: [{ type: 'value_error', loc: ['body', 'text'], msg: 'text is required', input: payload }] },
        { status: 400 }
      );
    }

    const upstream = await fetch(`${UPSTREAM}/analyzemulti`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    const bodyText = await upstream.text();
    return new NextResponse(bodyText, {
      status: upstream.status,
      headers: { 'Content-Type': upstream.headers.get('content-type') ?? 'application/json' },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Journal analysis proxy failed', detail: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}