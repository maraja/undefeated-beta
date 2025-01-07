import { NextResponse, NextRequest } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/utils/auth';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    await verifyAuth(token);

    const result = await query(`
      SELECT 
        s.id, 
        s.date, 
        s.time, 
        s.location, 
        s.season_id as "seasonId",
        COUNT(DISTINCT ps.player_id) as "playerCount",
        json_agg(
          DISTINCT jsonb_build_object(
            'id', g.id,
            'winnerId', g.winner_id,
            'teams', (
              SELECT json_agg(
                jsonb_build_object(
                  'id', t.id,
                  'name', t.name,
                  'players', (
                    SELECT json_agg(
                      jsonb_build_object(
                        'id', p.id,
                        'name', p.name,
                        'position', p.position
                      )
                    )
                    FROM player_teams pt
                    JOIN players p ON pt.player_id = p.id
                    WHERE pt.team_id = t.id
                  )
                )
              )
              FROM teams t
              WHERE t.game_id = g.id
            )
          )
        ) FILTER (WHERE g.id IS NOT NULL) as games
      FROM 
        sessions s
      LEFT JOIN 
        player_sessions ps ON s.id = ps.session_id
      LEFT JOIN 
        games g ON s.id = g.session_id
      WHERE 
        s.date >= CURRENT_DATE
      GROUP BY 
        s.id, s.date, s.time, s.location, s.season_id
      ORDER BY 
        s.date ASC
    `);

    const sessions = result.rows.map(session => ({
      ...session,
      date: new Date(session.date).toISOString().split('T')[0],
      canEnroll: new Date(session.date) > new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      games: session.games || []
    }));

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json({ error: 'An error occurred while fetching sessions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const decoded = await verifyAuth(token);
    if (!decoded.isAdmin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const { date, time, location, seasonId } = await request.json();

    if (!date || !time || !location || !seasonId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await query(
      'INSERT INTO sessions (date, time, location, season_id) VALUES ($1, $2, $3, $4) RETURNING id, date, time, location, season_id as "seasonId"',
      [date, time, location, seasonId]
    );

    const newSession = result.rows[0];
    return NextResponse.json({ session: newSession });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json({ error: 'An error occurred while creating the session' }, { status: 500 });
  }
}

