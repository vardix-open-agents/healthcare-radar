import { NextRequest, NextResponse } from 'next/server';
import { getOpportunities } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');
    
    const opportunities = await getOpportunities(limit);
    return NextResponse.json(opportunities);
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    return NextResponse.json([], { status: 500 });
  }
}
