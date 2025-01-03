import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server'
import { sql } from '@/lib/db';
import { verifyAuth } from '@/utils/auth';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const decoded: any = await verifyAuth(token);
    const result = await sql`
      SELECT id, name, email, points 
      FROM players 
      WHERE id = ${decoded.id}
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    const player = result.rows[0];
    return NextResponse.json({ player });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'An error occurred while fetching the profile' }, { status: 500 });
  }
}

