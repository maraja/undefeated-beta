import { query } from '../lib/db';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

async function seedDatabase() {
  try {
    // Seed seasons
    const seasonsData = [
      { name: 'Summer 2025', startDate: '2025-06-01', endDate: '2025-08-31' },
      { name: 'Fall 2025', startDate: '2025-09-01', endDate: '2025-11-30' },
      { name: 'Winter 2025', startDate: '2025-12-01', endDate: '2025-02-28' },
      { name: 'Spring 2025', startDate: '2025-03-01', endDate: '2025-05-31' },
    ];

    for (const season of seasonsData) {
      const result = await query(
        'INSERT INTO seasons (name, start_date, end_date) VALUES ($1, $2, $3) RETURNING id',
        [season.name, season.startDate, season.endDate]
      );
      const seasonId = result.rows[0].id;

      // Create invite codes for each season
      for (let i = 0; i < 5; i++) {
        const code = Math.random().toString(36).substring(2, 10).toUpperCase();
        await query(
          'INSERT INTO invite_codes (code, season_id) VALUES ($1, $2)',
          [code, seasonId]
        );
      }
    }

    // Seed players
    const players = [
      { name: 'John Doe', email: 'john@example.com', password: 'password123', position: 'Point Guard' },
      { name: 'Jane Smith', email: 'jane@example.com', password: 'password456', position: 'Shooting Guard' },
      { name: 'Mike Johnson', email: 'mike@example.com', password: 'password789', position: 'Small Forward' },
      { name: 'Emily Chen', email: 'emily@example.com', password: 'emilypass', position: 'Power Forward' },
      { name: 'Alex Rodriguez', email: 'alex@example.com', password: 'alexpass', position: 'Center' },
      { name: 'Sarah Thompson', email: 'sarah@example.com', password: 'sarahpass', position: 'Shooting Guard' },
      { name: 'David Lee', email: 'david@example.com', password: 'davidpass', position: 'Small Forward' },
      { name: 'Lisa Wang', email: 'lisa@example.com', password: 'lisapass', position: 'Point Guard' },
      { name: 'Tom Baker', email: 'tom@example.com', password: 'tompass', position: 'Power Forward' },
      { name: 'Maria Garcia', email: 'maria@example.com', password: 'mariapass', position: 'Center' },
      { name: 'Chris Wilson', email: 'chris@example.com', password: 'chrispass', position: 'Point Guard' },
      { name: 'Olivia Brown', email: 'olivia@example.com', password: 'oliviapass', position: 'Shooting Guard' },
      { name: 'Ryan Taylor', email: 'ryan@example.com', password: 'ryanpass', position: 'Small Forward' },
      { name: 'Emma White', email: 'emma@example.com', password: 'emmapass', position: 'Power Forward' },
      { name: 'Daniel Kim', email: 'daniel@example.com', password: 'danielpass', position: 'Center' },
      { name: 'Sophia Nguyen', email: 'sophia@example.com', password: 'sophiapass', position: 'Point Guard' },
      { name: 'Ethan Davis', email: 'ethan@example.com', password: 'ethanpass', position: 'Shooting Guard' },
      { name: 'Isabella Martinez', email: 'isabella@example.com', password: 'isabellapass', position: 'Small Forward' },
      { name: 'Lucas Johnson', email: 'lucas@example.com', password: 'lucaspass', position: 'Power Forward' },
      { name: 'Ava Williams', email: 'ava@example.com', password: 'avapass', position: 'Center' },
    ];

    for (const player of players) {
      const hashedPassword = await bcrypt.hash(player.password, 10);
      const avatarId = Math.floor(Math.random() * 100) + 1;
      const avatarUrl = `https://avatar.iran.liara.run/public/${avatarId}`;
      
      const result = await query(
        'INSERT INTO players (name, email, password, position, avatar_url) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [player.name, player.email, hashedPassword, player.position, avatarUrl]
      );
      const playerId = result.rows[0].id;

      // Assign player to all seasons (unchanged)
      const seasonResult = await query('SELECT id FROM seasons');
      for (const season of seasonResult.rows) {
        await query(
          'INSERT INTO player_seasons (player_id, season_id) VALUES ($1, $2)',
          [playerId, season.id]
        );
      }
    }

    // Seed sessions and games
    const seasonResult = await query('SELECT id FROM seasons');
    for (const season of seasonResult.rows) {
      const sessionCount = Math.floor(Math.random() * 5) + 3; // 3 to 7 sessions per season
      for (let i = 0; i < sessionCount; i++) {
        const date = new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
        const time = `${Math.floor(Math.random() * 12) + 8}:00`;
        const location = ['Main Court', 'Side Court', 'Community Center'][Math.floor(Math.random() * 3)];

        const sessionResult = await query(
          'INSERT INTO sessions (date, time, location, season_id) VALUES ($1, $2, $3, $4) RETURNING id',
          [date.toISOString(), time, location, season.id]
        );
        const sessionId = sessionResult.rows[0].id;

        // Assign players to the session
        const playerResult = await query('SELECT id FROM players ORDER BY RANDOM() LIMIT 10');
        const playerIds = playerResult.rows.map(row => row.id);

        for (const playerId of playerIds) {
          await query(
            'INSERT INTO player_sessions (player_id, session_id) VALUES ($1, $2)',
            [playerId, sessionId]
          );
        }

        // Create games for the session
        const gameCount = Math.floor(Math.random() * 3) + 1; // 1 to 3 games per session
        for (let j = 0; j < gameCount; j++) {
          const gameResult = await query(
            'INSERT INTO games (session_id) VALUES ($1) RETURNING id',
            [sessionId]
          );
          const gameId = gameResult.rows[0].id;

          // Create two teams for each game
          const team1Result = await query(
            'INSERT INTO teams (game_id, name) VALUES ($1, $2) RETURNING id',
            [gameId, 'Team A']
          );
          const team2Result = await query(
            'INSERT INTO teams (game_id, name) VALUES ($1, $2) RETURNING id',
            [gameId, 'Team B']
          );

          const team1Id = team1Result.rows[0].id;
          const team2Id = team2Result.rows[0].id;

          // Assign players to teams
          const shuffledPlayers = playerIds.sort(() => 0.5 - Math.random());
          for (let k = 0; k < shuffledPlayers.length; k++) {
            const teamId = k < 5 ? team1Id : team2Id;
            await query(
              'INSERT INTO player_teams (player_id, team_id) VALUES ($1, $2)',
              [shuffledPlayers[k], teamId]
            );
          }

          // Set a winner for the game
          const winnerId = Math.random() < 0.5 ? team1Id : team2Id;
          await query(
            'UPDATE games SET winner_id = $1 WHERE id = $2',
            [winnerId, gameId]
          );

          // Update player points and games played
          await query(`
            UPDATE players
            SET points = points + 1, games_played = games_played + 1
            WHERE id IN (
              SELECT player_id
              FROM player_teams
              WHERE team_id = $1
            )
          `, [winnerId]);

          await query(`
            UPDATE players
            SET games_played = games_played + 1
            WHERE id IN (
              SELECT player_id
              FROM player_teams
              WHERE team_id != $1
            )
          `, [winnerId]);
        }
      }
    }

    // Update win rates
    await query(`
      UPDATE players
      SET win_rate = CASE
        WHEN games_played > 0 THEN (points::float / games_played) * 100
        ELSE 0
      END
    `);

    // Add an admin user (unchanged)
    const adminPassword = await bcrypt.hash('adminpassword', 10);
    await query(
      'INSERT INTO players (name, email, password, is_admin) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING',
      ['Admin User', 'admin@example.com', adminPassword, true]
    );

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    process.exit();
  }
}

seedDatabase();

