import { NextResponse } from 'next/server';
import { createPlayer, getAllPlayers } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, password, inviteCode } = body;

  if (!name || !email || !password || !inviteCode) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    // Check if invite code is valid and unused
    const inviteCodeResult = await query(
      'SELECT id FROM invite_codes WHERE code = $1 AND is_used = FALSE',
      [inviteCode]
    );

    if (inviteCodeResult.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid or used invite code' }, { status: 400 });
    }

    const inviteCodeId = inviteCodeResult.rows[0].id;

    const hashedPassword = await bcrypt.hash(password, 10);
    const newPlayer = await createPlayer(name, email, hashedPassword);

    // Mark invite code as used
    await query('UPDATE invite_codes SET is_used = TRUE WHERE id = $1', [inviteCodeId]);

    return NextResponse.json({ player: newPlayer });
  } catch (error) {
    console.error('Error creating player:', error);
    return NextResponse.json({ error: 'An error occurred during registration' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const players = await getAllPlayers();
    return NextResponse.json({ players });
  } catch (error) {
    console.error('Error fetching players:', error);
    return NextResponse.json({ error: 'An error occurred while fetching players' }, { status: 500 });
  }
}

