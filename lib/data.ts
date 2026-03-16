import fs from 'fs';
import path from 'path';
import { Entry, Theme, StatsResponse, TeamActivity } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const KNOWLEDGE_BASE_DIR = path.join(DATA_DIR, 'knowledge-base');
const THEMES_DIR = path.join(DATA_DIR, 'themes');
const OPPORTUNITIES_DIR = path.join(DATA_DIR, 'opportunities');

// Check if we're on the server side
const isServer = typeof window === 'undefined';

export function getEntries(): Entry[] {
  if (!isServer) {
    // Client side - will use API
    return [];
  }
  
  try {
    const files = fs.readdirSync(KNOWLEDGE_BASE_DIR);
    const entries: Entry[] = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(KNOWLEDGE_BASE_DIR, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const entry = JSON.parse(content) as Entry;
        entry.id = file.replace('.json', '');
        entries.push(entry);
      }
    }
    
    return entries;
  } catch (error) {
    console.error('Error reading entries:', error);
    return [];
  }
}

export function getEntryById(id: string): Entry | null {
  if (!isServer) return null;
  
  try {
    const filePath = path.join(KNOWLEDGE_BASE_DIR, `${id}.json`);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const entry = JSON.parse(content) as Entry;
      entry.id = id;
      return entry;
    }
    return null;
  } catch (error) {
    console.error('Error reading entry:', error);
    return null;
  }
}

export function getThemes(): Theme[] {
  if (!isServer) return [];
  
  try {
    const files = fs.readdirSync(THEMES_DIR);
    const themes: Theme[] = [];
    
    for (const file of files) {
      if (file.endsWith('.md')) {
        const filePath = path.join(THEMES_DIR, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const theme = parseThemeMarkdown(file.replace('.md', ''), content);
        themes.push(theme);
      }
    }
    
    return themes;
  } catch (error) {
    console.error('Error reading themes:', error);
    return [];
  }
}

export function getThemeBySlug(slug: string): Theme | null {
  if (!isServer) return null;
  
  try {
    const filePath = path.join(THEMES_DIR, `${slug}.md`);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return parseThemeMarkdown(slug, content);
    }
    return null;
  } catch (error) {
    console.error('Error reading theme:', error);
    return null;
  }
}

function parseThemeMarkdown(slug: string, content: string): Theme {
  const lines = content.split('\n');
  const theme: Theme = {
    slug,
    title: '',
    summary: '',
    companies: [],
    growth_signal: 'MEDIUM',
    evidence: [],
    drivers: [],
    varden_fit: 'medium',
    opportunity: [],
  };
  
  let currentSection = '';
  let sectionContent: string[] = [];
  
  const extractTitle = (line: string): string => {
    return line.replace(/^#\s*Theme:\s*/i, '').trim();
  };
  
  for (const line of lines) {
    // Main title
    if (line.startsWith('# Theme:')) {
      theme.title = extractTitle(line);
      continue;
    }
    
    // Section headers
    if (line.startsWith('## ')) {
      // Save previous section
      if (currentSection && sectionContent.length > 0) {
        processSection(theme, currentSection, sectionContent);
      }
      currentSection = line.replace('## ', '').toLowerCase().trim();
      sectionContent = [];
      continue;
    }
    
    sectionContent.push(line);
  }
  
  // Process last section
  if (currentSection && sectionContent.length > 0) {
    processSection(theme, currentSection, sectionContent);
  }
  
  theme.company_count = theme.companies.length;
  
  return theme;
}

function processSection(theme: Theme, section: string, content: string[]): void {
  const text = content.join('\n').trim();
  
  switch (section) {
    case 'summary':
      theme.summary = text;
      break;
    case 'companies':
      // Extract company names from bullet points
      theme.companies = content
        .filter(line => line.trim().startsWith('- **'))
        .map(line => {
          const match = line.match(/\*\*([^*]+)\*\*/);
          return match ? match[1] : '';
        })
        .filter(Boolean);
      break;
    case 'growth signal':
      if (text.toUpperCase().includes('HIGH')) theme.growth_signal = 'HIGH';
      else if (text.toUpperCase().includes('LOW')) theme.growth_signal = 'LOW';
      else theme.growth_signal = 'MEDIUM';
      break;
    case 'evidence':
      theme.evidence = content
        .filter(line => line.trim().startsWith('- '))
        .map(line => line.replace(/^-\s*/, '').trim())
        .filter(Boolean);
      break;
    case 'drivers':
      theme.drivers = content
        .filter(line => line.trim().startsWith('- '))
        .map(line => line.replace(/^-\s*/, '').trim())
        .filter(Boolean);
      break;
    case 'varden fit':
      theme.varden_fit = text.toLowerCase().includes('very high') ? 'very_high' :
                         text.toLowerCase().includes('high') ? 'high' :
                         text.toLowerCase().includes('medium') ? 'medium' : 'low';
      break;
    case 'opportunity':
      theme.opportunity = content
        .filter(line => line.trim().match(/^\d+\.\s/))
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .filter(Boolean);
      break;
  }
}

export function getOpportunities(): Entry[] {
  // For now, return all entries sorted by varden_fit
  const entries = getEntries();
  return entries.sort((a, b) => {
    const fitOrder: Record<string, number> = {
      'very_high': 4,
      'high': 3,
      'medium': 2,
      'low': 1,
    };
    return (fitOrder[b.varden_fit] || 0) - (fitOrder[a.varden_fit] || 0);
  });
}

export function getStats(): StatsResponse {
  const entries = getEntries();
  const themes = getThemes();
  
  // Count by country
  const byCountry: Record<string, number> = {};
  for (const entry of entries) {
    const country = entry.country || 'Unknown';
    byCountry[country] = (byCountry[country] || 0) + 1;
  }
  
  // Count by varden fit
  const byVardenFit: Record<string, number> = {};
  for (const entry of entries) {
    const fit = entry.varden_fit || 'unknown';
    byVardenFit[fit] = (byVardenFit[fit] || 0) + 1;
  }
  
  // Count recent discoveries (last 24 hours)
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const recentDiscoveries = entries.filter(e => {
    const timestamp = new Date(e.timestamp).getTime();
    return timestamp > oneDayAgo;
  }).length;
  
  // Team activity
  const teamCounts: Record<string, { discoveries: number; lastActive: string }> = {};
  for (const entry of entries) {
    const member = entry.discovered_by || 'unknown';
    if (!teamCounts[member]) {
      teamCounts[member] = { discoveries: 0, lastActive: '' };
    }
    teamCounts[member].discoveries++;
    const entryTime = new Date(entry.timestamp).getTime();
    const lastActive = teamCounts[member].lastActive;
    if (!lastActive || entryTime > new Date(lastActive).getTime()) {
      teamCounts[member].lastActive = entry.timestamp;
    }
  }
  
  const teamActivity: TeamActivity[] = Object.entries(teamCounts)
    .map(([name, data]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      discoveries: data.discoveries,
      last_active: data.lastActive,
    }))
    .sort((a, b) => b.discoveries - a.discoveries);
  
  return {
    total_entries: entries.length,
    total_themes: themes.length,
    total_opportunities: entries.filter(e => 
      e.varden_fit === 'very_high' || e.varden_fit === 'high'
    ).length,
    by_country: byCountry,
    by_varden_fit: byVardenFit,
    recent_discoveries: recentDiscoveries,
    team_activity: teamActivity,
  };
}
