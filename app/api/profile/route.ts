import { NextResponse, NextRequest } from 'next/server';
import { getPlayerById } from '@/lib/db';
import { verifyAuth } from '@/utils/auth';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const decoded = await verifyAuth(token);
    const player = await getPlayerById(decoded.id as string);

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    return NextResponse.json({ player });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'An error occurred while fetching the profile' }, { status: 500 });
  }
}

