import { sql } from '@vercel/postgres';

export async function query(query: string, values: any[] = []) {
  try {
    const result = await sql.query(query, values);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export async function getPlayerByEmail(email: string) {
  const result = await query('SELECT * FROM players WHERE email = $1', [email]);
  return result.rows[0];
}

export async function createPlayer(name: string, email: string, hashedPassword: string) {
  const result = await query(
    'INSERT INTO players (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
    [name, email, hashedPassword]
  );
  return result.rows[0];
}

export async function getAllPlayers() {
  const result = await query('SELECT id, name, email, points FROM players');
  return result.rows;
}

export async function createSession(date: string, time: string, location: string) {
  const result = await query(
    'INSERT INTO sessions (date, time, location) VALUES ($1, $2, $3) RETURNING id, date, time, location',
    [date, time, location]
  );
  return result.rows[0];
}

export async function getAllSessions() {
  const result = await query('SELECT id, date, time, location FROM sessions');
  return result.rows;
}

export async function getPlayerById(id: string) {
  const result = await query('SELECT id, name, email, points FROM players WHERE id = $1', [id]);
  return result.rows[0];
}

export async function updatePlayerPoints(playerId: string, points: number) {
  const result = await query(
    'UPDATE players SET points = points + $1 WHERE id = $2 RETURNING id, name, points',
    [points, playerId]
  );
  return result.rows[0];
}

export async function addPlayerToSession(playerId: string, sessionId: string) {
  await query(
    'INSERT INTO player_sessions (player_id, session_id) VALUES ($1, $2)',
    [playerId, sessionId]
  );
}

