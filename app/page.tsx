'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { StatsResponse } from '@/lib/types';

export default function HomePage() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/data/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const quickLinks = [
    { href: '/presentations', label: 'Presentations', icon: '📊', desc: 'View and create presentations' },
    { href: '/opportunities', label: 'Opportunities', icon: '🎯', desc: 'Browse company opportunities' },
    { href: '/themes', label: 'Themes', icon: '💡', desc: 'Explore market themes' },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12 animate-fade-in">
        <h1 className="text-5xl font-bold mb-4">
          <span className="gradient-text">Healthcare Radar</span>
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
          Market intelligence and opportunity tracking for the Varden team.
          Discover, analyze, and prioritize healthcare companies.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatCard
          label="Total Entries"
          value={loading ? '...' : stats?.total_entries || 0}
          icon="📈"
          color="cyan"
        />
        <StatCard
          label="Themes"
          value={loading ? '...' : stats?.total_themes || 0}
          icon="💡"
          color="emerald"
        />
        <StatCard
          label="Top Opportunities"
          value={loading ? '...' : stats?.total_opportunities || 0}
          icon="🎯"
          color="violet"
        />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6 card-hover group"
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">{link.icon}</span>
              <div>
                <h3 className="text-xl font-semibold text-zinc-100 group-hover:text-cyan-400 transition-colors">
                  {link.label}
                </h3>
                <p className="text-zinc-400 text-sm">{link.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Team Status */}
      <div className="bg-zinc-800/30 border border-zinc-700 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <span>👥</span> Team Activity
        </h2>
        {loading ? (
          <div className="text-zinc-400">Loading...</div>
        ) : stats?.team_activity ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.team_activity.map((member) => (
              <div key={member.name} className="bg-zinc-800/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-zinc-100">{member.name}</span>
                  <span className="text-xs text-zinc-500 bg-zinc-700 px-2 py-1 rounded">
                    {member.discoveries} discoveries
                  </span>
                </div>
                <div className="text-xs text-zinc-400">
                  Last active: {member.last_active ? new Date(member.last_active).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* Recent Discoveries Banner */}
      {!loading && stats?.recent_discoveries ? (
        <div className="mt-8 bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 text-center">
          <span className="text-cyan-400">
            🚀 {stats.recent_discoveries} new {stats.recent_discoveries === 1 ? 'discovery' : 'discoveries'} in the last 24 hours!
          </span>
        </div>
      ) : null}
    </div>
  );
}

function StatCard({ label, value, icon, color }: { 
  label: string; 
  value: number | string; 
  icon: string;
  color: 'cyan' | 'emerald' | 'violet';
}) {
  const colorClasses = {
    cyan: 'text-cyan-400',
    emerald: 'text-emerald-400',
    violet: 'text-violet-400',
  };

  return (
    <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6 text-center">
      <span className="text-3xl mb-2 block">{icon}</span>
      <div className={`text-4xl font-bold ${colorClasses[color]} mb-1`}>
        {value}
      </div>
      <div className="text-zinc-400 text-sm">{label}</div>
    </div>
  );
}
