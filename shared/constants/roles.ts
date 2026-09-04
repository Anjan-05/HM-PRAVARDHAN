/**
 * HM Pravardhan - Shared Role Constants
 * Defines role identifiers, permissions, and institutional metadata
 * safely shared across frontend and backend environments.
 */

export const ROLES = {
  VISITOR: 'VISITOR',
  HEADMASTER: 'HEADMASTER',
  MANDAL_EDUCATION_OFFICER: 'MEO',
  DISTRICT_EDUCATION_OFFICER: 'DEO',
} as const;

export type AppRoleKey = keyof typeof ROLES;
export type AppRoleValue = (typeof ROLES)[AppRoleKey];

export const ROLE_LABELS: Record<AppRoleValue, string> = {
  [ROLES.VISITOR]: 'Public Visitor',
  [ROLES.HEADMASTER]: 'Gazetted Headmaster',
  [ROLES.MANDAL_EDUCATION_OFFICER]: 'Mandal Education Officer (MEO)',
  [ROLES.DISTRICT_EDUCATION_OFFICER]: 'District Education Officer (DEO)',
};

export const ROLE_DESCRIPTIONS: Record<AppRoleValue, string> = {
  [ROLES.VISITOR]: 'Public citizen access for transparent school profiles, state rankings, and verified feed updates.',
  [ROLES.HEADMASTER]: 'Institutional administrator for Class 10 student marks, achievement submissions, and grievance filing.',
  [ROLES.MANDAL_EDUCATION_OFFICER]: 'Mandal-level authority for school inspections, marks verification, and mandal rankings.',
  [ROLES.DISTRICT_EDUCATION_OFFICER]: 'District-level executive authority for achievement verification, bonus credits, and appeal resolution.',
};

/**
 * Institutional Evaluation Performance Categories & Weights
 */
export const PERFORMANCE_CATEGORIES = {
  academic: {
    key: 'academic',
    label: 'Academic Performance',
    weight: 0.3, // 30%
    description: 'Pass percentage, standardized test scores, grade averages, learning outcomes',
  },
  schoolMgmt: {
    key: 'schoolMgmt',
    label: 'School Management',
    weight: 0.2, // 20%
    description: 'Attendance discipline, dropout reduction, safety standards, SMC meetings',
  },
  studentDev: {
    key: 'studentDev',
    label: 'Student Development',
    weight: 0.15, // 15%
    description: 'Co-curricular activities, sports tournaments, club participation, science exhibitions',
  },
  teacherMgmt: {
    key: 'teacherMgmt',
    label: 'Teacher Management',
    weight: 0.15, // 15%
    description: 'Teacher attendance, lesson plan adherence, training participation, mentoring',
  },
  infrastructure: {
    key: 'infrastructure',
    label: 'Infrastructure & Facilities',
    weight: 0.1, // 10%
    description: 'Classroom maintenance, drinking water, sanitation, library, computer lab status',
  },
  admin: {
    key: 'admin',
    label: 'Administrative Performance',
    weight: 0.1, // 10%
    description: 'Timely report submission, grant utilization, midday meal audit, compliance',
  },
} as const;

export const MAX_BASE_SCORE = 100;
export const MAX_BONUS_CREDITS = 10;
export const MAX_FINAL_SCORE = 110;
