import { NextResponse } from 'next/server';
import { getStats } from '@/lib/db/queries';

export async function GET() {
  try {
    const stats = await getStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({
      total_entries: 0,
      total_themes: 0,
      total_opportunities: 0,
      by_country: {},
      by_varden_fit: {},
      by_funding: {},
      by_care_stage: {},
      recent_discoveries: 0,
      avg_varden_fit: null,
      boring_software_count: 0,
      contrarian_count: 0,
    }, { status: 500 });
  }
}
