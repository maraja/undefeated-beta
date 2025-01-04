import { createPlayer, createSession } from '@/lib/db';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

async function seedDatabase() {
  try {
    // Seed players
    const players = [
      { name: 'John Doe', email: 'john@example.com', password: 'password123' },
      { name: 'Jane Smith', email: 'jane@example.com', password: 'password456' },
      { name: 'Mike Johnson', email: 'mike@example.com', password: 'password789' },
    ];

    for (const player of players) {
      const hashedPassword = await bcrypt.hash(player.password, 10);
      await createPlayer(player.name, player.email, hashedPassword);
    }

    // Seed sessions
    const sessions = [
      { date: '2023-06-15', time: '18:00', location: 'Main Court' },
      { date: '2023-06-22', time: '19:00', location: 'Side Court' },
      { date: '2023-06-29', time: '18:30', location: 'Main Court' },
    ];

    for (const session of sessions) {
      await createSession(session.date, session.time, session.location);
    }

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedDatabase();

