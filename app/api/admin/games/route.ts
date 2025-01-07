import { NextResponse, NextRequest } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/utils/auth';

// CREATE (POST) operation
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

    const { sessionId, teams } = await request.json();

    if (!sessionId || !teams || teams.length < 2) {
      return NextResponse.json({ error: 'Invalid game data' }, { status: 400 });
    }

    const client = await query('BEGIN');

    try {
      const gameResult = await query(
        'INSERT INTO games (session_id) VALUES ($1) RETURNING id',
        [sessionId]
      );
      const gameId = gameResult.rows[0].id;

      for (const team of teams) {
        const teamResult = await query(
          'INSERT INTO teams (game_id, name) VALUES ($1, $2) RETURNING id',
          [gameId, team.name]
        );
        const teamId = teamResult.rows[0].id;

        for (const playerId of team.playerIds) {
          await query(
            'INSERT INTO player_teams (player_id, team_id) VALUES ($1, $2)',
            [playerId, teamId]
          );
        }
      }

      await query('COMMIT');

      return NextResponse.json({ message: 'Game created successfully', gameId });
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json({ error: 'An error occurred while creating the game' }, { status: 500 });
  }
}

// READ (GET) operation
export async function GET(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const decoded = await verifyAuth(token);
    if (!decoded.isAdmin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
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
      WHERE g.session_id = $1
      GROUP BY g.id
      ORDER BY g.id
    `, [sessionId]);

    return NextResponse.json({ games: result.rows });
  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json({ error: 'An error occurred while fetching games' }, { status: 500 });
  }
}

// UPDATE (PUT) operation
export async function PUT(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const decoded = await verifyAuth(token);
    if (!decoded.isAdmin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const { id, teams, winnerId } = await request.json();

    if (!id || !teams || teams.length < 2) {
      return NextResponse.json({ error: 'Invalid game data' }, { status: 400 });
    }

    const client = await query('BEGIN');

    try {
      await query('UPDATE games SET winner_id = $1 WHERE id = $2', [winnerId, id]);

      for (const team of teams) {
        await query('UPDATE teams SET name = $1 WHERE id = $2', [team.name, team.id]);

        await query('DELETE FROM player_teams WHERE team_id = $1', [team.id]);

        for (const playerId of team.playerIds) {
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

// DELETE operation
export async function DELETE(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const decoded = await verifyAuth(token);
    if (!decoded.isAdmin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Game ID is required' }, { status: 400 });
    }

    await query('DELETE FROM games WHERE id = $1', [id]);

    return NextResponse.json({ message: 'Game deleted successfully' });
  } catch (error) {
    console.error('Error deleting game:', error);
    return NextResponse.json({ error: 'An error occurred while deleting the game' }, { status: 500 });
  }
}

