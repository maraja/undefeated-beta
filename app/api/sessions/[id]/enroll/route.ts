import { NextResponse, NextRequest } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/utils/auth';

async function assignTeam(sessionId: string, playerId: string) {
  // Get the current number of teams
  const teamsResult = await query('SELECT id FROM teams WHERE session_id = $1', [sessionId]);
  const teamCount = teamsResult.rows.length;

  let teamId;
  if (teamCount < 2) {
    // If there are less than 2 teams, create a new team
    const newTeamResult = await query(
      'INSERT INTO teams (session_id, name) VALUES ($1, $2) RETURNING id',
      [sessionId, `Team ${teamCount + 1}`]
    );
    teamId = newTeamResult.rows[0].id;
  } else {
    // If there are already 2 teams, assign to the team with fewer players
    const teamSizesResult = await query(`
      SELECT t.id, COUNT(ps.player_id) as player_count
      FROM teams t
      LEFT JOIN player_sessions ps ON t.id = ps.team_id
      WHERE t.session_id = $1
      GROUP BY t.id
      ORDER BY player_count ASC
      LIMIT 1
    `, [sessionId]);
    teamId = teamSizesResult.rows[0].id;
  }

  // Assign the player to the team
  await query(
    'UPDATE player_sessions SET team_id = $1 WHERE player_id = $2 AND session_id = $3',
    [teamId, playerId, sessionId]
  );
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const decoded: any = await verifyAuth(token);

    // Check if the session is open for enrollment
    const sessionResult = await query('SELECT date FROM sessions WHERE id = $1', [params.id]);
    if (sessionResult.rows.length === 0) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const sessionDate = new Date(sessionResult.rows[0].date);
    if (sessionDate <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)) {
      return NextResponse.json({ error: 'Enrollment for this session is not yet open' }, { status: 400 });
    }

    // Enroll the player
    await query(
      'INSERT INTO player_sessions (player_id, session_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [decoded.id, params.id]
    );

    // Assign the player to a team
    await assignTeam(params.id, decoded.id);

    // Fetch updated session data
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

    const session = result.rows[0];
    session.date = new Date(session.date).toISOString().split('T')[0];
    session.canEnroll = new Date(session.date) > new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    return NextResponse.json({ session });
  } catch (error) {
    console.error('Error enrolling in session:', error);
    return NextResponse.json({ error: 'An error occurred while enrolling in the session' }, { status: 500 });
  }
}

