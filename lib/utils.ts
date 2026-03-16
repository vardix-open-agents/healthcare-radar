import { type ClassValue, clsx } from 'clsx';

// Simple clsx implementation to avoid dependency
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ');
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function getVardenFitColor(fit: string): string {
  switch (fit) {
    case 'very_high':
      return 'bg-emerald-500';
    case 'high':
      return 'bg-cyan-500';
    case 'medium':
      return 'bg-yellow-500';
    case 'low':
      return 'bg-zinc-500';
    default:
      return 'bg-zinc-600';
  }
}

export function getVardenFitTextColor(fit: string): string {
  switch (fit) {
    case 'very_high':
      return 'text-emerald-500';
    case 'high':
      return 'text-cyan-500';
    case 'medium':
      return 'text-yellow-500';
    case 'low':
      return 'text-zinc-400';
    default:
      return 'text-zinc-500';
  }
}

export function formatVardenFit(fit: string): string {
  return fit.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length).trim() + '...';
}

export function getCountryFlag(country: string): string {
  // Simple country code to flag emoji
  const codes: Record<string, string> = {
    'US': '🇺🇸',
    'GB': '🇬🇧',
    'UK': '🇬🇧',
    'SE': '🇸🇪',
    'DE': '🇩🇪',
    'FR': '🇫🇷',
    'NO': '🇳🇴',
    'FI': '🇫🇮',
    'DK': '🇩🇰',
    'NL': '🇳🇱',
    'CA': '🇨🇦',
    'AU': '🇦🇺',
    'IN': '🇮🇳',
    'IL': '🇮🇱',
  };
  return codes[country.toUpperCase()] || '🌍';
}

export function sortEntries(entries: any[], sortBy: string, direction: 'asc' | 'desc'): any[] {
  return [...entries].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    
    // Handle varden_fit sorting
    if (sortBy === 'varden_fit') {
      const fitOrder: Record<string, number> = {
        'very_high': 4,
        'high': 3,
        'medium': 2,
        'low': 1,
      };
      aVal = fitOrder[aVal] || 0;
      bVal = fitOrder[bVal] || 0;
    }
    
    // String comparison
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

export function filterEntries(entries: any[], filters: Record<string, any>): any[] {
  return entries.filter(entry => {
    for (const [key, value] of Object.entries(filters)) {
      if (value === undefined || value === null || value === '' || value === 'all') {
        continue;
      }
      
      if (key === 'search') {
        const searchLower = value.toLowerCase();
        const matchesSearch = 
          entry.company_name?.toLowerCase().includes(searchLower) ||
          entry.problem_solved?.toLowerCase().includes(searchLower) ||
          entry.solution_description?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      } else if (entry[key] !== value) {
        return false;
      }
    }
    return true;
  });
}
