/**
 * HM Pravardhan Backend - Ranking Engine
 * Computes multi-tier rankings (Overall/State, District, Mandal)
 * and calculates chronological trajectory metrics (previousRank, rankChange).
 */

import { PerformanceRecord } from '../../../shared/types/index.ts';

export class RankingEngine {
  /**
   * Sorts records by finalScore descending with tie-breaking
   */
  public static sortRankings(records: PerformanceRecord[]): PerformanceRecord[] {
    return [...records].sort((a, b) => {
      if (b.finalScore !== a.finalScore) {
        return b.finalScore - a.finalScore;
      }
      if (b.baseScore !== a.baseScore) {
        return b.baseScore - a.baseScore;
      }
      return (b.categories?.academic || 0) - (a.categories?.academic || 0);
    });
  }

  /**
   * Recalculates State, District, and Mandal rankings for a given set of evaluation records
   */
  public static computeRankings(
    records: PerformanceRecord[],
    previousPeriodRecords?: PerformanceRecord[]
  ): PerformanceRecord[] {
    const sorted = this.sortRankings(records);

    // 1. Compute Overall / State Rank
    sorted.forEach((r, idx) => {
      r.overallRank = idx + 1;
    });

    // 2. Compute District Ranks
    const districtGroups = new Map<string, PerformanceRecord[]>();
    for (const r of sorted) {
      if (!districtGroups.has(r.district)) {
        districtGroups.set(r.district, []);
      }
      districtGroups.get(r.district)!.push(r);
    }

    districtGroups.forEach((group) => {
      group.forEach((r, idx) => {
        r.districtRank = idx + 1;
      });
    });

    // 3. Compute Mandal Ranks
    const mandalGroups = new Map<string, PerformanceRecord[]>();
    for (const r of sorted) {
      const key = `${r.district}::${r.mandal}`;
      if (!mandalGroups.has(key)) {
        mandalGroups.set(key, []);
      }
      mandalGroups.get(key)!.push(r);
    }

    mandalGroups.forEach((group) => {
      group.forEach((r, idx) => {
        r.mandalRank = idx + 1;
      });
    });

    // 4. Compute Previous Rank & Rank Change if previous period records are supplied
    if (previousPeriodRecords && previousPeriodRecords.length > 0) {
      const prevMap = new Map<string, PerformanceRecord>();
      previousPeriodRecords.forEach((pr) => prevMap.set(pr.headmasterId, pr));

      sorted.forEach((r) => {
        const prev = prevMap.get(r.headmasterId);
        if (prev && prev.overallRank) {
          r.previousRank = prev.overallRank;
          r.rankChange = prev.overallRank - r.overallRank;
          r.previousPeriodScore = prev.finalScore;
          if (prev.finalScore > 0) {
            r.improvementPercentage = Number(
              (((r.finalScore - prev.finalScore) / prev.finalScore) * 100).toFixed(1)
            );
          }
        }
      });
    }

    return sorted;
  }
}
