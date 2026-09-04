/**
 * HM Pravardhan - Shared Utilities
 * Core calculations for category weights, base scores, bonus credits, and rankings.
 */

import { CategoryScores, PerformanceRecord } from '../types/index.ts';
import { PERFORMANCE_CATEGORIES, MAX_BASE_SCORE, MAX_BONUS_CREDITS } from '../constants/roles.ts';

/**
 * Calculate the weighted base score (0 to 100) from 6 institutional categories
 */
export function calculateBaseScore(scores: CategoryScores): number {
  let total = 0;
  total += (scores.academic || 0) * PERFORMANCE_CATEGORIES.academic.weight;
  total += (scores.schoolMgmt || 0) * PERFORMANCE_CATEGORIES.schoolMgmt.weight;
  total += (scores.studentDev || 0) * PERFORMANCE_CATEGORIES.studentDev.weight;
  total += (scores.teacherMgmt || 0) * PERFORMANCE_CATEGORIES.teacherMgmt.weight;
  total += (scores.infrastructure || 0) * PERFORMANCE_CATEGORIES.infrastructure.weight;
  total += (scores.admin || 0) * PERFORMANCE_CATEGORIES.admin.weight;

  return Math.min(MAX_BASE_SCORE, Number(total.toFixed(1)));
}

/**
 * Calculate the final score: baseScore + approvedBonusCredits (capped at 10)
 */
export function calculateFinalScore(baseScore: number, bonusCredits: number): number {
  const cappedBonus = Math.min(MAX_BONUS_CREDITS, Math.max(0, bonusCredits));
  return Number((baseScore + cappedBonus).toFixed(1));
}

/**
 * Sort performance records by final score descending (with tie breaking on academic and base score)
 */
export function sortRecordsForRanking(records: PerformanceRecord[]): PerformanceRecord[] {
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
