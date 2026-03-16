import { NextRequest, NextResponse } from 'next/server';
import { getEntries, getEntryById, searchEntries } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Check if this is a single entry request
    const id = searchParams.get('id');
    if (id) {
      const entry = await getEntryById(id);
      if (!entry) {
        return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
      }
      return NextResponse.json(entry);
    }

    // Check if this is a search request
    const searchQuery = searchParams.get('q') || searchParams.get('search');
    if (searchQuery) {
      const limit = parseInt(searchParams.get('limit') || '50');
      const entries = await searchEntries(searchQuery, limit);
      return NextResponse.json(entries);
    }

    // Otherwise, get entries with filters
    const filters = {
      country: searchParams.get('country') || undefined,
      region: searchParams.get('region') || undefined,
      problem_type: searchParams.get('problem_type') || undefined,
      solution_type: searchParams.get('solution_type') || undefined,
      care_stage: searchParams.get('care_stage') || undefined,
      buyer: searchParams.get('buyer') || undefined,
      funding: searchParams.get('funding') || undefined,
      varden_fit_min: searchParams.get('varden_fit_min') ? parseInt(searchParams.get('varden_fit_min')!) : undefined,
      varden_fit_max: searchParams.get('varden_fit_max') ? parseInt(searchParams.get('varden_fit_max')!) : undefined,
      boring_software: searchParams.get('boring_software') === 'true' ? true : searchParams.get('boring_software') === 'false' ? false : undefined,
      contrarian: searchParams.get('contrarian') === 'true' ? true : searchParams.get('contrarian') === 'false' ? false : undefined,
    };

    const entries = await getEntries(filters);
    return NextResponse.json(entries);
  } catch (error) {
    console.error('Error fetching entries:', error);
    return NextResponse.json([], { status: 500 });
  }
}
