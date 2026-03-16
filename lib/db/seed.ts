#!/usr/bin/env tsx
/**
 * Database seed script
 * Reads ALL JSON files recursively from healthcare-radar directory and populates SQLite
 * Handles different schemas gracefully (knowledge-base, problem-index, schema files)
 * 
 * Run with: pnpm db:seed
 */

import { db, sqliteDb } from './index';
import { sql } from 'kysely';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import crypto from 'crypto';

const RADAR_DIR = path.join(process.cwd(), '../healthcare-radar');

// Stats tracking
const stats = {
  totalFilesFound: 0,
  entriesInserted: 0,
  entriesSkipped: 0,
  filesSkipped: [] as { file: string; reason: string }[],
};

// Helper to generate UUID-like IDs
function generateId(): string {
  return crypto.randomUUID();
}

// Helper to safely convert values for SQLite
function sanitizeValue(value: unknown): string | number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return value;
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (Array.isArray(value) || typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

// Map varden_fit string to numeric score
function mapVardenFit(fit: unknown): number | null {
  if (!fit) return null;
  if (typeof fit === 'number') return fit;
  if (typeof fit !== 'string') return null;

  const fitMap: Record<string, number> = {
    'very_high': 10,
    'very high': 10,
    'high': 7,
    'medium': 5,
    'moderate': 5,
    'moderate-high': 6,
    'low': 2,
    'unknown': null,
  };
  const normalized = fit.toLowerCase().trim();
  return fitMap[normalized] ?? null;
}

// Recursively find all JSON files in a directory
async function findJsonFiles(dir: string): Promise<string[]> {
  const jsonFiles: string[] = [];
  
  async function walk(currentDir: string) {
    try {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        if (entry.isDirectory()) {
          await walk(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.json')) {
          jsonFiles.push(fullPath);
        }
      }
    } catch (err) {
      // Directory might not exist or be readable
      console.error(`Warning: Could not read directory ${currentDir}:`, err);
    }
  }
  
  await walk(dir);
  return jsonFiles;
}

// Detect JSON file type based on structure
function detectJsonType(data: any, filePath: string): 'entry' | 'problem-index' | 'schema' | 'company-array' | 'unknown' {
  // JSON Schema files have $schema property
  if (data.$schema || (data.title && data.type === 'object' && data.properties)) {
    return 'schema';
  }
  
  // Problem-index aggregated files have 'entries' array
  if (data.entries && Array.isArray(data.entries)) {
    return 'problem-index';
  }
  
  // Single problem-index entry has problem_type but no company_name/company
  if (data.problem_type && !data.company_name && !data.company && !data.title) {
    return 'problem-index';
  }
  
  // New format: has 'company' field (company-2026-*.json files)
  if (data.company && !data.company_name) {
    return 'entry';
  }
  
  // Knowledge-base entries have company_name or title with specific fields
  if (data.company_name || data.title || data.problem_solved || data.problem) {
    return 'entry';
  }
  
  // Handle direct arrays of company objects
  if (Array.isArray(data) && data.length > 0) {
    if (data[0].company_name || data[0].company) {
      return 'company-array';
    }
  }


  
  return 'unknown';
}

// Parse knowledge-base entry
function parseKnowledgeBaseEntry(filename: string, data: any): any {
  const id = filename.replace('.json', '');
  // Handle both formats: company_name (old) and company (new)
  const companyName = data.company_name || data.company;
  // Handle both formats: problem/problem_solved (old) and description (new)
  const problemText = data.problem_solved || data.problem || data.description || '';
  // Handle varden_fit: could be string (old) or object with threat_level (new)
  let vardenFit: number | null = null;
  if (typeof data.varden_fit === 'object' && data.varden_fit !== null) {
    // New format: varden_fit is object with opportunity field
    vardenFit = mapVardenFit(data.varden_fit.opportunity || data.varden_fit.threat_level);
  } else {
    vardenFit = mapVardenFit(data.varden_fit);
  }

  return {
    id,
    title: sanitizeValue(data.title || companyName || id),
    company: sanitizeValue(companyName),
    country: sanitizeValue(data.country),
    region: sanitizeValue(data.region),
    problem: sanitizeValue(problemText),
    solution: sanitizeValue(data.solution_description || data.solution || data.subsector),
    problem_type: sanitizeValue(data.problem_type || data.category),
    solution_type: sanitizeValue(data.solution_type || data.subsector),
    care_stage: sanitizeValue(data.care_stage),
    buyer: sanitizeValue(data.buyer_persona || data.buyer || data.target_market),
    care_setting: sanitizeValue(data.care_setting),
    automation_type: sanitizeValue(data.automation_level || data.automation_type),
    technology: sanitizeValue(data.technology || (Array.isArray(data.tech_stack) ? data.tech_stack.join(', ') : data.tech_stack)),
    traction_signals: sanitizeValue(data.traction_signals || data.customers),
    funding: sanitizeValue(data.funding_stage || data.funding),
    varden_fit: sanitizeValue(vardenFit),
    boring_software: sanitizeValue(data.boring_software),
    contrarian: sanitizeValue(data.contrarian),
    url: sanitizeValue(data.url),
    source: sanitizeValue(data.source || (Array.isArray(data.sources) ? data.sources.join(', ') : 'knowledge-base')),
    notes: sanitizeValue(data.notes || data.competitive_advantage),
    discovery_round: sanitizeValue(data.discovery_round),
    discovered_by: sanitizeValue(data.discovered_by),
    date_added: sanitizeValue(data.timestamp || data.date_added || data.last_updated || new Date().toISOString()),
    created_at: sanitizeValue(new Date().toISOString()),
    updated_at: sanitizeValue(new Date().toISOString()),
  };
}

// Parse problem-index entry (single or aggregated)
function parseProblemIndexEntries(filename: string, data: any): any[] {
  const entries: any[] = [];
  
  // Aggregated category files have an 'entries' array
  if (data.entries && Array.isArray(data.entries)) {
    for (const entry of data.entries) {
      entries.push({
        id: entry.id || `${filename.replace('.json', '')}-${entries.length}`,
        title: sanitizeValue(entry.company || entry.problem || entry.id),
        company: sanitizeValue(entry.company),
        country: sanitizeValue(entry.country),
        region: null,
        problem: sanitizeValue(entry.problem || data.problem_type),
        solution: sanitizeValue(entry.solution_type),
        problem_type: sanitizeValue(data.problem_type), // inherit from parent
        solution_type: sanitizeValue(entry.solution_type),
        care_stage: sanitizeValue(entry.care_stage),
        buyer: sanitizeValue(entry.buyer),
        care_setting: sanitizeValue(entry.care_setting),
        automation_type: sanitizeValue(entry.automation_type),
        technology: null,
        traction_signals: null,
        funding: null,
        varden_fit: sanitizeValue(mapVardenFit(entry.varden_fit)),
        boring_software: sanitizeValue(entry.boring_software ?? 0),
        contrarian: sanitizeValue(entry.contrarian ?? 0),
        url: sanitizeValue(entry.url),
        source: sanitizeValue(entry.source || 'problem-index'),
        notes: null,
        discovery_round: null,
        discovered_by: null,
        date_added: sanitizeValue(entry.date_added || new Date().toISOString()),
        created_at: sanitizeValue(new Date().toISOString()),
        updated_at: sanitizeValue(new Date().toISOString()),
      });
    }
  } else {
    // Single problem entry
    const id = data.id || filename.replace('.json', '');
    entries.push({
      id,
      title: sanitizeValue(data.companies ? data.companies.join(', ') : data.problem || id),
      company: sanitizeValue(data.companies ? data.companies.join(', ') : undefined),
      country: sanitizeValue(data.country),
      region: null,
      problem: sanitizeValue(data.problem || data.problem_type),
      solution: sanitizeValue(data.solution_type),
      problem_type: sanitizeValue(data.problem_type),
      solution_type: sanitizeValue(data.solution_type),
      care_stage: sanitizeValue(data.care_stage),
      buyer: sanitizeValue(data.buyer),
      care_setting: sanitizeValue(data.care_setting),
      automation_type: sanitizeValue(data.automation_type),
      technology: null,
      traction_signals: null,
      funding: null,
      varden_fit: sanitizeValue(mapVardenFit(data.varden_fit)),
      boring_software: sanitizeValue(data.boring_software ?? 0),
      contrarian: sanitizeValue(data.contrarian ?? 0),
      url: sanitizeValue(data.url),
      source: sanitizeValue(data.source || 'problem-index'),
      notes: null,
      discovery_round: null,
      discovered_by: null,
      date_added: sanitizeValue(data.date_added || new Date().toISOString()),
      created_at: sanitizeValue(new Date().toISOString()),
      updated_at: sanitizeValue(new Date().toISOString()),
    });
  }
  
  return entries;
}

// Parse theme markdown file
function parseThemeMarkdown(slug: string, content: string) {
  const lines = content.split('\n');
  const theme: any = {
    id: generateId(),
    slug,
    name: '',
    description: null,
    evidence_count: 0,
    growth_signal: null,
    varden_fit: null,
    opportunity: null,
    drivers: null,
    evidence: null,
  };

  let currentSection = '';
  let sectionContent: string[] = [];
  const companies: string[] = [];

  for (const line of lines) {
    if (line.startsWith('# Theme:')) {
      theme.name = line.replace(/^#\s*Theme:\s*/i, '').trim();
      continue;
    }

    if (line.startsWith('## ')) {
      if (currentSection && sectionContent.length > 0) {
        processSection(theme, currentSection, sectionContent, companies);
      }
      currentSection = line.replace('## ', '').toLowerCase().trim();
      sectionContent = [];
      continue;
    }

    sectionContent.push(line);
  }

  if (currentSection && sectionContent.length > 0) {
    processSection(theme, currentSection, sectionContent, companies);
  }

  theme.evidence_count = companies.length;
  return theme;
}

function processSection(theme: any, section: string, content: string[], companies: string[]) {
  const text = content.join('\n').trim();

  switch (section) {
    case 'summary':
      theme.description = text;
      break;
    case 'companies':
      const companyNames = content
        .filter(line => line.trim().startsWith('- **'))
        .map(line => {
          const match = line.match(/\*\*([^*]+)\*\*/);
          return match ? match[1] : '';
        })
        .filter(Boolean);
      companies.push(...companyNames);
      break;
    case 'growth signal':
      if (text.toUpperCase().includes('HIGH')) theme.growth_signal = 'high';
      else if (text.toUpperCase().includes('LOW')) theme.growth_signal = 'low';
      else theme.growth_signal = 'medium';
      break;
    case 'evidence':
      theme.evidence = JSON.stringify(content
        .filter(line => line.trim().startsWith('- '))
        .map(line => line.replace(/^-\s*/, '').trim())
        .filter(Boolean));
      break;
    case 'drivers':
      theme.drivers = JSON.stringify(content
        .filter(line => line.trim().startsWith('- '))
        .map(line => line.replace(/^-\s*/, '').trim())
        .filter(Boolean));
      break;
    case 'varden fit':
      theme.varden_fit = text.toLowerCase().includes('very high') ? 'very_high' :
                         text.toLowerCase().includes('high') ? 'high' :
                         text.toLowerCase().includes('medium') ? 'medium' : 'low';
      break;
    case 'opportunity':
      theme.opportunity = JSON.stringify(content
        .filter(line => line.trim().match(/^\d+\.\s/))
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .filter(Boolean));
      break;
  }
}

// Parse opportunities markdown file
function parseOpportunitiesMarkdown(filename: string, content: string) {
  const opportunities: any[] = [];
  const lines = content.split('\n');
  
  let currentTier = 1;
  let currentOpportunity: any = null;
  let rank = 1;

  for (const line of lines) {
    if (line.includes('TIER 1')) currentTier = 1;
    if (line.includes('TIER 2')) currentTier = 2;
    if (line.includes('TIER 3')) currentTier = 3;

    const companyMatch = line.match(/^###\s*(\d+)\.\s*\*\*([^*]+)\*\*/);
    if (companyMatch) {
      if (currentOpportunity) {
        opportunities.push(currentOpportunity);
      }
      currentOpportunity = {
        id: generateId(),
        rank: rank++,
        company: companyMatch[2].trim(),
        country: null,
        score: 0,
        action: 'monitor',
        investment_min: null,
        investment_max: null,
        rationale: null,
        tier: currentTier,
        theme: null,
      };
    }

    if (currentOpportunity && line.includes('**Varden Fit**')) {
      const fitMatch = line.match(/(\d+(?:\.\d+)?)\s*\/\s*10/);
      if (fitMatch) {
        currentOpportunity.score = parseFloat(fitMatch[1]);
      }
    }

    if (currentOpportunity && line.includes('**Build vs Buy')) {
      if (line.toUpperCase().includes('ACQUIRE')) currentOpportunity.action = 'acquire';
      else if (line.toUpperCase().includes('PARTNER')) currentOpportunity.action = 'partner';
      else if (line.toUpperCase().includes('BUILD')) currentOpportunity.action = 'build';
    }

    if (currentOpportunity && line.match(/🇬🇧|🇳🇱|🇸🇪|🇩🇪|🇫🇷|UK|Netherlands|Sweden|Germany|France/)) {
      if (!currentOpportunity.country) {
        if (line.includes('🇬🇧') || line.includes('UK')) currentOpportunity.country = 'UK';
        else if (line.includes('🇳🇱') || line.includes('Netherlands')) currentOpportunity.country = 'NL';
        else if (line.includes('🇸🇪') || line.includes('Sweden')) currentOpportunity.country = 'SE';
        else if (line.includes('🇩🇪') || line.includes('Germany')) currentOpportunity.country = 'DE';
        else if (line.includes('🇫🇷') || line.includes('France')) currentOpportunity.country = 'FR';
      }
    }

    if (currentOpportunity && line.includes('€') && line.includes('M')) {
      const amounts = line.match(/€(\d+(?:\.\d+)?)-?(\d+)?M/g);
      if (amounts) {
        const nums = amounts[0].match(/(\d+)/g);
        if (nums) {
          currentOpportunity.investment_min = parseFloat(nums[0]) * 1000000;
          if (nums[1]) currentOpportunity.investment_max = parseFloat(nums[1]) * 1000000;
          else currentOpportunity.investment_max = currentOpportunity.investment_min;
        }
      }
    }

    if (currentOpportunity && line.includes('£') && line.includes('M')) {
      const amounts = line.match(/£(\d+(?:\.\d+)?)-?(\d+)?M/g);
      if (amounts) {
        const nums = amounts[0].match(/(\d+)/g);
        if (nums) {
          currentOpportunity.investment_min = parseFloat(nums[0]) * 1000000;
          if (nums[1]) currentOpportunity.investment_max = parseFloat(nums[1]) * 1000000;
          else currentOpportunity.investment_max = currentOpportunity.investment_min;
        }
      }
    }
  }

  if (currentOpportunity) {
    opportunities.push(currentOpportunity);
  }

  return opportunities;
}

async function seed() {
  console.log('🌱 Seeding database...');
  console.log(`📂 Scanning directory: ${RADAR_DIR}`);

  try {
    // Find all JSON files recursively
    const jsonFiles = await findJsonFiles(RADAR_DIR);
    stats.totalFilesFound = jsonFiles.length;
    console.log(`   Found ${jsonFiles.length} JSON files`);

    // Process all JSON files in a single transaction
    await db.transaction().execute(async (trx) => {
      for (const filePath of jsonFiles) {
        const filename = path.basename(filePath);
        const relativePath = path.relative(RADAR_DIR, filePath);
        
        try {
          const content = await fs.readFile(filePath, 'utf-8');
          const data = JSON.parse(content);
          
          // Detect file type and process accordingly
          const fileType = detectJsonType(data, filePath);
          
          switch (fileType) {
            case 'schema':
              stats.filesSkipped.push({ file: relativePath, reason: 'JSON Schema definition file' });
              continue;
              
            case 'entry':
              // Knowledge-base style entry
              const entry = parseKnowledgeBaseEntry(filename, data);
              
              // Check for duplicates
              const existingEntry = await trx
                .selectFrom('entries')
                .select('id')
                .where('id', '=', entry.id)
                .executeTakeFirst();
              
              if (existingEntry) {
                stats.entriesSkipped++;
                continue;
              }
              
              await trx.insertInto('entries').values(entry).execute();
              stats.entriesInserted++;
              break;
              
            case 'problem-index':
              // Problem-index entries (single or aggregated)
              const problemEntries = parseProblemIndexEntries(filename, data);
              
              for (const pEntry of problemEntries) {
                const existingProblem = await trx
                  .selectFrom('entries')
                  .select('id')
                  .where('id', '=', pEntry.id)
                  .executeTakeFirst();
                
                if (existingProblem) {
                  stats.entriesSkipped++;
                  continue;
                }
                
                await trx.insertInto('entries').values(pEntry).execute();
                stats.entriesInserted++;
              }
              break;
              
            case 'company-array':
              // Direct array of company objects
              for (let i = 0; i < data.length; i++) {
                const companyData = data[i];
                const arrayEntry = parseKnowledgeBaseEntry(`${filename.replace('.json', '')}-${i}`, companyData);
                
                const existingArrayEntry = await trx
                  .selectFrom('entries')
                  .select('id')
                  .where('id', '=', arrayEntry.id)
                  .executeTakeFirst();
                
                if (existingArrayEntry) {
                  stats.entriesSkipped++;
                  continue;
                }
                
                await trx.insertInto('entries').values(arrayEntry).execute();
                stats.entriesInserted++;
              }
              break;
              
            default:
              stats.filesSkipped.push({ file: relativePath, reason: 'Unknown JSON structure' });
          }
        } catch (err: any) {
          stats.filesSkipped.push({ file: relativePath, reason: `Parse error: ${err.message}` });
        }
      }
    });

    console.log(`\n✅ JSON files processed:`);
    console.log(`   Inserted: ${stats.entriesInserted} entries`);
    console.log(`   Skipped (duplicates): ${stats.entriesSkipped} entries`);

    // Process themes from markdown files
    const themesDir = path.join(RADAR_DIR, 'themes');
    if (fsSync.existsSync(themesDir)) {
      console.log('\n📂 Reading themes...');
      const themeFiles = (await fs.readdir(themesDir)).filter(f => f.endsWith('.md'));
      console.log(`   Found ${themeFiles.length} theme files`);

      let themesInserted = 0;

      await db.transaction().execute(async (trx) => {
        for (const file of themeFiles) {
          try {
            const slug = file.replace('.md', '');
            const filePath = path.join(themesDir, file);
            const content = await fs.readFile(filePath, 'utf-8');
            const theme = parseThemeMarkdown(slug, content);

            const existing = await trx
              .selectFrom('themes')
              .select('id')
              .where('slug', '=', slug)
              .executeTakeFirst();

            if (existing) {
              await trx.updateTable('themes')
                .set({
                  name: sanitizeValue(theme.name),
                  description: sanitizeValue(theme.description),
                  evidence_count: sanitizeValue(theme.evidence_count),
                  growth_signal: sanitizeValue(theme.growth_signal),
                  varden_fit: sanitizeValue(theme.varden_fit),
                  opportunity: sanitizeValue(theme.opportunity),
                  drivers: sanitizeValue(theme.drivers),
                  evidence: sanitizeValue(theme.evidence),
                  updated_at: sanitizeValue(new Date().toISOString()),
                })
                .where('slug', '=', slug)
                .execute();
            } else {
              await trx.insertInto('themes').values({
                id: sanitizeValue(theme.id),
                slug: sanitizeValue(theme.slug),
                name: sanitizeValue(theme.name),
                description: sanitizeValue(theme.description),
                evidence_count: sanitizeValue(theme.evidence_count),
                growth_signal: sanitizeValue(theme.growth_signal),
                varden_fit: sanitizeValue(theme.varden_fit),
                opportunity: sanitizeValue(theme.opportunity),
                drivers: sanitizeValue(theme.drivers),
                evidence: sanitizeValue(theme.evidence),
                created_at: sanitizeValue(new Date().toISOString()),
                updated_at: sanitizeValue(new Date().toISOString()),
              }).execute();
              themesInserted++;
            }
          } catch (err) {
            console.error(`   Error processing theme ${file}:`, err);
          }
        }
      });

      console.log(`   ✅ Inserted ${themesInserted} new themes`);
    }

    // Process opportunities from markdown files
    const opportunitiesDir = path.join(RADAR_DIR, 'opportunities');
    if (fsSync.existsSync(opportunitiesDir)) {
      console.log('\n📂 Reading opportunities...');
      const opportunityFiles = (await fs.readdir(opportunitiesDir)).filter(f => f.endsWith('.md'));
      console.log(`   Found ${opportunityFiles.length} opportunity files`);

      let opportunitiesInserted = 0;

      await db.transaction().execute(async (trx) => {
        for (const file of opportunityFiles) {
          try {
            const filePath = path.join(opportunitiesDir, file);
            const content = await fs.readFile(filePath, 'utf-8');
            const opportunities = parseOpportunitiesMarkdown(file, content);

            for (const opp of opportunities) {
              const existing = await trx
                .selectFrom('opportunities')
                .select('id')
                .where('company', '=', opp.company)
                .executeTakeFirst();

              if (!existing) {
                await trx.insertInto('opportunities').values({
                  id: sanitizeValue(opp.id),
                  rank: sanitizeValue(opp.rank),
                  company: sanitizeValue(opp.company),
                  country: sanitizeValue(opp.country),
                  score: sanitizeValue(opp.score),
                  action: sanitizeValue(opp.action),
                  investment_min: sanitizeValue(opp.investment_min),
                  investment_max: sanitizeValue(opp.investment_max),
                  rationale: sanitizeValue(opp.rationale),
                  tier: sanitizeValue(opp.tier),
                  theme: sanitizeValue(opp.theme),
                }).execute();
                opportunitiesInserted++;
              }
            }
          } catch (err) {
            console.error(`   Error processing opportunity file ${file}:`, err);
          }
        }
      });

      console.log(`   ✅ Inserted ${opportunitiesInserted} new opportunities`);
    }

    // Print summary
    const entryCount = await db.selectFrom('entries').select(sql`count(*)`.as('count')).executeTakeFirst();
    const themeCount = await db.selectFrom('themes').select(sql`count(*)`.as('count')).executeTakeFirst();
    const oppCount = await db.selectFrom('opportunities').select(sql`count(*)`.as('count')).executeTakeFirst();

    console.log('\n📊 Seed Summary:');
    console.log(`   Total JSON files found: ${stats.totalFilesFound}`);
    console.log(`   Total entries inserted: ${stats.entriesInserted}`);
    console.log(`   Entries skipped (duplicates): ${stats.entriesSkipped}`);
    if (stats.filesSkipped.length > 0) {
      console.log(`   Files skipped: ${stats.filesSkipped.length}`);
      for (const skip of stats.filesSkipped) {
        console.log(`     - ${skip.file}: ${skip.reason}`);
      }
    }

    console.log('\n📊 Database totals:');
    console.log(`   Entries: ${entryCount?.count || 0}`);
    console.log(`   Themes: ${themeCount?.count || 0}`);
    console.log(`   Opportunities: ${oppCount?.count || 0}`);

    console.log('\n🎉 Seeding complete!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }

  await db.destroy();
}

seed();
