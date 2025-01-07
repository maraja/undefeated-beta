import { NextResponse } from 'next/server';
import { getPlayerByEmail, getPlayerSeasons } from '../../../lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
  }

  try {
    const player = await getPlayerByEmail(email);

    if (!player) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, player.password);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const seasons = await getPlayerSeasons(player.id);

    const token = jwt.sign(
      { 
        id: player.id, 
        email: player.email, 
        isAdmin: player.is_admin 
      }, 
      JWT_SECRET, 
      { expiresIn: '1d' }
    );

    const response = NextResponse.json({ 
      message: 'Login successful', 
      player: { 
        id: player.id, 
        name: player.name, 
        email: player.email, 
        isAdmin: player.is_admin,
        points: player.points,
        gamesPlayed: player.games_played,
        winRate: player.win_rate,
        position: player.position,
        avatarUrl: player.avatar_url,
        seasons: seasons
      } 
    });
    response.cookies.set('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

    return response;
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json({ error: 'An error occurred during login' }, { status: 500 });
  }
}

