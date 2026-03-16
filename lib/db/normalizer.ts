/**
 * Company name normalization utilities for deduplication and matching
 */

// Common company suffixes to remove during normalization
const COMPANY_SUFFIXES = [
  // English
  'incorporated',
  'inc',
  'corporation',
  'corp',
  'company',
  'co',
  'limited',
  'ltd',
  'llc',
  'llp',
  'lp',
  'plc',
  'gmbh',
  'ag',
  'sa',
  'sarl',
  'bv',
  'nv',
  'as',
  'ab',
  'oy',
  'spA',
  'srl',
  'pty',
  'pte',
  
  // Healthcare specific
  'health',
  'healthcare',
  'medical',
  'hospital',
  'clinic',
  'pharma',
  'pharmaceuticals',
  'pharmaceutical',
  'biotech',
  'biotechnology',
  'therapeutics',
  'biosciences',
  'life sciences',
  'diagnostics',
  'medical group',
  'health system',
  'health partners',
  
  // Common descriptors
  'group',
  'holdings',
  'partners',
  'enterprises',
  'solutions',
  'services',
  'systems',
  'technologies',
  'technology',
  'digital',
  'global',
  'international',
  'worldwide',
];

// Characters to remove during normalization
const REMOVE_CHARS_REGEX = /[.,\/#!$%\^&\*;:{}=\-_`~()]/g;

// Multiple spaces regex
const MULTI_SPACE_REGEX = /\s+/g;

/**
 * Normalize a company name for comparison and matching
 */
export function normalizeCompanyName(name: string | null | undefined): string {
  if (!name) return '';

  return (
    name
      // Convert to lowercase
      .toLowerCase()
      // Remove special characters
      .replace(REMOVE_CHARS_REGEX, ' ')
      // Normalize whitespace
      .replace(MULTI_SPACE_REGEX, ' ')
      .trim()
  );
}

/**
 * Normalize company name and remove common suffixes for better matching
 */
export function normalizeCompanyNameForMatching(name: string | null | undefined): string {
  let normalized = normalizeCompanyName(name);
  
  if (!normalized) return '';

  // Remove common suffixes
  for (const suffix of COMPANY_SUFFIXES) {
    // Match suffix at end of string (with optional trailing content)
    const suffixPattern = new RegExp(`\\b${suffix}\\.?\\s*$`, 'i');
    normalized = normalized.replace(suffixPattern, '');
  }

  return normalized.trim();
}

/**
 * Calculate similarity between two company names (0-1 scale)
 * Uses a simple word overlap approach
 */
export function calculateCompanyNameSimilarity(
  name1: string | null | undefined,
  name2: string | null | undefined
): number {
  const normalized1 = normalizeCompanyNameForMatching(name1);
  const normalized2 = normalizeCompanyNameForMatching(name2);

  if (!normalized1 || !normalized2) return 0;
  if (normalized1 === normalized2) return 1;

  const words1 = new Set(normalized1.split(/\s+/));
  const words2 = new Set(normalized2.split(/\s+/));

  if (words1.size === 0 || words2.size === 0) return 0;

  // Calculate Jaccard similarity
  const intersection = new Set([...words1].filter((w) => words2.has(w)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

/**
 * Check if two company names likely refer to the same company
 */
export function areCompaniesSame(
  name1: string | null | undefined,
  name2: string | null | undefined,
  threshold = 0.7
): boolean {
  return calculateCompanyNameSimilarity(name1, name2) >= threshold;
}

/**
 * Extract potential company name aliases from text
 */
export function extractCompanyAliases(text: string | null | undefined): string[] {
  if (!text) return [];

  // Match patterns like "Company (formerly OldCompany)" or "Company, formerly OldCompany"
  const aliasPatterns = [
    /\(formerly\s+([^)]+)\)/gi,
    /,\s*formerly\s+([^,)]+)/gi,
    /formerly\s+known\s+as\s+([^,)]+)/gi,
    /aka\s+([^,)]+)/gi,
  ];

  const aliases: string[] = [];
  
  for (const pattern of aliasPatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        aliases.push(normalizeCompanyName(match[1]));
      }
    }
  }

  return aliases;
}

/**
 * Clean and standardize a company name for display
 */
export function formatCompanyName(name: string | null | undefined): string {
  if (!name) return '';

  return (
    name
      // Remove extra whitespace
      .replace(MULTI_SPACE_REGEX, ' ')
      .trim()
      // Capitalize first letter of each word
      .replace(/\b\w/g, (char) => char.toUpperCase())
  );
}

/**
 * Generate a searchable key for company name indexing
 */
export function generateCompanySearchKey(name: string | null | undefined): string {
  return normalizeCompanyNameForMatching(name).replace(/\s+/g, '');
}

/**
 * Extract domain from URL
 */
export function extractDomain(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const match = url.match(/https?:\/\/(?:www\.)?([^\/]+)/);
    return match ? match[1].toLowerCase() : null;
  } catch {
    return null;
  }
}

/**
 * Alias for areCompaniesSame for consistency
 */
export const areSameCompany = areCompaniesSame;
