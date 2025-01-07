import { Pool } from 'pg';
import { sql } from '@vercel/postgres';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function query(text: string, params?: any[]) {
  try {
    if (process.env.POSTGRES_URL) {
      // Use @vercel/postgres when deploying to Vercel
      return await sql.query(text, params);
    } else {
      // Use regular pool for local development
      return await pool.query(text, params);
    }
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Existing functions...

// New functions for seasons
export async function createSeason(name: string, startDate: string, endDate: string) {
  const result = await query(
    'INSERT INTO seasons (name, start_date, end_date) VALUES ($1, $2, $3) RETURNING *',
    [name, startDate, endDate]
  );
  return result.rows[0];
}

export async function getAllSeasons() {
  const result = await query('SELECT * FROM seasons ORDER BY start_date DESC');
  return result.rows;
}

export async function updateSeason(id: number, name: string, startDate: string, endDate: string) {
  const result = await query(
    'UPDATE seasons SET name = $1, start_date = $2, end_date = $3 WHERE id = $4 RETURNING *',
    [name, startDate, endDate, id]
  );
  return result.rows[0];
}

export async function deleteSeason(id: number) {
  await query('DELETE FROM seasons WHERE id = $1', [id]);
}

// New functions for sessions
export async function createSession(date: string, time: string, location: string, seasonId: number) {
  const result = await query(
    'INSERT INTO sessions (date, time, location, season_id) VALUES ($1, $2, $3, $4) RETURNING *',
    [date, time, location, seasonId]
  );
  return result.rows[0];
}

export async function getAllSessions() {
  const result = await query(`
    SELECT s.*, se.name as season_name 
    FROM sessions s 
    JOIN seasons se ON s.season_id = se.id 
    ORDER BY s.date DESC
  `);
  return result.rows;
}

export async function updateSession(id: number, date: string, time: string, location: string, seasonId: number) {
  const result = await query(
    'UPDATE sessions SET date = $1, time = $2, location = $3, season_id = $4 WHERE id = $5 RETURNING *',
    [date, time, location, seasonId, id]
  );
  return result.rows[0];
}

export async function deleteSession(id: number) {
  await query('DELETE FROM sessions WHERE id = $1', [id]);
}

// New functions for invite codes
export async function createInviteCode(code: string) {
  const result = await query(
    'INSERT INTO invite_codes (code) VALUES ($1) RETURNING *',
    [code]
  );
  return result.rows[0];
}

export async function getAllInviteCodes() {
  const result = await query('SELECT * FROM invite_codes ORDER BY id DESC');
  return result.rows;
}

export async function markInviteCodeAsUsed(id: number) {
  await query('UPDATE invite_codes SET is_used = TRUE WHERE id = $1', [id]);
}

// New functions for games
export async function createGame(sessionId: number, teams: { name: string, playerIds: number[] }[], winnerId?: number) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const gameResult = await client.query(
      'INSERT INTO games (session_id, winner_id) VALUES ($1, $2) RETURNING id',
      [sessionId, winnerId]
    );
    
    const gameId = gameResult.rows[0].id;

    for (const team of teams) {
      const teamResult = await client.query(
        'INSERT INTO teams (game_id, name) VALUES ($1, $2) RETURNING id',
        [gameId, team.name]
      );
      const teamId = teamResult.rows[0].id;

      for (const playerId of team.playerIds) {
        await client.query(
          'INSERT INTO player_teams (player_id, team_id) VALUES ($1, $2)',
          [playerId, teamId]
        );
      }
    }

    await client.query('COMMIT');

    return { id: gameId, sessionId, teams, winnerId };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function getGamesBySession(sessionId: number) {
  const result = await query(`
    SELECT g.id, g.winner_id,
           json_agg(json_build_object(
             'id', t.id,
             'name', t.name,
             'players', (
               SELECT json_agg(json_build_object('id', p.id, 'name', p.name, 'position', p.position))
               FROM player_teams pt
               JOIN players p ON pt.player_id = p.id
               WHERE pt.team_id = t.id
             )
           )) as teams
    FROM games g
    JOIN teams t ON g.id = t.game_id
    WHERE g.session_id = $1
    GROUP BY g.id
    ORDER BY g.id
  `, [sessionId]);

  return result.rows;
}

export async function updateGame(id: number, teams: { id: number, name: string, playerIds: number[] }[], winnerId?: number) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query('UPDATE games SET winner_id = $1 WHERE id = $2', [winnerId, id]);

    for (const team of teams) {
      await client.query('UPDATE teams SET name = $1 WHERE id = $2', [team.name, team.id]);

      await client.query('DELETE FROM player_teams WHERE team_id = $1', [team.id]);

      for (const playerId of team.playerIds) {
        await client.query(
          'INSERT INTO player_teams (player_id, team_id) VALUES ($1, $2)',
          [playerId, team.id]
        );
      }
    }

    await client.query('COMMIT');

    return { id, teams, winnerId };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteGame(id: number) {
  await query('DELETE FROM games WHERE id = $1', [id]);
}

export async function getAllPlayers() {
    const result = await query('SELECT * FROM players');
    return result.rows;
  }

// Update existing createPlayer function to use invite code
export async function createPlayer(name: string, email: string, hashedPassword: string) {
    const result = await query(
      'INSERT INTO players (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hashedPassword]
    );
    return result.rows[0];
  }

// New function to check if a user is an admin
export async function isUserAdmin(userId: number): Promise<boolean> {
  const result = await query('SELECT is_admin FROM players WHERE id = $1', [userId]);
  return result.rows[0]?.is_admin || false;
}

// Function to get a player by email
export async function getPlayerByEmail(email: string) {
    const result = await query('SELECT * FROM players WHERE email = $1', [email]);
    return result.rows[0];
  }
  
  // Function to get a player by id
  export async function getPlayerById(id: number) {
    const result = await query('SELECT * FROM players WHERE id = $1', [id]);
    return result.rows[0];
  }
  
  // Function to update player profile
  export async function updatePlayerProfile(id: number, name: string, position: string, bio: string) {
    const result = await query(
      'UPDATE players SET name = $1, position = $2, bio = $3 WHERE id = $4 RETURNING *',
      [name, position, bio, id]
    );
    return result.rows[0];
  }
  
  // Function to enroll a player in a session
  export async function enrollPlayerInSession(playerId: number, sessionId: number, teamId: number) {
    const result = await query(
      'INSERT INTO player_sessions (player_id, session_id, team_id) VALUES ($1, $2, $3) RETURNING *',
      [playerId, sessionId, teamId]
    );
    return result.rows[0];
  }
  
  export async function getPlayerSeasons(playerId: number) {
    const result = await query(`
      SELECT s.id, s.name, s.start_date, s.end_date
      FROM seasons s
      JOIN player_seasons ps ON s.id = ps.season_id
      WHERE ps.player_id = $1
      ORDER BY s.start_date DESC
    `, [playerId]);
    return result.rows;
  }

  export async function getSessionPlayers(sessionId: string) {
    const result = await query(`
      SELECT 
        p.id, 
        p.name, 
        p.position, 
        p.avatar_url,
        ps.team_id
      FROM 
        players p
      JOIN 
        player_sessions ps ON p.id = ps.player_id
      WHERE 
        ps.session_id = $1
      ORDER BY 
        p.name ASC
    `, [sessionId]);
  
    return result.rows.map(player => ({
      id: player.id,
      name: player.name,
      position: player.position,
      avatarUrl: player.avatar_url,
      teamId: player.team_id
    }));
  }

