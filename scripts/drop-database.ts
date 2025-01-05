import { query } from '../lib/db';
import * as dotenv from 'dotenv';

dotenv.config();

async function dropDatabase() {
  try {
    // Drop tables in reverse order of creation to avoid foreign key constraint issues
    await query('DROP TABLE IF EXISTS player_sessions CASCADE');
    await query('DROP TABLE IF EXISTS sessions CASCADE');
    await query('DROP TABLE IF EXISTS players CASCADE');

    console.log('All tables have been dropped successfully');
  } catch (error) {
    console.error('Error dropping database tables:', error);
  } finally {
    process.exit();
  }
}

dropDatabase();

