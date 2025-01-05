import { query } from '../lib/db';
import * as dotenv from 'dotenv';

dotenv.config();

async function createSchema() {
  try {
    // Create players table (unchanged)
    await query(`
      CREATE TABLE IF NOT EXISTS players (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        points INT DEFAULT 0,
        games_played INT DEFAULT 0,
        win_rate FLOAT DEFAULT 0,
        position VARCHAR(50),
        bio TEXT,
        avatar_url VARCHAR(255)
      )
    `);

    // Create sessions table (unchanged)
    await query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        time TIME NOT NULL,
        location VARCHAR(255) NOT NULL
      )
    `);

    // Create teams table
    await query(`
      CREATE TABLE IF NOT EXISTS teams (
        id SERIAL PRIMARY KEY,
        session_id INT REFERENCES sessions(id) ON DELETE CASCADE,
        name VARCHAR(50) NOT NULL
      )
    `);

    // Create player_sessions table (modified to include team_id)
    await query(`
      CREATE TABLE IF NOT EXISTS player_sessions (
        id SERIAL PRIMARY KEY,
        player_id INT REFERENCES players(id) ON DELETE CASCADE,
        session_id INT REFERENCES sessions(id) ON DELETE CASCADE,
        team_id INT REFERENCES teams(id) ON DELETE SET NULL,
        UNIQUE(player_id, session_id)
      )
    `);

    console.log('Schema created successfully');
  } catch (error) {
    console.error('Error creating schema:', error);
  } finally {
    process.exit();
  }
}

createSchema();

