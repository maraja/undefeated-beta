import { NextResponse, NextRequest } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/utils/auth';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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
        s.id = $1
      GROUP BY 
        s.id, s.date, s.time, s.location, s.season_id
    `, [params.id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const session = result.rows[0];
    session.date = new Date(session.date).toISOString().split('T')[0];
    session.canEnroll = new Date(session.date) > new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    session.games = session.games || [];

    return NextResponse.json({ session });
  } catch (error) {
    console.error('Error fetching session details:', error);
    return NextResponse.json({ error: 'An error occurred while fetching session details' }, { status: 500 });
  }
}

