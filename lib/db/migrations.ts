import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Create canonical_companies table
  await db.schema
    .createTable('canonical_companies')
    .addColumn('id', 'text', col => col.primaryKey())
    .addColumn('canonical_name', 'text', col => col.notNull())
    .addColumn('primary_domain', 'text')
    .addColumn('aliases', 'text') // JSON array
    .addColumn('parent_company', 'text')
    .addColumn('brand_names', 'text') // JSON array
    .addColumn('hq_country', 'text', col => col.notNull())
    .addColumn('countries_active', 'text') // JSON array
    .addColumn('primary_category', 'text')
    .addColumn('secondary_categories', 'text') // JSON array
    .addColumn('target_segment', 'text')
    .addColumn('care_setting', 'text')
    .addColumn('buyer_type', 'text')
    .addColumn('business_model', 'text')
    .addColumn('founded_year', 'integer')
    .addColumn('employee_count', 'text')
    .addColumn('funding_stage', 'text')
    // Strategic fields
    .addColumn('why_varden_should_care', 'text')
    .addColumn('buildable_components', 'text') // JSON
    .addColumn('non_buildable_components', 'text') // JSON
    .addColumn('varden_overlap', 'text')
    .addColumn('competitive_moat', 'text')
    // Scoring (1-5)
    .addColumn('strategic_fit_score', 'integer')
    .addColumn('build_feasibility_score', 'integer')
    .addColumn('technical_overlap_score', 'integer')
    .addColumn('regulatory_burden_score', 'integer')
    .addColumn('market_leverage_score', 'integer')
    .addColumn('replicability_score', 'integer')
    .addColumn('time_to_value_score', 'integer')
    // Computed
    .addColumn('build_attractiveness_score', 'real')
    .addColumn('replication_difficulty_score', 'real')
    .addColumn('confidence_score', 'real')
    // Derived
    .addColumn('replication_complexity', 'text')
    .addColumn('time_to_mvp', 'text')
    .addColumn('recommended_action', 'text')
    .addColumn('signal_type', 'text')
    // Status
    .addColumn('status', 'text', col => col.defaultTo('raw'))
    .addColumn('discovery_round', 'integer')
    .addColumn('source_url', 'text')
    .addColumn('source_type', 'text')
    .addColumn('source_confidence', 'integer')
    .addColumn('research_depth', 'text')
    .addColumn('last_reviewed_at', 'text')
    .addColumn('created_at', 'text', col => col.notNull())
    .addColumn('updated_at', 'text', col => col.notNull())
    .execute();

  // Rename entries to discovery_instances
  await db.schema
    .alterTable('entries')
    .renameTo('discovery_instances')
    .execute();

  // Add canonical_company_id to discovery_instances (the renamed table)
  await db.schema
    .alterTable('discovery_instances')
    .addColumn('canonical_company_id', 'text')
    .execute();

  // Create wave_ledger table
  await db.schema
    .createTable('wave_ledger')
    .addColumn('id', 'text', col => col.primaryKey())
    .addColumn('wave_number', 'integer', col => col.notNull())
    .addColumn('category', 'text')
    .addColumn('region', 'text')
    .addColumn('agent', 'text')
    .addColumn('target_count', 'integer')
    .addColumn('actual_count', 'integer')
    .addColumn('status', 'text')
    .addColumn('started_at', 'text')
    .addColumn('completed_at', 'text')
    .addColumn('notes', 'text')
    .execute();

  // Create tags table
  await db.schema
    .createTable('tags')
    .addColumn('id', 'text', col => col.primaryKey())
    .addColumn('name', 'text', col => col.notNull())
    .addColumn('category', 'text', col => col.notNull())
    .addColumn('created_at', 'text')
    .execute();

  // Create company_tags junction table
  await db.schema
    .createTable('company_tags')
    .addColumn('company_id', 'text', col => col.notNull())
    .addColumn('tag_id', 'text', col => col.notNull())
    .execute();
}
