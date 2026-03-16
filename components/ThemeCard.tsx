'use client';

import Link from 'next/link';
import { Theme } from '@/lib/types';
import { getVardenFitColor, getVardenFitTextColor, formatVardenFit } from '@/lib/utils';

interface ThemeCardProps {
  theme: Theme;
  compact?: boolean;
}

export default function ThemeCard({ theme, compact = false }: ThemeCardProps) {
  const fitColorClass = getVardenFitColor(theme.varden_fit);
  const fitTextClass = getVardenFitTextColor(theme.varden_fit);

  if (compact) {
    return (
      <Link
        href={`/themes#${theme.slug}`}
        className="block bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 hover:border-cyan-500/50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-zinc-100">{theme.title}</h3>
          <span className={`text-xs px-2 py-1 rounded ${fitColorClass} text-white`}>
            {formatVardenFit(theme.varden_fit)}
          </span>
        </div>
        <div className="text-sm text-zinc-400 mt-1">
          {theme.company_count || theme.companies?.length || 0} companies
        </div>
      </Link>
    );
  }

  return (
    <div 
      id={theme.slug}
      className="bg-zinc-800/50 border border-zinc-700 rounded-xl overflow-hidden card-hover"
    >
      {/* Header */}
      <div className="p-6 border-b border-zinc-700">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-semibold text-zinc-100">{theme.title}</h3>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${fitColorClass} text-white`}>
              {formatVardenFit(theme.varden_fit)}
            </span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
              theme.growth_signal === 'HIGH' ? 'bg-emerald-500' :
              theme.growth_signal === 'MEDIUM' ? 'bg-yellow-500' : 'bg-zinc-500'
            } text-white`}>
              {theme.growth_signal} Growth
            </span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="p-6">
        <p className="text-zinc-300 text-sm leading-relaxed mb-4">
          {theme.summary}
        </p>

        {/* Companies */}
        {theme.companies && theme.companies.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-medium text-zinc-500 uppercase mb-2">
              Companies ({theme.companies.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {theme.companies.slice(0, 6).map((company, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-zinc-700/50 rounded text-xs text-zinc-300"
                >
                  {company}
                </span>
              ))}
              {theme.companies.length > 6 && (
                <span className="px-2 py-1 text-xs text-zinc-500">
                  +{theme.companies.length - 6} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Evidence Count */}
        {theme.evidence && theme.evidence.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <span>📋</span>
            <span>{theme.evidence.length} evidence items</span>
          </div>
        )}

        {/* Opportunity Preview */}
        {theme.opportunity && theme.opportunity.length > 0 && (
          <div className="mt-4 pt-4 border-t border-zinc-700">
            <h4 className="text-xs font-medium text-zinc-500 uppercase mb-2">
              Key Opportunity
            </h4>
            <p className="text-sm text-zinc-400">
              {theme.opportunity[0]}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Grid component for displaying multiple themes
export function ThemeGrid({ themes }: { themes: Theme[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {themes.map((theme) => (
        <ThemeCard key={theme.slug} theme={theme} />
      ))}
    </div>
  );
}
