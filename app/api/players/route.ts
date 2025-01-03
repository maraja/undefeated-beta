import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, password } = body;

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await sql`
      INSERT INTO players (name, email, password, points)
      VALUES (${name}, ${email}, ${hashedPassword}, 0)
      RETURNING id, name, email
    `;
    const newPlayer = result.rows[0];
    return NextResponse.json({ player: newPlayer });
  } catch (error) {
    console.error('Error creating player:', error);
    return NextResponse.json({ error: 'An error occurred during registration' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const result = await sql`SELECT id, name, email, points FROM players`;
    return NextResponse.json({ players: result.rows });
  } catch (error) {
    console.error('Error fetching players:', error);
    return NextResponse.json({ error: 'An error occurred while fetching players' }, { status: 500 });
  }
}

