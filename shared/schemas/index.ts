/**
 * HM Pravardhan - Shared Validation Schemas & Data Contracts
 * Validates payloads for achievements, student marks, complaints, appeals, and posts.
 */

import {
  CategoryScores,
  SubjectMarks,
  AchievementCategory,
  ComplaintCategory,
} from '../types/index.ts';

export const VALID_ACHIEVEMENT_CATEGORIES: AchievementCategory[] = [
  'Academic Achievement',
  'Sports Achievement',
  'Cultural Achievement',
  'Science & Innovation',
  'Environmental Initiative',
  'School Development',
  'Teacher Achievement',
  'Student Achievement',
  'Community Initiative',
  'Special Recognition',
];

export const VALID_COMPLAINT_CATEGORIES: ComplaintCategory[] = [
  'Ranking Score Appeal',
  'Incorrect Performance Data',
  'Infrastructure Problem',
  'Teacher/Staff Shortage',
  'Academic Resource Problem',
  'Funding Issue',
  'Administrative Issue',
  'Other',
];

export function validateCategoryScores(scores: Partial<CategoryScores>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const keys: (keyof CategoryScores)[] = [
    'academic',
    'schoolMgmt',
    'studentDev',
    'teacherMgmt',
    'infrastructure',
    'admin',
  ];

  for (const key of keys) {
    const val = scores[key];
    if (val === undefined || val === null) {
      errors.push(`Missing score for category: ${key}`);
    } else if (typeof val !== 'number' || val < 0 || val > 100) {
      errors.push(`Invalid score for ${key}: must be between 0 and 100`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateSubjectMarks(marks: Partial<SubjectMarks>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const subjects: (keyof SubjectMarks)[] = [
    'telugu',
    'hindi',
    'english',
    'mathematics',
    'science',
    'socialStudies',
  ];

  for (const subj of subjects) {
    const val = marks[subj];
    if (val === undefined || val === null) {
      errors.push(`Missing mark for subject: ${subj}`);
    } else if (typeof val !== 'number' || val < 0 || val > 100) {
      errors.push(`Invalid mark for ${subj}: must be between 0 and 100`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
