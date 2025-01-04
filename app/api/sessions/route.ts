import { NextResponse } from 'next/server';
import { createSession, getAllSessions } from '@/lib/db';

export async function POST(request: Request) {
  const body = await request.json();
  const { date, time, location } = body;

  if (!date || !time || !location) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const newSession = await createSession(date, time, location);
    return NextResponse.json({ session: newSession });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json({ error: 'An error occurred while creating the session' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const sessions = await getAllSessions();
    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json({ error: 'An error occurred while fetching sessions' }, { status: 500 });
  }
}

