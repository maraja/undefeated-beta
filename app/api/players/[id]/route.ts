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
      SELECT p.id, p.name, p.email, p.points, p.games_played as "gamesPlayed", 
             p.win_rate as "winRate", p.position, p.bio, p.avatar_url as "avatarUrl",
             json_agg(
               DISTINCT jsonb_build_object(
                 'id', s.id,
                 'date', s.date,
                 'time', s.time,
                 'location', s.location
               )
             ) as "recentSessions"
      FROM players p
      LEFT JOIN player_sessions ps ON p.id = ps.player_id
      LEFT JOIN sessions s ON ps.session_id = s.id
      WHERE p.id = $1
      GROUP BY p.id
    `, [params.id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    const player = result.rows[0];
    player.recentSessions = player.recentSessions.filter(session => session.id !== null);

    return NextResponse.json({ player });
  } catch (error) {
    console.error('Error fetching player details:', error);
    return NextResponse.json({ error: 'An error occurred while fetching player details' }, { status: 500 });
  }
}

