export type UserRole = 'VISITOR' | 'HEADMASTER' | 'MEO' | 'DEO' | 'PUBLIC' | 'EDUCATION_OFFICER';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  headmasterId?: string; // If role is HEADMASTER
  mandal?: string; // If role is MEO
  district?: string; // If role is MEO or DEO
  designation?: string;
  department?: string;
  avatarUrl?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export type SchoolCategory = 'Primary (1-5)' | 'Upper Primary (1-8)' | 'High School (6-10)' | 'Higher Secondary (6-12)' | 'Model School';

export interface School {
  id: string;
  schoolCode: string;
  name: string;
  district: string;
  mandal: string;
  category: SchoolCategory;
  studentCount: number;
  teacherCount: number;
  headmasterId: string;
  headmasterName: string;
  address: string;
  establishedYear: number;
  contactNumber: string;
}

export interface Headmaster {
  id: string;
  userId: string;
  name: string;
  email: string;
  qualification: string;
  experienceYears: number;
  joiningDate: string;
  schoolId: string;
  schoolName: string;
  district: string;
  mandal: string;
  phone: string;
  photoUrl?: string;
}

export interface CategoryScores {
  academic: number; // 30% weight
  studentDev: number; // 15% weight
  schoolMgmt: number; // 20% weight
  teacherMgmt: number; // 15% weight
  infrastructure: number; // 10% weight
  admin: number; // 10% weight
}

export type PerformanceCategory = keyof CategoryScores;

export interface PerformanceRecord {
  id: string;
  headmasterId: string;
  headmasterName: string;
  schoolId: string;
  schoolName: string;
  district: string;
  mandal: string;
  evaluationPeriod: string; // e.g., 'Term 1 (2025-26)', 'Term 2 (2025-26)', 'Term 3 (2025-26)'
  periodOrder: number; // 1, 2, 3
  categories: CategoryScores;
  baseScore: number; // Weighted calculation out of 100
  approvedBonusCredits: number; // Bonus credits awarded (max 10)
  finalScore: number; // baseScore + approvedBonusCredits
  previousPeriodScore?: number;
  improvementPercentage?: number; // ((Current - Previous) / Previous) * 100
  performanceTrend: 'UP' | 'DOWN' | 'STABLE' | 'BASELINE';
  districtRank: number;
  mandalRank: number;
  overallRank: number;
  previousRank?: number;
  rankChange: number; // positive is improvement e.g. +2, negative is drop e.g. -1
  evaluatedBy: string;
  evaluatedAt: string;
  officerRemarks?: string;
}

export type AchievementCategory =
  | 'Academic Achievement'
  | 'Sports Achievement'
  | 'Cultural Achievement'
  | 'Science & Innovation'
  | 'Environmental Initiative'
  | 'School Development'
  | 'Teacher Achievement'
  | 'Student Achievement'
  | 'Community Initiative'
  | 'Special Recognition';

export type VerificationStatus = 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED' | 'INFO_REQUIRED';

export interface Achievement {
  id: string;
  headmasterId: string;
  headmasterName: string;
  schoolId: string;
  schoolName: string;
  district: string;
  mandal: string;
  title: string;
  description: string;
  category: AchievementCategory;
  achievementDate: string;
  imageUrl?: string;
  documentUrl?: string;
  documentName?: string;
  status: VerificationStatus;
  bonusCreditsAwarded: number; // Typically 1 to 3 if verified and approved
  isFeatured: boolean;
  submittedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  officerFeedback?: string;
}

export type ComplaintCategory =
  | 'Ranking Score Appeal'
  | 'Incorrect Performance Data'
  | 'Infrastructure Problem'
  | 'Teacher/Staff Shortage'
  | 'Academic Resource Problem'
  | 'Funding Issue'
  | 'Administrative Issue'
  | 'Other';

export type ComplaintStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Additional Information Required'
  | 'Resolved'
  | 'Rejected';

