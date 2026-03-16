import { NextRequest, NextResponse } from 'next/server';
import { getThemes, getThemeBySlug } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Check if this is a single theme request
    const slug = searchParams.get('slug');
    if (slug) {
      const theme = await getThemeBySlug(slug);
      if (!theme) {
        return NextResponse.json({ error: 'Theme not found' }, { status: 404 });
      }
      return NextResponse.json(theme);
    }

    // Otherwise, get all themes
    const themes = await getThemes();
    return NextResponse.json(themes);
  } catch (error) {
    console.error('Error fetching themes:', error);
    return NextResponse.json([], { status: 500 });
  }
}
