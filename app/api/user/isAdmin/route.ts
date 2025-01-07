import { NextResponse, NextRequest } from 'next/server';
import { verifyAuth } from '@/utils/auth';
import { isUserAdmin } from '@/lib/db';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ isAdmin: false }, { status: 401 });
  }

  try {
    const decoded: any = await verifyAuth(token);
    const isAdmin = await isUserAdmin(decoded.id);

    return NextResponse.json({ isAdmin });
  } catch (error) {
    console.error('Error checking admin status:', error);
    return NextResponse.json({ isAdmin: false }, { status: 401 });
  }
}
