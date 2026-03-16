// Barrel export for database module
export { db, sqliteDb, closeDb } from './index';
export type { Database, EntriesTable, ThemesTable, OpportunitiesTable, TagsTable, EntryTagsTable } from './schema';
export type { Entry, Theme, Opportunity, Tag, EntryFilters, StatsResponse } from './types';
export {
  getEntries,
  getEntryById,
  getThemes,
  getThemeBySlug,
  getOpportunities,
  searchEntries,
  getStats,
  getUniqueValues,
} from './queries';
