import { query } from '../lib/db';
import * as dotenv from 'dotenv';

dotenv.config();

async function dropDatabase() {
  try {
    // Drop tables in reverse order of creation to avoid foreign key constraint issues
    await query('DROP TABLE IF EXISTS player_sessions CASCADE');
    await query('DROP TABLE IF EXISTS sessions CASCADE');
    await query('DROP TABLE IF EXISTS players CASCADE');
    await query('DROP TABLE IF EXISTS games CASCADE');
    await query('DROP TABLE IF EXISTS invite_codes CASCADE');
    await query('DROP TABLE IF EXISTS player_seasons CASCADE');
    await query('DROP TABLE IF EXISTS seasons CASCADE');
    await query('DROP TABLE IF EXISTS teams CASCADE');
    await query('DROP TABLE IF EXISTS player_teams CASCADE');

    console.log('All tables have been dropped successfully');
  } catch (error) {
    console.error('Error dropping database tables:', error);
  } finally {
    process.exit();
  }
}

dropDatabase();

