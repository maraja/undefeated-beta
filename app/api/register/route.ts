import { NextResponse } from 'next/server';
import { createPlayer, markInviteCodeAsUsed } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { query } from '../../../lib/db';

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, password, inviteCode } = body;

  if (!name || !email || !password || !inviteCode) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    // Check if invite code is valid and unused
    const inviteCodeResult = await query(
      'SELECT id, season_id FROM invite_codes WHERE code = $1 AND is_used = FALSE',
      [inviteCode]
    );

    if (inviteCodeResult.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid or used invite code' }, { status: 400 });
    }

    const inviteCodeId = inviteCodeResult.rows[0].id;
    const seasonId = inviteCodeResult.rows[0].season_id;

    const hashedPassword = await bcrypt.hash(password, 10);
    const newPlayer = await createPlayer(name, email, hashedPassword);

    // Assign player to the season
    await query(
      'INSERT INTO player_seasons (player_id, season_id) VALUES ($1, $2)',
      [newPlayer.id, seasonId]
    );

    // Mark invite code as used
    await markInviteCodeAsUsed(inviteCodeId);

    return NextResponse.json({ player: newPlayer });
  } catch (error) {
    console.error('Error creating player:', error);
    return NextResponse.json({ error: 'An error occurred during registration' }, { status: 500 });
  }
}

