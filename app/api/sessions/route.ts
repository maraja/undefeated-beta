import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query(`
      SELECT s.id, s.date, s.time, s.location, 
             COUNT(ps.player_id) as player_count
      FROM sessions s
      LEFT JOIN player_sessions ps ON s.id = ps.session_id
      WHERE s.date >= CURRENT_DATE
      GROUP BY s.id, s.date, s.time, s.location
      ORDER BY s.date ASC
    `);

    const sessions = result.rows.map(session => ({
      ...session,
      date: new Date(session.date).toISOString().split('T')[0],
      canEnroll: new Date(session.date) > new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    }));

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json({ error: 'An error occurred while fetching sessions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { date, time, location } = await request.json();

    if (!date || !time || !location) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await query(
      'INSERT INTO sessions (date, time, location) VALUES ($1, $2, $3) RETURNING id, date, time, location',
      [date, time, location]
    );

    const newSession = result.rows[0];
    return NextResponse.json({ session: newSession });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json({ error: 'An error occurred while creating the session' }, { status: 500 });
  }
}

