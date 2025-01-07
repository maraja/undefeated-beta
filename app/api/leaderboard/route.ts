import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { Player } from '@/types/api';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    const result = await query(`
      SELECT id, name, email, points, games_played, win_rate, position, bio, avatar_url
      FROM players
      ORDER BY points DESC
      ${limit ? 'LIMIT $1' : ''}
    `, limit ? [limit] : []);

    const players = result.rows.map((player: Player) => ({
      id: player.id,
      name: player.name,
      email: player.email,
      points: player.points,
      gamesPlayed: player.games_played,
      winRate: player.win_rate,
      position: player.position,
      bio: player.bio,
      avatarUrl: player.avatar_url
    }));

    return NextResponse.json({ players });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'An error occurred while fetching the leaderboard' }, { status: 500 });
  }
}

