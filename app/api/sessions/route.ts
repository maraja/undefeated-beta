import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: Request) {
  const body = await request.json();
  const { date, time, location } = body;

  if (!date || !time || !location) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const result = await sql`
      INSERT INTO sessions (date, time, location)
      VALUES (${date}, ${time}, ${location})
      RETURNING id, date, time, location
    `;
    const newSession = result.rows[0];
    return NextResponse.json({ session: newSession });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json({ error: 'An error occurred while creating the session' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const result = await sql`SELECT id, date, time, location FROM sessions`;
    return NextResponse.json({ sessions: result.rows });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json({ error: 'An error occurred while fetching sessions' }, { status: 500 });
  }
}

