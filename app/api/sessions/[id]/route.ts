import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const result = await query(`
      SELECT s.id, s.date, s.time, s.location, 
             json_agg(DISTINCT jsonb_build_object(
               'id', t.id,
               'name', t.name,
               'players', (
                 SELECT json_agg(jsonb_build_object('id', p.id, 'name', p.name, 'position', p.position))
                 FROM player_sessions ps2
                 JOIN players p ON ps2.player_id = p.id
                 WHERE ps2.team_id = t.id
               )
             )) as teams
      FROM sessions s
      LEFT JOIN teams t ON s.id = t.session_id
      LEFT JOIN player_sessions ps ON t.id = ps.team_id
      WHERE s.id = $1
      GROUP BY s.id, s.date, s.time, s.location
    `, [params.id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const session = result.rows[0];
    session.date = new Date(session.date).toISOString().split('T')[0];
    session.canEnroll = new Date(session.date) > new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    return NextResponse.json({ session });
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json({ error: 'An error occurred while fetching the session' }, { status: 500 });
  }
}

