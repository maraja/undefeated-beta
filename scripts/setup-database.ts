import { sql } from '@vercel/postgres';

async function setupDatabase() {
  try {
    // Create players table
    await sql`
      CREATE TABLE IF NOT EXISTS players (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        points INT DEFAULT 0
      )
    `;

    // Create sessions table
    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        time TIME NOT NULL,
        location VARCHAR(255) NOT NULL
      )
    `;

    // Create player_sessions table for many-to-many relationship
    await sql`
      CREATE TABLE IF NOT EXISTS player_sessions (
        player_id INT REFERENCES players(id),
        session_id INT REFERENCES sessions(id),
        PRIMARY KEY (player_id, session_id)
      )
    `;

    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

setupDatabase();

