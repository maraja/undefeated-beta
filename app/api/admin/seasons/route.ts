import { NextResponse, NextRequest } from 'next/server';
import { verifyAuth } from '@/utils/auth';
import { createSeason, getAllSeasons, updateSeason, deleteSeason } from '@/lib/db';

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

    const seasons = await getAllSeasons();
    return NextResponse.json({ seasons });
  } catch (error) {
    console.error('Error fetching seasons:', error);
    return NextResponse.json({ error: 'An error occurred while fetching seasons' }, { status: 500 });
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

    const { name, startDate, endDate } = await request.json();

    if (!name || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newSeason = await createSeason(name, startDate, endDate);
    return NextResponse.json({ season: newSeason });
  } catch (error) {
    console.error('Error creating season:', error);
    return NextResponse.json({ error: 'An error occurred while creating the season' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const decoded = await verifyAuth(token);
    if (!decoded.isAdmin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const { id, name, startDate, endDate } = await request.json();

    if (!id || !name || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const updatedSeason = await updateSeason(id, name, startDate, endDate);
    return NextResponse.json({ season: updatedSeason });
  } catch (error) {
    console.error('Error updating season:', error);
    return NextResponse.json({ error: 'An error occurred while updating the season' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const decoded = await verifyAuth(token);
    if (!decoded.isAdmin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Missing season id' }, { status: 400 });
    }

    await deleteSeason(id);
    return NextResponse.json({ message: 'Season deleted successfully' });
  } catch (error) {
    console.error('Error deleting season:', error);
    return NextResponse.json({ error: 'An error occurred while deleting the season' }, { status: 500 });
  }
}

