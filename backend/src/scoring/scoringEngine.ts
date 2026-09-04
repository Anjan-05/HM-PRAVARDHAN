/**
 * HM Pravardhan Backend - Scoring Calculation Engine
 * Handles weighting for the 6 core institutional evaluation domains,
 * bonus credit verification rules, and final score derivation.
 */

import { CategoryScores } from '../../../shared/types/index.ts';
import {
  PERFORMANCE_CATEGORIES,
  MAX_BASE_SCORE,
  MAX_BONUS_CREDITS,
} from '../../../shared/constants/roles.ts';

export class ScoringEngine {
  /**
   * Computes weighted base score out of 100 based on standard category weights:
   * Academic: 30%, School Mgmt: 20%, Student Dev: 15%, Teacher Mgmt: 15%, Infrastructure: 10%, Admin: 10%
   */
  public static calculateBaseScore(scores: CategoryScores): number {
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
   * Computes final score (Base Score + Approved Bonus Credits capped at 10.0)
   */
  public static calculateFinalScore(baseScore: number, bonusCredits: number): number {
    const cappedBonus = Math.min(MAX_BONUS_CREDITS, Math.max(0, bonusCredits));
    return Number((baseScore + cappedBonus).toFixed(1));
  }

  /**
   * Identifies the category with the lowest score for automated guidance
   */
  public static findWeakestCategory(scores: CategoryScores): {
    category: keyof CategoryScores;
    score: number;
    weight: number;
  } {
    const categories: (keyof CategoryScores)[] = [
      'academic',
      'schoolMgmt',
      'studentDev',
      'teacherMgmt',
      'infrastructure',
      'admin',
    ];

    let lowestCat = categories[0];
    let lowestScore = scores[lowestCat] ?? 100;

    for (const cat of categories) {
      const s = scores[cat] ?? 0;
      if (s < lowestScore) {
        lowestScore = s;
        lowestCat = cat;
      }
    }

    return {
      category: lowestCat,
      score: lowestScore,
      weight: PERFORMANCE_CATEGORIES[lowestCat].weight,
    };
  }
}
