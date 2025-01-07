import { query } from '../lib/db';
import * as dotenv from 'dotenv';

dotenv.config();

async function createSchema() {
  try {
    // Create seasons table (unchanged)
    await query(`
      CREATE TABLE IF NOT EXISTS seasons (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL
      )
    `);

    // Create invite_codes table (unchanged)
    await query(`
      CREATE TABLE IF NOT EXISTS invite_codes (
        id SERIAL PRIMARY KEY,
        code VARCHAR(20) UNIQUE NOT NULL,
        is_used BOOLEAN DEFAULT FALSE,
        season_id INT REFERENCES seasons(id) ON DELETE CASCADE
      )
    `);

    // Create or modify players table (unchanged)
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
        avatar_url VARCHAR(255),
        is_admin BOOLEAN DEFAULT FALSE
      )
    `);

    // Create player_seasons table (unchanged)
    await query(`
      CREATE TABLE IF NOT EXISTS player_seasons (
        player_id INT REFERENCES players(id) ON DELETE CASCADE,
        season_id INT REFERENCES seasons(id) ON DELETE CASCADE,
        PRIMARY KEY (player_id, season_id)
      )
    `);

    // Create sessions table (unchanged)
    await query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        time TIME NOT NULL,
        location VARCHAR(255) NOT NULL,
        season_id INT REFERENCES seasons(id) ON DELETE CASCADE
      )
    `);

    // Create games table (modified)
    await query(`
      CREATE TABLE IF NOT EXISTS games (
        id SERIAL PRIMARY KEY,
        session_id INT REFERENCES sessions(id) ON DELETE CASCADE,
        winner_id INT
      )
    `);

    // Create teams table (modified)
    await query(`
      CREATE TABLE IF NOT EXISTS teams (
        id SERIAL PRIMARY KEY,
        game_id INT REFERENCES games(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL
      )
    `);

    // Create player_teams table (new)
    await query(`
      CREATE TABLE IF NOT EXISTS player_teams (
        player_id INT REFERENCES players(id) ON DELETE CASCADE,
        team_id INT REFERENCES teams(id) ON DELETE CASCADE,
        PRIMARY KEY (player_id, team_id)
      )
    `);

    // Create player_sessions table (modified)
    await query(`
      CREATE TABLE IF NOT EXISTS player_sessions (
        player_id INT REFERENCES players(id) ON DELETE CASCADE,
        session_id INT REFERENCES sessions(id) ON DELETE CASCADE,
        PRIMARY KEY (player_id, session_id)
      )
    `);

    console.log('Schema updated successfully');
  } catch (error) {
    console.error('Error updating schema:', error);
  } finally {
    process.exit();
  }
}

createSchema();

