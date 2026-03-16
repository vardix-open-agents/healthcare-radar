/**
 * Data access layer for Healthcare Radar
 * Provides type-safe query functions using Kysely
 */

import { db } from './index';
import { sql } from 'kysely';
import type { EntryFilters, StatsResponse, Entry, Theme, Opportunity } from './types';

/**
 * Get entries with optional filtering
 */
export async function getEntries(filters: EntryFilters = {}): Promise<Entry[]> {
  let query = db.selectFrom('entries').selectAll();

  if (filters.country) {
    query = query.where('country', '=', filters.country);
  }
  if (filters.region) {
    query = query.where('region', '=', filters.region);
  }
  if (filters.problem_type) {
    query = query.where('problem_type', '=', filters.problem_type);
  }
  if (filters.solution_type) {
    query = query.where('solution_type', '=', filters.solution_type);
  }
  if (filters.care_stage) {
    query = query.where('care_stage', '=', filters.care_stage);
  }
  if (filters.buyer) {
    query = query.where('buyer', '=', filters.buyer);
  }
  if (filters.funding) {
    query = query.where('funding', '=', filters.funding);
  }
  if (filters.varden_fit_min !== undefined) {
    query = query.where('varden_fit', '>=', filters.varden_fit_min);
  }
  if (filters.varden_fit_max !== undefined) {
    query = query.where('varden_fit', '<=', filters.varden_fit_max);
  }
  if (filters.boring_software !== undefined) {
    query = query.where('boring_software', '=', filters.boring_software ? 1 : 0);
  }
  if (filters.contrarian !== undefined) {
    query = query.where('contrarian', '=', filters.contrarian ? 1 : 0);
  }
  if (filters.search) {
    // Simple full-text search across multiple fields
    const searchTerm = `%${filters.search}%`;
    query = query.where((eb) => eb.or([
      eb('title', 'like', searchTerm),
      eb('company', 'like', searchTerm),
      eb('problem', 'like', searchTerm),
      eb('solution', 'like', searchTerm),
    ]));
  }

  const results = await query.orderBy('date_added', 'desc').execute();

  // Parse JSON fields
  return results.map(row => ({
    ...row,
    traction_signals: row.traction_signals ? JSON.parse(row.traction_signals) : null,
    boring_software: row.boring_software === 1,
    contrarian: row.contrarian === 1,
    varden_fit: row.varden_fit,
  })) as Entry[];
}

/**
 * Get a single entry by ID
 */
export async function getEntryById(id: string): Promise<Entry | null> {
  const result = await db
    .selectFrom('entries')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();

  if (!result) return null;

  return {
    ...result,
    traction_signals: result.traction_signals ? JSON.parse(result.traction_signals) : null,
    boring_software: result.boring_software === 1,
    contrarian: result.contrarian === 1,
  } as Entry;
}

/**
 * Get all themes with entry counts
 */
export async function getThemes(): Promise<Theme[]> {
  const results = await db
    .selectFrom('themes')
    .selectAll()
    .orderBy('evidence_count', 'desc')
    .execute();

  return results.map(row => ({
    ...row,
    opportunity: row.opportunity ? JSON.parse(row.opportunity) : null,
    drivers: row.drivers ? JSON.parse(row.drivers) : null,
    evidence: row.evidence ? JSON.parse(row.evidence) : null,
    growth_signal: row.growth_signal as Theme['growth_signal'],
    varden_fit: row.varden_fit as Theme['varden_fit'],
  })) as Theme[];
}

/**
 * Get a single theme by slug
 */
export async function getThemeBySlug(slug: string): Promise<Theme | null> {
  const result = await db
    .selectFrom('themes')
    .selectAll()
    .where('slug', '=', slug)
    .executeTakeFirst();

  if (!result) return null;

  return {
    ...result,
    opportunity: result.opportunity ? JSON.parse(result.opportunity) : null,
    drivers: result.drivers ? JSON.parse(result.drivers) : null,
    evidence: result.evidence ? JSON.parse(result.evidence) : null,
    growth_signal: result.growth_signal as Theme['growth_signal'],
    varden_fit: result.varden_fit as Theme['varden_fit'],
  } as Theme;
}

/**
 * Get top N opportunities
 */
export async function getOpportunities(limit: number = 20): Promise<Opportunity[]> {
  const results = await db
    .selectFrom('opportunities')
    .selectAll()
    .orderBy('rank', 'asc')
    .limit(limit)
    .execute();

  return results.map(row => ({
    ...row,
    action: row.action as Opportunity['action'],
  })) as Opportunity[];
}

/**
 * Search entries with full-text search
 */
