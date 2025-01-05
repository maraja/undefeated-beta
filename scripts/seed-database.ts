import { query } from '../lib/db';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

async function seedDatabase() {
  try {
    // Seed players
    const players = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        points: 120,
        gamesPlayed: 15,
        winRate: 60,
        position: 'Point Guard',
        bio: 'Basketball enthusiast with a passion for teamwork and strategy.',
        avatarUrl: '/avatars/john-doe.jpg'
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password456',
        points: 95,
        gamesPlayed: 12,
        winRate: 58,
        position: 'Shooting Guard',
        bio: 'Sharpshooter with a competitive spirit and a love for the game.',
        avatarUrl: '/avatars/jane-smith.jpg'
      },
      {
        name: 'Mike Johnson',
        email: 'mike@example.com',
        password: 'password789',
        points: 150,
        gamesPlayed: 18,
        winRate: 72,
        position: 'Small Forward',
        bio: 'Versatile player who enjoys both offense and defense equally.',
        avatarUrl: '/avatars/mike-johnson.jpg'
      },
    ];

    for (const player of players) {
      const hashedPassword = await bcrypt.hash(player.password, 10);
      await query(
        'INSERT INTO players (name, email, password, points, games_played, win_rate, position, bio, avatar_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (email) DO NOTHING RETURNING id',
        [player.name, player.email, hashedPassword, player.points, player.gamesPlayed, player.winRate, player.position, player.bio, player.avatarUrl]
      );
    }

    // Seed sessions
    const sessions = [
      { date: '2023-06-15', time: '18:00', location: 'Main Court' },
      { date: '2023-06-22', time: '19:00', location: 'Side Court' },
      { date: '2023-06-29', time: '18:30', location: 'Main Court' },
    ];

    for (const session of sessions) {
      await query(
        'INSERT INTO sessions (date, time, location) VALUES ($1, $2, $3) RETURNING id',
        [session.date, session.time, session.location]
      );
    }

    // Seed player_sessions (example: assign each player to each session)
    const playerResult = await query('SELECT id FROM players');
    const sessionResult = await query('SELECT id FROM sessions');

    for (const player of playerResult.rows) {
      for (const session of sessionResult.rows) {
        await query(
          'INSERT INTO player_sessions (player_id, session_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [player.id, session.id]
        );
      }
    }

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    process.exit();
  }
}

seedDatabase();

