'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Entry, Theme, StatsResponse } from '@/lib/types';

interface DataContextType {
  entries: Entry[];
  themes: Theme[];
  stats: StatsResponse | null;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

interface DataProviderProps {
  children: ReactNode;
}

export default function DataProvider({ children }: DataProviderProps) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all data in parallel
      const [entriesRes, themesRes, statsRes] = await Promise.all([
        fetch('/api/data/entries'),
        fetch('/api/data/themes'),
        fetch('/api/data/stats'),
      ]);

      if (!entriesRes.ok || !themesRes.ok || !statsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const entriesData = await entriesRes.json();
      const themesData = await themesRes.json();
      const statsData = await statsRes.json();

      setEntries(entriesData);
      setThemes(themesData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <DataContext.Provider
      value={{
        entries,
        themes,
        stats,
        loading,
        error,
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}
