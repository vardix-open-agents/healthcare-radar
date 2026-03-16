'use client';

import { useState, useEffect } from 'react';
import OpportunityTable from '@/components/OpportunityTable';
import { Entry } from '@/lib/types';

export default function OpportunitiesPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/data/entries')
      .then(res => res.json())
      .then(data => {
        setEntries(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-100">Opportunities</h1>
        <p className="text-zinc-400 mt-1">
          Browse and filter healthcare company opportunities
        </p>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-16">
          <div className="animate-pulse text-zinc-400">Loading opportunities...</div>
        </div>
      ) : (
        <OpportunityTable entries={entries} />
      )}
    </div>
  );
}
