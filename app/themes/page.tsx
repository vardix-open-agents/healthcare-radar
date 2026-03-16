'use client';

import { useState, useEffect } from 'react';
import ThemeCard, { ThemeGrid } from '@/components/ThemeCard';
import { Theme } from '@/lib/types';

export default function ThemesPage() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [fitFilter, setFitFilter] = useState('all');

  useEffect(() => {
    fetch('/api/data/themes')
      .then(res => res.json())
      .then(data => {
        setThemes(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredThemes = themes.filter(theme => {
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        theme.title?.toLowerCase().includes(searchLower) ||
        theme.summary?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Fit filter
    if (fitFilter !== 'all' && theme.varden_fit !== fitFilter) {
      return false;
    }

    return true;
  });

  // Sort by varden_fit
  const sortedThemes = [...filteredThemes].sort((a, b) => {
    const fitOrder: Record<string, number> = {
      'very_high': 4,
      'high': 3,
      'medium': 2,
      'low': 1,
    };
    return (fitOrder[b.varden_fit] || 0) - (fitOrder[a.varden_fit] || 0);
  });

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-100">Themes</h1>
        <p className="text-zinc-400 mt-1">
          Explore market themes and discover related companies
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search themes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <select
          value={fitFilter}
          onChange={(e) => setFitFilter(e.target.value)}
          className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:border-cyan-500"
        >
          <option value="all">All Fit Levels</option>
          <option value="very_high">Very High</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <div className="text-zinc-400 text-sm flex items-center">
          {sortedThemes.length} themes
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-16">
          <div className="animate-pulse text-zinc-400">Loading themes...</div>
        </div>
      ) : (
        <ThemeGrid themes={sortedThemes} />
      )}

      {/* Empty State */}
      {!loading && sortedThemes.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">💡</span>
          </div>
          <h3 className="text-xl font-semibold text-zinc-100 mb-2">No themes found</h3>
          <p className="text-zinc-400">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
    </div>
  );
}
