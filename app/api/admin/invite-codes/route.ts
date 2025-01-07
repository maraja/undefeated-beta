import { NextResponse, NextRequest } from 'next/server';
import { verifyAuth } from '@/utils/auth';
import { createInviteCode, getAllInviteCodes } from '@/lib/db';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const decoded = await verifyAuth(token);
    if (!decoded.isAdmin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const inviteCodes = await getAllInviteCodes();
    return NextResponse.json({ inviteCodes });
  } catch (error) {
    console.error('Error fetching invite codes:', error);
    return NextResponse.json({ error: 'An error occurred while fetching invite codes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const decoded = await verifyAuth(token);
    if (!decoded.isAdmin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const code = crypto.randomBytes(10).toString('hex');
    const newInviteCode = await createInviteCode(code);
    return NextResponse.json({ inviteCode: newInviteCode });
  } catch (error) {
    console.error('Error creating invite code:', error);
    return NextResponse.json({ error: 'An error occurred while creating the invite code' }, { status: 500 });
  }
}

