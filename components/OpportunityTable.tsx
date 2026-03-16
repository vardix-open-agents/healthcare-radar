'use client';

import { useState, useMemo } from 'react';
import { Entry } from '@/lib/types';
import { getVardenFitColor, formatVardenFit, getCountryFlag, truncate } from '@/lib/utils';

interface OpportunityTableProps {
  entries: Entry[];
  onEntryClick?: (entry: Entry) => void;
}

type SortField = 'company_name' | 'varden_fit' | 'country' | 'funding_stage';
type SortDirection = 'asc' | 'desc';

export default function OpportunityTable({ entries, onEntryClick }: OpportunityTableProps) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('varden_fit');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [fitFilter, setFitFilter] = useState<string>('all');
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);

  const filteredAndSorted = useMemo(() => {
    let result = [...entries];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(e =>
        e.company_name?.toLowerCase().includes(searchLower) ||
        e.problem_solved?.toLowerCase().includes(searchLower) ||
        e.solution_description?.toLowerCase().includes(searchLower)
      );
    }

    // Varden fit filter
    if (fitFilter !== 'all') {
      result = result.filter(e => e.varden_fit === fitFilter);
    }

    // Sort
    const fitOrder: Record<string, number> = {
      'very_high': 4,
      'high': 3,
      'medium': 2,
      'low': 1,
    };

    result.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (sortField === 'varden_fit') {
        const aScore = fitOrder[aVal as string] || 0;
        const bScore = fitOrder[bVal as string] || 0;
        if (aScore < bScore) return sortDirection === 'asc' ? -1 : 1;
        if (aScore > bScore) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      }

      const aStr = typeof aVal === 'string' ? aVal.toLowerCase() : String(aVal);
      const bStr = typeof bVal === 'string' ? bVal.toLowerCase() : String(bVal);

      if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [entries, search, sortField, sortDirection, fitFilter]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleRowClick = (entry: Entry) => {
    setSelectedEntry(entry);
    onEntryClick?.(entry);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return (
      <span className="ml-1">
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Varden Fit Filter */}
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

        {/* Result count */}
        <div className="text-zinc-400 text-sm">
          {filteredAndSorted.length} results
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-zinc-700 rounded-xl">
        <table className="w-full">
          <thead>
            <tr className="bg-zinc-800/50">
              <th
                onClick={() => handleSort('company_name')}
                className="px-4 py-3 text-left text-sm font-medium text-zinc-400 cursor-pointer hover:text-zinc-100"
              >
                Company <SortIcon field="company_name" />
              </th>
              <th
                onClick={() => handleSort('varden_fit')}
                className="px-4 py-3 text-left text-sm font-medium text-zinc-400 cursor-pointer hover:text-zinc-100"
              >
                Varden Fit <SortIcon field="varden_fit" />
              </th>
              <th
                onClick={() => handleSort('country')}
                className="px-4 py-3 text-left text-sm font-medium text-zinc-400 cursor-pointer hover:text-zinc-100"
              >
                Country <SortIcon field="country" />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">
                Problem Solved
              </th>
              <th
                onClick={() => handleSort('funding_stage')}
                className="px-4 py-3 text-left text-sm font-medium text-zinc-400 cursor-pointer hover:text-zinc-100"
              >
                Stage <SortIcon field="funding_stage" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-700">
            {filteredAndSorted.map((entry) => (
              <tr
                key={entry.id}
                onClick={() => handleRowClick(entry)}
                className="bg-zinc-800/30 hover:bg-zinc-700/50 cursor-pointer transition-colors"
              >
                <td className="px-4 py-4">
                  <div className="font-medium text-zinc-100">{entry.company_name}</div>
                  {entry.traction_signals && entry.traction_signals.length > 0 && (
                    <div className="text-xs text-zinc-500 mt-1">
                      {entry.traction_signals[0]}
                    </div>
                  )}
                </td>
                <td className="px-4 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getVardenFitColor(entry.varden_fit)} text-white`}>
                    {formatVardenFit(entry.varden_fit)}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className="flex items-center gap-2">
                    <span>{getCountryFlag(entry.country)}</span>
                    <span className="text-zinc-300">{entry.country}</span>
                  </span>
                </td>
                <td className="px-4 py-4 text-zinc-400 text-sm max-w-xs">
                  {truncate(entry.problem_solved, 80)}
                </td>
                <td className="px-4 py-4">
                  <span className="text-zinc-300 text-sm capitalize">
                    {entry.funding_stage?.replace('_', ' ') || 'Unknown'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredAndSorted.length === 0 && (
          <div className="text-center py-12 text-zinc-500">
            No opportunities found matching your criteria.
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedEntry && (
        <EntryDetailModal
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
        />
      )}
    </div>
  );
}

function EntryDetailModal({ entry, onClose }: { entry: Entry; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="bg-zinc-800 border border-zinc-700 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-700">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-zinc-100">{entry.company_name}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getVardenFitColor(entry.varden_fit)} text-white`}>
                  {formatVardenFit(entry.varden_fit)}
                </span>
                <span className="text-zinc-400 text-sm capitalize">
                  {entry.funding_stage?.replace('_', ' ')}
                </span>
                <span className="text-zinc-400 text-sm">
                  {getCountryFlag(entry.country)} {entry.country}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-100 p-2"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-sm font-medium text-zinc-400 mb-1">Problem Solved</h3>
            <p className="text-zinc-200">{entry.problem_solved}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-zinc-400 mb-1">Solution</h3>
            <p className="text-zinc-200">{entry.solution_description}</p>
          </div>

          {entry.traction_signals && entry.traction_signals.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-zinc-400 mb-2">Traction Signals</h3>
              <ul className="space-y-1">
                {entry.traction_signals.map((signal, i) => (
                  <li key={i} className="flex items-start gap-2 text-zinc-300">
                    <span className="text-cyan-500">•</span>
                    {signal}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {entry.notes && (
            <div>
              <h3 className="text-sm font-medium text-zinc-400 mb-1">Notes</h3>
              <p className="text-zinc-300 bg-zinc-700/50 p-3 rounded-lg text-sm">
                {entry.notes}
              </p>
            </div>
          )}

          <div className="flex gap-4 text-sm text-zinc-500 pt-4 border-t border-zinc-700">
            <span>Discovered by: <span className="text-zinc-300 capitalize">{entry.discovered_by}</span></span>
            <span>Round: <span className="text-zinc-300">{entry.discovery_round}</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}
