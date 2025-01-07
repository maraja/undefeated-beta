import { NextResponse, NextRequest } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/utils/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const decoded = await verifyAuth(token);
    
    // Check if the user is an admin
    const isAdmin = await query('SELECT is_admin FROM players WHERE id = $1', [decoded.id]);
    if (!isAdmin.rows[0]?.is_admin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const sessionId = params.id;

    // Fetch players enrolled in the session
    const result = await query(`
  SELECT 
    p.id, 
    p.name, 
    p.position, 
    p.avatar_url,
    ARRAY_AGG(DISTINCT t.id) as team_ids
  FROM 
    players p
  JOIN 
    player_sessions ps ON p.id = ps.player_id
  LEFT JOIN
    player_teams pt ON p.id = pt.player_id
  LEFT JOIN
    teams t ON pt.team_id = t.id
  LEFT JOIN
    games g ON t.game_id = g.id
  WHERE 
    ps.session_id = $1 AND (g.session_id = $1 OR g.session_id IS NULL)
  GROUP BY
    p.id, p.name, p.position, p.avatar_url
  ORDER BY 
    p.name ASC
`, [sessionId]);

    const players = result.rows.map(player => ({
      id: player.id,
      name: player.name,
      position: player.position,
      avatarUrl: player.avatar_url,
      teamIds: player.team_ids.filter((id: number) => id !== null)
    }));

    return NextResponse.json({ players });
  } catch (error) {
    console.error('Error fetching session players:', error);
    return NextResponse.json({ error: 'An error occurred while fetching session players' }, { status: 500 });
  }
}

