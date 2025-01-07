import { NextResponse, NextRequest } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/utils/auth';

// READ (GET) operation for a single game
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const decoded = await verifyAuth(token);
    if (!decoded.isAdmin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const result = await query(`
      SELECT 
        g.id, 
        g.session_id as "sessionId", 
        g.winner_id as "winnerId",
        json_agg(
          json_build_object(
            'id', t.id,
            'name', t.name,
            'players', (
              SELECT json_agg(
                json_build_object(
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
        ) as teams
      FROM games g
      JOIN teams t ON g.id = t.game_id
      WHERE g.id = $1
      GROUP BY g.id
    `, [params.id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    return NextResponse.json({ game: result.rows[0] });
  } catch (error) {
    console.error('Error fetching game:', error);
    return NextResponse.json({ error: 'An error occurred while fetching the game' }, { status: 500 });
  }
}

// UPDATE (PUT) operation for a single game
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const decoded = await verifyAuth(token);
    if (!decoded.isAdmin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const { teams, winnerId } = await request.json();

    if (!teams || teams.length < 2) {
      return NextResponse.json({ error: 'Invalid game data' }, { status: 400 });
    }

    const client = await query('BEGIN');

    try {
      await query('UPDATE games SET winner_id = $1 WHERE id = $2', [winnerId, params.id]);

      for (const team of teams) {
        await query('UPDATE teams SET name = $1 WHERE id = $2', [team.name, team.id]);

        await query('DELETE FROM player_teams WHERE team_id = $1', [team.id]);

        for (const playerId of team.players.map((player: any) => player.id)) {
          await query(
            'INSERT INTO player_teams (player_id, team_id) VALUES ($1, $2)',
            [playerId, team.id]
          );
        }
      }

      await query('COMMIT');

      return NextResponse.json({ message: 'Game updated successfully' });
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error updating game:', error);
    return NextResponse.json({ error: 'An error occurred while updating the game' }, { status: 500 });
  }
}

// DELETE operation for a single game
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const decoded = await verifyAuth(token);
    if (!decoded.isAdmin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    await query('DELETE FROM games WHERE id = $1', [params.id]);

    return NextResponse.json({ message: 'Game deleted successfully' });
  } catch (error) {
    console.error('Error deleting game:', error);
    return NextResponse.json({ error: 'An error occurred while deleting the game' }, { status: 500 });
  }
}

