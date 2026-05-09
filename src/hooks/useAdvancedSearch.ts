import { useMemo } from 'react';

export interface SearchOptions {
  caseSensitive?: boolean;
  fuzzy?: boolean;
  prioritizeExactMatches?: boolean;
}

export interface SearchResult<T> {
  item: T;
  score: number;
  matchType: 'exact' | 'partial' | 'fuzzy';
  matchedFields: string[];
}

/**
 * Calculate fuzzy match score between search term and text
 */
const fuzzyMatch = (term: string, text: string): number => {
  const lowerTerm = term.toLowerCase();
  const lowerText = text.toLowerCase();

  if (lowerText === lowerTerm) return 1; // Exact match
  if (lowerText.includes(lowerTerm)) return 0.8; // Substring

  let score = 0;
  let termIndex = 0;

  for (let i = 0; i < lowerText.length && termIndex < lowerTerm.length; i++) {
    if (lowerText[i] === lowerTerm[termIndex]) {
      score += 1;
      termIndex++;
    }
  }

  return termIndex === lowerTerm.length ? score / lowerText.length : 0;
};

/**
 * Advanced search hook that ranks results with intelligent prioritization
 * @param items - Array of items to search
 * @param searchQuery - Search query term
 * @param searchFields - Fields to search in each item
 * @param options - Search options (case sensitivity, fuzzy matching, etc.)
 * @returns Ranked search results sorted by relevance
 */
export const useAdvancedSearch = <T extends Record<string, any>>(
  items: T[],
  searchQuery: string,
  searchFields: (keyof T)[],
  options: SearchOptions = {}
): SearchResult<T>[] => {
  const { caseSensitive = false, fuzzy = false, prioritizeExactMatches = true } = options;

  return useMemo(() => {
    if (!searchQuery.trim()) return [];

    const term = caseSensitive ? searchQuery : searchQuery.toLowerCase();
    const results: SearchResult<T>[] = [];

    items.forEach((item) => {
      let totalScore = 0;
      let matchCount = 0;
      const matchedFields: string[] = [];
      let hasExactMatch = false;

      searchFields.forEach((field) => {
        const value = item[field];
        const textValue = value ? String(value) : '';
        const compareText = caseSensitive ? textValue : textValue.toLowerCase();

        if (compareText) {
          let fieldScore = 0;

          if (compareText === term) {
            fieldScore = 1;
            hasExactMatch = true;
          } else if (compareText.includes(term)) {
            // Boost score for position - early matches score higher
            const position = compareText.indexOf(term);
            fieldScore = 0.8 + (0.2 * (1 - position / compareText.length));
          } else if (fuzzy) {
            fieldScore = fuzzyMatch(term, textValue);
          }

          if (fieldScore > 0) {
            totalScore += fieldScore;
            matchCount++;
            matchedFields.push(String(field));
          }
        }
      });

      if (matchCount > 0) {
        // Normalize score
        const normalizedScore = totalScore / matchCount;

        // Boost exact matches to top
        const finalScore = prioritizeExactMatches && hasExactMatch ? normalizedScore + 1 : normalizedScore;

        results.push({
          item,
          score: finalScore,
          matchType: hasExactMatch ? 'exact' : fuzzy && totalScore > 0 && totalScore < matchCount ? 'fuzzy' : 'partial',
          matchedFields,
        });
      }
    });

    // Sort by score (highest first), then by match type (exact > partial > fuzzy)
    return results.sort((a, b) => {
      const scoreCompare = b.score - a.score;
      if (scoreCompare !== 0) return scoreCompare;

      const matchTypeOrder = { exact: 3, partial: 2, fuzzy: 1 };
      return matchTypeOrder[b.matchType] - matchTypeOrder[a.matchType];
    });
  }, [items, searchQuery, searchFields, caseSensitive, fuzzy, prioritizeExactMatches]);
};

/**
 * Simple filter hook for basic filtering by predicate
 */
export const useFilter = <T,>(
  items: T[],
  filterPredicate: (item: T) => boolean
): T[] => {
  return useMemo(() => {
    return items.filter(filterPredicate);
  }, [items, filterPredicate]);
};

/**
 * Sort hook for sorting items
 */
export const useSort = <T,>(
  items: T[],
  sortKey: keyof T | null,
  direction: 'asc' | 'desc' = 'asc'
): T[] => {
  return useMemo(() => {
    if (!sortKey) return items;

    const sorted = [...items].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      let comparison = 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal);
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }

      return direction === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [items, sortKey, direction]);
};