export async function searchEntries(query: string, limit: number = 50): Promise<Entry[]> {
  const searchTerm = `%${query}%`;
  
  const results = await db
    .selectFrom('entries')
    .selectAll()
    .where((eb) => eb.or([
      eb('title', 'like', searchTerm),
      eb('company', 'like', searchTerm),
      eb('problem', 'like', searchTerm),
      eb('solution', 'like', searchTerm),
      eb('notes', 'like', searchTerm),
    ]))
    .orderBy('varden_fit', 'desc')
    .limit(limit)
    .execute();

  return results.map(row => ({
    ...row,
    traction_signals: row.traction_signals ? JSON.parse(row.traction_signals) : null,
    boring_software: row.boring_software === 1,
    contrarian: row.contrarian === 1,
  })) as Entry[];
}

/**
 * Get aggregated statistics
 */
export async function getStats(): Promise<StatsResponse> {
  // Get counts
  const [entryCount, themeCount, oppCount] = await Promise.all([
    db.selectFrom('entries').select(sql`count(*)`.as('count')).executeTakeFirst(),
    db.selectFrom('themes').select(sql`count(*)`.as('count')).executeTakeFirst(),
    db.selectFrom('opportunities').select(sql`count(*)`.as('count')).executeTakeFirst(),
  ]);

  // Get distributions
  const byCountry = await getDistribution('country');
  const byVardenFit = await getVardenFitDistribution();
  const byFunding = await getDistribution('funding');
  const byCareStage = await getDistribution('care_stage');

  // Get averages and special counts
  const avgFit = await db
    .selectFrom('entries')
    .select(sql`avg(varden_fit)`.as('avg'))
    .where('varden_fit', 'is not', null)
    .executeTakeFirst();

  const boringCount = await db
    .selectFrom('entries')
    .select(sql`count(*)`.as('count'))
    .where('boring_software', '=', 1)
    .executeTakeFirst();

  const contrarianCount = await db
    .selectFrom('entries')
    .select(sql`count(*)`.as('count'))
    .where('contrarian', '=', 1)
    .executeTakeFirst();

  // Recent discoveries (last 24 hours)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const recentCount = await db
    .selectFrom('entries')
    .select(sql`count(*)`.as('count'))
    .where('date_added', '>=', oneDayAgo)
    .executeTakeFirst();

  return {
    total_entries: Number(entryCount?.count || 0),
    total_themes: Number(themeCount?.count || 0),
    total_opportunities: Number(oppCount?.count || 0),
    by_country: byCountry,
    by_varden_fit: byVardenFit,
    by_funding: byFunding,
    by_care_stage: byCareStage,
    recent_discoveries: Number(recentCount?.count || 0),
    avg_varden_fit: avgFit?.avg ? Number(avgFit.avg) : null,
    boring_software_count: Number(boringCount?.count || 0),
    contrarian_count: Number(contrarianCount?.count || 0),
  };
}

/**
 * Helper: Get distribution of values for a column
 */
async function getDistribution(column: string): Promise<Record<string, number>> {
  const results = await db
    .selectFrom('entries')
    .select([sql<string>`${sql.ref(column)}`.as('value'), sql`count(*)`.as('count')])
    .where(sql.ref(column), 'is not', null)
    .groupBy(sql.ref(column))
    .execute();

  return results.reduce((acc, row) => {
    if (row.value) {
      acc[row.value] = Number(row.count);
    }
    return acc;
  }, {} as Record<string, number>);
}

/**
 * Helper: Get varden_fit distribution with labels
 */
async function getVardenFitDistribution(): Promise<Record<string, number>> {
  const results = await db
    .selectFrom('entries')
    .select([
      sql<string>`
        CASE 
          WHEN varden_fit >= 9 THEN 'very_high'
          WHEN varden_fit >= 6 THEN 'high'
          WHEN varden_fit >= 4 THEN 'medium'
          WHEN varden_fit >= 1 THEN 'low'
          ELSE 'unknown'
        END
      `.as('fit_label'),
      sql`count(*)`.as('count'),
    ])
    .groupBy(sql`fit_label`)
    .execute();

  return results.reduce((acc, row) => {
    acc[row.fit_label] = Number(row.count);
    return acc;
  }, {} as Record<string, number>);
}

/**
 * Get unique values for a column (useful for filter dropdowns)
 */
export async function getUniqueValues(column: 'country' | 'region' | 'problem_type' | 'solution_type' | 'care_stage' | 'buyer' | 'funding'): Promise<string[]> {
  const results = await db
    .selectFrom('entries')
    .select([sql<string>`${sql.ref(column)}`.as('value')])
    .where(sql.ref(column), 'is not', null)
    .distinct()
    .orderBy(sql.ref(column))
    .execute();

  return results.map(r => r.value).filter(Boolean);
}