export interface Complaint {
  id: string;
  complaintNumber: string; // e.g. "CMP-2025-0104"
  headmasterId: string;
  headmasterName: string;
  schoolId: string;
  schoolName: string;
  district: string;
  title: string;
  category: ComplaintCategory;
  description: string;
  relatedPerformanceCategory?: keyof CategoryScores | 'General';
  supportingDocUrl?: string;
  supportingDocName?: string;
  submissionDate: string;
  status: ComplaintStatus;
  officerResponse?: string;
  responseDate?: string;
  resolvedBy?: string;
}

export type AppealStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';

export interface ScoreAppeal {
  id: string;
  appealNumber: string; // e.g. "APL-2025-0012"
  headmasterId: string;
  headmasterName: string;
  schoolId: string;
  schoolName: string;
  performanceRecordId: string;
  evaluationPeriod: string;
  affectedCategory: keyof CategoryScores;
  currentCategoryScore: number;
  claimedCategoryScore: number;
  reason: string;
  evidenceUrl?: string;
  evidenceName?: string;
  status: AppealStatus;
  submissionDate: string;
  reviewedBy?: string;
  reviewDate?: string;
  reviewRemarks?: string;
  adjustedCategoryScore?: number;
}

export interface AppNotification {
  id: string;
  userId: string; // target user
  title: string;
  message: string;
  type: 'SCORE_UPDATE' | 'RANK_CHANGE' | 'APPEAL_DECISION' | 'COMPLAINT_RESPONSE' | 'ACHIEVEMENT_VERIFIED' | 'BONUS_AWARDED';
  relatedId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AnalyticsSummary {
  totalSchools: number;
  totalHeadmasters: number;
  averagePerformanceScore: number;
  topPerformingHMs: {
    hmId: string;
    hmName: string;
    schoolName: string;
    district: string;
    finalScore: number;
    overallRank: number;
  }[];
  mostImprovedHMs: {
    hmId: string;
    hmName: string;
    schoolName: string;
    district: string;
    currentScore: number;
    previousScore: number;
    improvementPercentage: number;
  }[];
  pendingComplaintsCount: number;
  pendingAppealsCount: number;
  pendingVerificationsCount: number;
  districtStats: {
    district: string;
    schoolsCount: number;
    averageScore: number;
  }[];
}

export type ActivityCategory =
  | 'Academic Activity'
  | 'Sports'
  | 'Cultural Activity'
  | 'Science & Innovation'
  | 'Student Activity'
  | 'Community Activity'
  | 'Environmental Activity'
  | 'School Event'
  | 'Awareness Program'
  | 'Other';

export interface ActivityMedia {
  id: string;
  activityPostId: string;
  mediaUrl: string;
  mediaType: 'IMAGE' | 'VIDEO';
  caption?: string;
  createdAt: string;
}

export interface ActivityPost {
  id: string;
  headmasterId: string;
  headmasterName: string;
  schoolId: string;
  schoolName: string;
  district: string;
  mandal: string;
  title: string;
  description: string;
  category: ActivityCategory;
  activityDate: string;
  media: ActivityMedia[];
  likesCount?: number;
  likedBy?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SubjectMarks {
  telugu: number;
  hindi: number;
  english: number;
  mathematics: number;
  science: number;
  socialStudies: number;
}

export interface StudentRecord {
  id: string;
  studentName: string;
  rollNumber: string;
  schoolId: string;
  schoolName: string;
  district: string;
  mandal: string;
  class: string; // e.g., 'Class 10'
  section: string; // e.g., 'A'
  academicYear: string; // e.g., '2025-26'
  gender: 'Male' | 'Female' | 'Other';
  marks: SubjectMarks;
  totalMarks: number; // Max 600
  percentage: number; // 0 to 100
  grade: string; // 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'D' | 'F'
  passed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudentPerformanceSummary {
  totalStudents: number;
  averageMarks: number;
  highestMarks: number;
  passPercentage: number;
  subjectAverages: {
    telugu: number;
    hindi: number;
    english: number;
    mathematics: number;
    science: number;
    socialStudies: number;
  };
}
