import { NextResponse } from 'next/server';
import { getEntries, getThemes, getStats } from '@/lib/db/queries';

// Combined data endpoint for initial load
export async function GET() {
  try {
    const [entries, themes, stats] = await Promise.all([
      getEntries(),
      getThemes(),
      getStats(),
    ]);

    return NextResponse.json({
      entries,
      themes,
      stats,
    });
  } catch (error) {
    console.error('Error fetching all data:', error);
    return NextResponse.json({
      entries: [],
      themes: [],
      stats: null,
    }, { status: 500 });
  }
}
