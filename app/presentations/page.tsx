'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Presentation {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  slideCount: number;
}

// Demo presentations - in production, these would come from the data directory
const demoPresentations: Presentation[] = [
  {
    slug: 'morning-briefing-round4',
    title: 'Morning Briefing - Round 4',
    description: 'Key findings and opportunities from the latest discovery round',
    date: '2026-03-11',
    author: 'Varden Team',
    slideCount: 5,
  },
  {
    slug: 'theme-analysis',
    title: 'Theme Analysis Complete',
    description: 'Deep dive into emerging healthcare market themes',
    date: '2026-03-11',
    author: 'Sky',
    slideCount: 8,
  },
  {
    slug: 'infrastructure-pharmacy',
    title: 'Infrastructure & Pharmacy Report',
    description: 'Analysis of infrastructure and pharmacy tech opportunities',
    date: '2026-03-11',
    author: 'Sky',
    slideCount: 12,
  },
];

export default function PresentationsPage() {
  const [presentations] = useState<Presentation[]>(demoPresentations);

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">Presentations</h1>
          <p className="text-zinc-400 mt-1">
            View and create presentations from healthcare radar data
          </p>
        </div>
        <button
          className="px-4 py-2 bg-cyan-500 text-zinc-900 rounded-lg font-medium hover:bg-cyan-400 transition-colors flex items-center gap-2"
          disabled
        >
          <span>+</span>
          New Presentation
        </button>
      </div>

      {/* Presentations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {presentations.map((pres) => (
          <Link
            key={pres.slug}
            href={`/presentations/${pres.slug}`}
            className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6 card-hover group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-zinc-700 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <span className="text-xs text-zinc-500 bg-zinc-700 px-2 py-1 rounded">
                {pres.slideCount} slides
              </span>
            </div>
            
            <h3 className="text-lg font-semibold text-zinc-100 group-hover:text-cyan-400 transition-colors mb-2">
              {pres.title}
            </h3>
            
            <p className="text-zinc-400 text-sm mb-4 line-clamp-2">
              {pres.description}
            </p>
            
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>{pres.author}</span>
              <span>{new Date(pres.date).toLocaleDateString()}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {presentations.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📊</span>
          </div>
          <h3 className="text-xl font-semibold text-zinc-100 mb-2">No presentations yet</h3>
          <p className="text-zinc-400 mb-6">
            Create your first presentation to share insights with the team.
          </p>
          <button className="px-4 py-2 bg-cyan-500 text-zinc-900 rounded-lg font-medium hover:bg-cyan-400 transition-colors">
            Create Presentation
          </button>
        </div>
      )}
    </div>
  );
}
