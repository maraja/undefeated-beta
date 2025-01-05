import { NextResponse, NextRequest } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/utils/auth';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const decoded = await verifyAuth(token);
    const result = await query(
      'SELECT id, name, email, points, games_played, win_rate, position, bio, avatar_url FROM players WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    const player = result.rows[0];
    return NextResponse.json({
      player: {
        id: player.id,
        name: player.name,
        email: player.email,
        points: player.points,
        gamesPlayed: player.games_played,
        winRate: player.win_rate,
        position: player.position,
        bio: player.bio,
        avatarUrl: player.avatar_url
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'An error occurred while fetching the profile' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const decoded = await verifyAuth(token);
    const { name, position, bio } = await request.json();

    const result = await query(
      'UPDATE players SET name = $1, position = $2, bio = $3 WHERE id = $4 RETURNING id, name, email, points, games_played, win_rate, position, bio, avatar_url',
      [name, position, bio, decoded.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    const updatedPlayer = result.rows[0];
    return NextResponse.json({
      player: {
        id: updatedPlayer.id,
        name: updatedPlayer.name,
        email: updatedPlayer.email,
        points: updatedPlayer.points,
        gamesPlayed: updatedPlayer.games_played,
        winRate: updatedPlayer.win_rate,
        position: updatedPlayer.position,
        bio: updatedPlayer.bio,
        avatarUrl: updatedPlayer.avatar_url
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'An error occurred while updating the profile' }, { status: 500 });
  }
}

