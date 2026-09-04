import fs from 'fs';
import path from 'path';
import {
  User,
  School,
  Headmaster,
  PerformanceRecord,
  Achievement,
  Complaint,
  ScoreAppeal,
  AppNotification,
  AnalyticsSummary,
  CategoryScores,
  ActivityPost,
  ActivityMedia,
  StudentRecord,
  SubjectMarks,
  StudentPerformanceSummary,
} from '../src/types.ts';
import { generateSeedData, calculateBaseScore, computeStudentStats } from './data/seedData.ts';

interface DatabaseSchema {
  users: User[];
  schools: School[];
  headmasters: Headmaster[];
  performanceRecords: PerformanceRecord[];
  achievements: Achievement[];
  complaints: Complaint[];
  scoreAppeals: ScoreAppeal[];
  notifications: AppNotification[];
  activityPosts: ActivityPost[];
  students: StudentRecord[];
}

function resolveDataPaths(): { dir: string; file: string } {
  const currentDir = typeof __dirname !== 'undefined' ? __dirname : process.cwd();
  const candidates = [
    path.join(process.cwd(), 'server', 'data'),
    path.join(currentDir, '..', 'server', 'data'),
    path.join(currentDir, 'server', 'data'),
    path.join('/tmp', 'hm-server-data'),
  ];

  for (const dir of candidates) {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const testFile = path.join(dir, '.test-write');
      fs.writeFileSync(testFile, 'ok');
      fs.unlinkSync(testFile);
      return { dir, file: path.join(dir, 'store.json') };
    } catch {
      continue;
    }
  }
  return { dir: '/tmp', file: path.join('/tmp', 'store.json') };
}

const { dir: DATA_DIR, file: DATA_FILE } = resolveDataPaths();

export class Database {
  private data: DatabaseSchema;
  private isLoaded = false;

  constructor() {
    this.data = {
      users: [],
      schools: [],
      headmasters: [],
      performanceRecords: [],
      achievements: [],
      complaints: [],
      scoreAppeals: [],
      notifications: [],
      activityPosts: [],
      students: [],
    };
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        let dirty = false;
        const seed = generateSeedData();
        if (!this.data.activityPosts || this.data.activityPosts.length === 0) {
          this.data.activityPosts = seed.activityPosts || [];
          dirty = true;
        }
        if (!this.data.students || this.data.students.length === 0) {
          this.data.students = seed.students || [];
          dirty = true;
        }
        if (!this.data.users) {
          this.data.users = seed.users;
          dirty = true;
        } else {
          // Ensure MEO and DEO demo accounts are always present and up-to-date
          seed.users.forEach((seedUser) => {
            const exists = this.data.users.find((u) => u.email.toLowerCase() === seedUser.email.toLowerCase());
            if (!exists) {
              this.data.users.push(seedUser);
              dirty = true;
            } else {
              Object.assign(exists, seedUser);
              dirty = true;
            }
          });
        }
        if (dirty) {
          this.persist();
        }
        this.isLoaded = true;
      } else {
        this.resetToSeed();
      }
    } catch (err) {
      console.error('Failed to load database from disk, using fresh seed data:', err);
      this.resetToSeed();
    }
  }

  private persist() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist database to disk:', err);
    }
  }

  public resetToSeed() {
    const seed = generateSeedData();
    this.data = seed;
    this.persist();
    return this.data;
  }

  // --- Users & Auth ---
  public getUsers(): User[] {
    return this.data.users;
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  // --- Schools ---
  public getSchools(): School[] {
    return this.data.schools;
  }

  public getSchoolById(id: string): School | undefined {
    return this.data.schools.find((s) => s.id === id);
  }

  public addSchool(school: Omit<School, 'id'>): School {
    const id = `sch-${Date.now()}`;
    const newSchool: School = { ...school, id };
    this.data.schools.push(newSchool);
    this.persist();
    return newSchool;
  }

  public updateSchool(id: string, updates: Partial<School>): School | undefined {
    const idx = this.data.schools.findIndex((s) => s.id === id);
    if (idx === -1) return undefined;
    this.data.schools[idx] = { ...this.data.schools[idx], ...updates };

    // Update schoolName in performance records & achievements if changed
    if (updates.name) {
      this.data.performanceRecords.forEach((r) => {
        if (r.schoolId === id) r.schoolName = updates.name!;
      });
      this.data.achievements.forEach((a) => {
        if (a.schoolId === id) a.schoolName = updates.name!;
      });
    }

    this.persist();
    return this.data.schools[idx];
  }

  public deleteSchool(id: string): boolean {
    const idx = this.data.schools.findIndex((s) => s.id === id);
    if (idx === -1) return false;
    this.data.schools.splice(idx, 1);
    this.persist();
    return true;
  }

  // --- Headmasters ---
  public getHeadmasters(): Headmaster[] {
    return this.data.headmasters;
  }

  public getHeadmasterById(id: string): Headmaster | undefined {
    return this.data.headmasters.find((h) => h.id === id);
  }

  public getHeadmasterByUserId(userId: string): Headmaster | undefined {
    return this.data.headmasters.find((h) => h.userId === userId);
  }

  public addHeadmaster(hm: Omit<Headmaster, 'id'>): Headmaster {
    const id = `hm-${Date.now()}`;
    const newHm: Headmaster = { ...hm, id };
    this.data.headmasters.push(newHm);

    // Update school's assigned HM
    if (newHm.schoolId) {
      const sch = this.data.schools.find((s) => s.id === newHm.schoolId);
      if (sch) {
        sch.headmasterId = newHm.id;
        sch.headmasterName = newHm.name;
      }
    }

    this.persist();
    return newHm;
  }

  public updateHeadmaster(id: string, updates: Partial<Headmaster>): Headmaster | undefined {
    const idx = this.data.headmasters.findIndex((h) => h.id === id);
    if (idx === -1) return undefined;
    this.data.headmasters[idx] = { ...this.data.headmasters[idx], ...updates };

    if (updates.name) {
      const sch = this.data.schools.find((s) => s.headmasterId === id);
      if (sch) sch.headmasterName = updates.name;

      this.data.performanceRecords.forEach((r) => {
        if (r.headmasterId === id) r.headmasterName = updates.name!;
      });
      this.data.achievements.forEach((a) => {
        if (a.headmasterId === id) a.headmasterName = updates.name!;
      });
    }

    this.persist();
    return this.data.headmasters[idx];
  }

  // --- Performance Records & Rankings ---
  public getPerformanceRecords(period?: string): PerformanceRecord[] {
    if (period) {
      return this.data.performanceRecords.filter((r) => r.evaluationPeriod === period);
    }
    return this.data.performanceRecords;
  }

  public getPerformanceByHeadmaster(headmasterId: string): PerformanceRecord[] {
    return this.data.performanceRecords
      .filter((r) => r.headmasterId === headmasterId)
      .sort((a, b) => b.periodOrder - a.periodOrder);
  }

  public getLatestPerformanceRecord(headmasterId: string): PerformanceRecord | undefined {
    const records = this.getPerformanceByHeadmaster(headmasterId);
    return records[0];
  }

  public recalculateRankings(period: string) {
    const periodRecords = this.data.performanceRecords.filter((r) => r.evaluationPeriod === period);
    if (periodRecords.length === 0) return;

    // 1. Recalculate baseScore and finalScore for each
    periodRecords.forEach((r) => {
      r.baseScore = calculateBaseScore(r.categories);
      // Cap approved bonus credits at 10 max
      const cappedBonus = Math.min(10, Math.max(0, r.approvedBonusCredits || 0));
      r.approvedBonusCredits = cappedBonus;
      r.finalScore = Math.round((r.baseScore + cappedBonus) * 10) / 10;
    });

    // 2. Sort overall by finalScore desc
    periodRecords.sort((a, b) => b.finalScore - a.finalScore);
    periodRecords.forEach((r, idx) => {
      const newRank = idx + 1;
      r.overallRank = newRank;
    });

    // 3. District ranks
    const districts = Array.from(new Set(periodRecords.map((r) => r.district)));
    districts.forEach((dist) => {
      const distRecords = periodRecords.filter((r) => r.district === dist);
      distRecords.sort((a, b) => b.finalScore - a.finalScore);
      distRecords.forEach((r, idx) => {
        r.districtRank = idx + 1;
      });
    });

    // 4. Mandal ranks
    const mandals = Array.from(new Set(periodRecords.map((r) => `${r.district}|${r.mandal}`)));
    mandals.forEach((m) => {
      const [dist, mandal] = m.split('|');
      const mandalRecords = periodRecords.filter((r) => r.district === dist && r.mandal === mandal);
      mandalRecords.sort((a, b) => b.finalScore - a.finalScore);
      mandalRecords.forEach((r, idx) => {
        r.mandalRank = idx + 1;
      });
    });

    // 5. Calculate rankChange and improvementPercentage
    periodRecords.forEach((r) => {
      if (r.periodOrder > 1) {
        const prev = this.data.performanceRecords.find(
          (prevR) => prevR.headmasterId === r.headmasterId && prevR.periodOrder === r.periodOrder - 1
        );
        if (prev) {
          r.previousPeriodScore = prev.finalScore;
          r.previousRank = prev.overallRank;
          r.rankChange = prev.overallRank - r.overallRank;
          r.improvementPercentage =
            Math.round(((r.finalScore - prev.finalScore) / prev.finalScore) * 1000) / 10;
          r.performanceTrend =
            r.improvementPercentage > 1.5 ? 'UP' : r.improvementPercentage < -1.5 ? 'DOWN' : 'STABLE';
        }
      }
    });

    this.persist();
  }

  public savePerformanceRecord(
    recordData: Omit<
      PerformanceRecord,
      'id' | 'baseScore' | 'finalScore' | 'overallRank' | 'districtRank' | 'mandalRank' | 'rankChange' | 'performanceTrend'
    >
  ): PerformanceRecord {
    const existingIdx = this.data.performanceRecords.findIndex(
      (r) =>
        r.headmasterId === recordData.headmasterId &&
        r.evaluationPeriod === recordData.evaluationPeriod
    );

    const baseScore = calculateBaseScore(recordData.categories);
    const bonus = Math.min(10, Math.max(0, recordData.approvedBonusCredits || 0));
    const finalScore = Math.round((baseScore + bonus) * 10) / 10;

    let record: PerformanceRecord;
    if (existingIdx !== -1) {
      record = {
        ...this.data.performanceRecords[existingIdx],
        ...recordData,
        baseScore,
        approvedBonusCredits: bonus,
        finalScore,
      };
      this.data.performanceRecords[existingIdx] = record;
    } else {
      const id = `perf-${recordData.headmasterId}-${Date.now()}`;
      record = {
        ...recordData,
        id,
        baseScore,
        approvedBonusCredits: bonus,
        finalScore,
        overallRank: 1,
        districtRank: 1,
        mandalRank: 1,
        rankChange: 0,
        performanceTrend: 'BASELINE',
      };
      this.data.performanceRecords.push(record);
    }

    this.recalculateRankings(recordData.evaluationPeriod);
    return record;
  }

  // --- Achievements ---
  public getAchievements(filter?: {
    headmasterId?: string;
    status?: string;
    featuredOnly?: boolean;
  }): Achievement[] {
    let result = [...this.data.achievements];
    if (filter?.headmasterId) {
      result = result.filter((a) => a.headmasterId === filter.headmasterId);
    }
    if (filter?.status) {
      result = result.filter((a) => a.status === filter.status);
    }
    if (filter?.featuredOnly) {
      result = result.filter((a) => a.isFeatured && a.status === 'VERIFIED');
    }
    // Most recent first
    return result.sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
  }

  public addAchievement(achievement: Omit<Achievement, 'id' | 'status' | 'bonusCreditsAwarded' | 'isFeatured' | 'submittedAt'>): Achievement {
    const id = `ach-${Date.now()}`;
    const newAch: Achievement = {
      ...achievement,
      id,
      status: 'PENDING_VERIFICATION',
      bonusCreditsAwarded: 0,
      isFeatured: false,
      submittedAt: new Date().toISOString(),
    };
    this.data.achievements.unshift(newAch);

    // Notify Education Officer of new submission
    const eoUser = this.data.users.find((u) => u.role === 'EDUCATION_OFFICER');
    if (eoUser) {
      this.createNotification({
        userId: eoUser.id,
        title: 'New Achievement Submitted',
        message: `${achievement.headmasterName} submitted "${achievement.title}" for verification.`,
        type: 'SCORE_UPDATE',
        relatedId: id,
      });
    }

    this.persist();
    return newAch;
  }

  public verifyAchievement(
    id: string,
    params: {
      status: 'VERIFIED' | 'REJECTED' | 'INFO_REQUIRED';
      bonusCreditsAwarded?: number;
      isFeatured?: boolean;
      officerFeedback?: string;
      verifiedBy: string;
    }
  ): Achievement | undefined {
    const ach = this.data.achievements.find((a) => a.id === id);
    if (!ach) return undefined;

    ach.status = params.status;
    ach.verifiedAt = new Date().toISOString();
    ach.verifiedBy = params.verifiedBy;
    if (params.officerFeedback !== undefined) ach.officerFeedback = params.officerFeedback;
    if (params.isFeatured !== undefined) ach.isFeatured = params.isFeatured;

    const awardedBonus = params.status === 'VERIFIED' ? Number(params.bonusCreditsAwarded || 0) : 0;
    ach.bonusCreditsAwarded = awardedBonus;

    // Recalculate HM's bonus credits on active performance record
    // Only approved bonus credits affect final score
    const hmVerifiedAchievements = this.data.achievements.filter(
      (a) => a.headmasterId === ach.headmasterId && a.status === 'VERIFIED'
    );
    const totalBonus = Math.min(
      10,
      hmVerifiedAchievements.reduce((sum, a) => sum + (a.bonusCreditsAwarded || 0), 0)
    );

    // Update active / latest performance record
    const latestRecord = this.getLatestPerformanceRecord(ach.headmasterId);
    if (latestRecord) {
      latestRecord.approvedBonusCredits = totalBonus;
      latestRecord.finalScore = Math.round((latestRecord.baseScore + totalBonus) * 10) / 10;
      this.recalculateRankings(latestRecord.evaluationPeriod);
    }

    // Find HM user to send notification
    const hm = this.data.headmasters.find((h) => h.id === ach.headmasterId);
    if (hm) {
      const user = this.data.users.find((u) => u.headmasterId === hm.id || u.id === hm.userId);
      if (user) {
        if (params.status === 'VERIFIED') {
          this.createNotification({
            userId: user.id,
            title: `Achievement Verified! ${awardedBonus > 0 ? `(+${awardedBonus} Bonus Credits)` : ''}`,
            message: `"${ach.title}" was verified by ${params.verifiedBy}.${awardedBonus > 0 ? ` ${awardedBonus} bonus points were added to your Final Score.` : ''}`,
            type: awardedBonus > 0 ? 'BONUS_AWARDED' : 'ACHIEVEMENT_VERIFIED',
            relatedId: ach.id,
          });
        } else if (params.status === 'REJECTED') {
          this.createNotification({
            userId: user.id,
            title: 'Achievement Verification Update',
            message: `Your achievement "${ach.title}" was rejected. Feedback: ${params.officerFeedback || 'Criteria not met.'}`,
            type: 'ACHIEVEMENT_VERIFIED',
            relatedId: ach.id,
          });
        } else if (params.status === 'INFO_REQUIRED') {
          this.createNotification({
            userId: user.id,
            title: 'Additional Information Required',
            message: `Education Officer requested additional information for "${ach.title}". Feedback: ${params.officerFeedback || 'Please provide more details.'}`,
            type: 'ACHIEVEMENT_VERIFIED',
            relatedId: ach.id,
          });
        }
      }
    }

    this.persist();
    return ach;
  }

  // --- Complaints ---
  public getComplaints(headmasterId?: string): Complaint[] {
    let list = [...this.data.complaints];
    if (headmasterId) {
      list = list.filter((c) => c.headmasterId === headmasterId);
    }
    return list.sort(
      (a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime()
    );
  }

  public addComplaint(complaint: Omit<Complaint, 'id' | 'complaintNumber' | 'submissionDate' | 'status'>): Complaint {
    const nextNum = String(this.data.complaints.length + 101).padStart(4, '0');
    const complaintNumber = `CMP-2025-${nextNum}`;
    const newComplaint: Complaint = {
      ...complaint,
      id: `cmp-${Date.now()}`,
      complaintNumber,
      submissionDate: new Date().toISOString(),
      status: 'Submitted',
    };
    this.data.complaints.unshift(newComplaint);

    // Notify EO
    const eoUser = this.data.users.find((u) => u.role === 'EDUCATION_OFFICER');
    if (eoUser) {
      this.createNotification({
        userId: eoUser.id,
        title: `New Complaint Filed (${complaintNumber})`,
        message: `${complaint.headmasterName} submitted a complaint: "${complaint.title}".`,
        type: 'COMPLAINT_RESPONSE',
        relatedId: newComplaint.id,
      });
    }

    this.persist();
    return newComplaint;
  }

  public updateComplaint(
    id: string,
    params: {
      status: Complaint['status'];
      officerResponse?: string;
      resolvedBy: string;
    }
  ): Complaint | undefined {
    const cmp = this.data.complaints.find((c) => c.id === id);
    if (!cmp) return undefined;

    cmp.status = params.status;
    cmp.resolvedBy = params.resolvedBy;
    cmp.responseDate = new Date().toISOString();
    if (params.officerResponse !== undefined) cmp.officerResponse = params.officerResponse;

    // Notify HM
    const hm = this.data.headmasters.find((h) => h.id === cmp.headmasterId);
    if (hm) {
      const user = this.data.users.find((u) => u.headmasterId === hm.id || u.id === hm.userId);
      if (user) {
        this.createNotification({
          userId: user.id,
          title: `Complaint Status Updated: ${cmp.complaintNumber}`,
          message: `Your complaint has been updated to "${params.status}". Officer response: ${params.officerResponse || 'Status updated.'}`,
          type: 'COMPLAINT_RESPONSE',
          relatedId: cmp.id,
        });
      }
    }

    this.persist();
    return cmp;
  }

  // --- Score Appeals ---
  public getScoreAppeals(headmasterId?: string): ScoreAppeal[] {
    let list = [...this.data.scoreAppeals];
    if (headmasterId) {
      list = list.filter((a) => a.headmasterId === headmasterId);
    }
    return list.sort(
      (a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime()
    );
  }

  public addScoreAppeal(appeal: Omit<ScoreAppeal, 'id' | 'appealNumber' | 'submissionDate' | 'status'>): ScoreAppeal {
    const nextNum = String(this.data.scoreAppeals.length + 11).padStart(4, '0');
    const appealNumber = `APL-2025-${nextNum}`;
    const newAppeal: ScoreAppeal = {
      ...appeal,
      id: `apl-${Date.now()}`,
      appealNumber,
      submissionDate: new Date().toISOString(),
      status: 'SUBMITTED',
    };
    this.data.scoreAppeals.unshift(newAppeal);

    // Notify EO
    const eoUser = this.data.users.find((u) => u.role === 'EDUCATION_OFFICER');
    if (eoUser) {
      this.createNotification({
        userId: eoUser.id,
        title: `New Score Appeal (${appealNumber})`,
        message: `${appeal.headmasterName} appealed their ${appeal.affectedCategory} score in ${appeal.evaluationPeriod}.`,
        type: 'APPEAL_DECISION',
        relatedId: newAppeal.id,
      });
    }

    this.persist();
    return newAppeal;
  }

  public reviewScoreAppeal(
    id: string,
    params: {
      status: 'APPROVED' | 'REJECTED';
      reviewRemarks: string;
      adjustedCategoryScore?: number;
      reviewedBy: string;
    }
  ): ScoreAppeal | undefined {
    const apl = this.data.scoreAppeals.find((a) => a.id === id);
    if (!apl) return undefined;

    apl.status = params.status;
    apl.reviewRemarks = params.reviewRemarks;
    apl.reviewedBy = params.reviewedBy;
    apl.reviewDate = new Date().toISOString();

    if (params.status === 'APPROVED' && params.adjustedCategoryScore !== undefined) {
      apl.adjustedCategoryScore = params.adjustedCategoryScore;

      // Find performance record and correct score
      const record = this.data.performanceRecords.find((r) => r.id === apl.performanceRecordId);
      if (record) {
        record.categories[apl.affectedCategory] = params.adjustedCategoryScore;
        record.baseScore = calculateBaseScore(record.categories);
        record.finalScore = Math.round((record.baseScore + record.approvedBonusCredits) * 10) / 10;
        this.recalculateRankings(record.evaluationPeriod);
      }
    }

    // Notify HM
    const hm = this.data.headmasters.find((h) => h.id === apl.headmasterId);
    if (hm) {
      const user = this.data.users.find((u) => u.headmasterId === hm.id || u.id === hm.userId);
      if (user) {
        this.createNotification({
          userId: user.id,
          title: `Score Appeal Decision: ${apl.appealNumber}`,
          message:
            params.status === 'APPROVED'
              ? `Your appeal was APPROVED! Category score adjusted to ${params.adjustedCategoryScore}. Base score and rankings updated.`
              : `Your appeal was REJECTED. Officer remarks: ${params.reviewRemarks}`,
          type: 'APPEAL_DECISION',
          relatedId: apl.id,
        });
      }
    }

    this.persist();
    return apl;
  }

  // --- Notifications ---
  public getNotifications(userId: string): AppNotification[] {
    return this.data.notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createNotification(notif: Omit<AppNotification, 'id' | 'isRead' | 'createdAt'>): AppNotification {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    this.data.notifications.unshift(newNotif);
    this.persist();
    return newNotif;
  }

  public markNotificationRead(id: string): boolean {
    const n = this.data.notifications.find((notif) => notif.id === id);
    if (!n) return false;
    n.isRead = true;
    this.persist();
    return true;
  }

  public markAllNotificationsRead(userId: string): boolean {
    this.data.notifications.forEach((n) => {
      if (n.userId === userId) n.isRead = true;
    });
    this.persist();
    return true;
  }

  // --- Analytics ---
  public getAnalytics(): AnalyticsSummary {
    const latestPeriod = 'Term 3 (2025-26)';
    const records = this.data.performanceRecords.filter((r) => r.evaluationPeriod === latestPeriod);

    const totalScore = records.reduce((sum, r) => sum + r.finalScore, 0);
    const avgScore = records.length > 0 ? Math.round((totalScore / records.length) * 10) / 10 : 0;

    // Top performing HMs (top 5)
    const sortedByScore = [...records].sort((a, b) => b.finalScore - a.finalScore);
    const topPerformingHMs = sortedByScore.slice(0, 5).map((r) => ({
      hmId: r.headmasterId,
      hmName: r.headmasterName,
      schoolName: r.schoolName,
      district: r.district,
      finalScore: r.finalScore,
      overallRank: r.overallRank,
    }));

    // Most improved HMs (top 5 with positive improvement)
    const sortedByImprovement = [...records]
      .filter((r) => (r.improvementPercentage || 0) > 0)
      .sort((a, b) => (b.improvementPercentage || 0) - (a.improvementPercentage || 0));

    const mostImprovedHMs = sortedByImprovement.slice(0, 5).map((r) => ({
      hmId: r.headmasterId,
      hmName: r.headmasterName,
      schoolName: r.schoolName,
      district: r.district,
      currentScore: r.finalScore,
      previousScore: r.previousPeriodScore || r.finalScore,
      improvementPercentage: r.improvementPercentage || 0,
    }));

    // Pending counts
    const pendingComplaintsCount = this.data.complaints.filter(
      (c) => c.status === 'Submitted' || c.status === 'Under Review'
    ).length;
    const pendingAppealsCount = this.data.scoreAppeals.filter(
      (a) => a.status === 'SUBMITTED' || a.status === 'UNDER_REVIEW'
    ).length;
    const pendingVerificationsCount = this.data.achievements.filter(
      (a) => a.status === 'PENDING_VERIFICATION'
    ).length;

    // District stats
    const districts = Array.from(new Set(records.map((r) => r.district)));
    const districtStats = districts.map((dist) => {
      const distRecords = records.filter((r) => r.district === dist);
      const distTotal = distRecords.reduce((sum, r) => sum + r.finalScore, 0);
      const distAvg = Math.round((distTotal / distRecords.length) * 10) / 10;
      return {
        district: dist,
        schoolsCount: distRecords.length,
        averageScore: distAvg,
      };
    });

    return {
      totalSchools: this.data.schools.length,
      totalHeadmasters: this.data.headmasters.length,
      averagePerformanceScore: avgScore,
      topPerformingHMs,
      mostImprovedHMs,
      pendingComplaintsCount,
      pendingAppealsCount,
      pendingVerificationsCount,
      districtStats,
    };
  }

  // --- Activity Feed Posts ---
  public getActivityPosts(filter?: {
    headmasterId?: string;
    category?: string;
    search?: string;
    district?: string;
    mandal?: string;
  }): ActivityPost[] {
    let posts = [...(this.data.activityPosts || [])];

    if (filter?.headmasterId) {
      posts = posts.filter((p) => p.headmasterId === filter.headmasterId);
    }
    if (filter?.mandal) {
      posts = posts.filter((p) => p.mandal.toLowerCase() === filter.mandal!.toLowerCase());
    }
    if (filter?.district) {
      posts = posts.filter((p) => p.district.toLowerCase() === filter.district!.toLowerCase());
    }
    if (filter?.category && filter.category !== 'All') {
      posts = posts.filter((p) => p.category === filter.category);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      posts = posts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.headmasterName.toLowerCase().includes(q) ||
          p.schoolName.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.district.toLowerCase().includes(q) ||
          p.mandal.toLowerCase().includes(q)
      );
    }

    // Sort by createdAt descending (most recent first)
    return posts.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getActivityPostById(id: string): ActivityPost | undefined {
    return (this.data.activityPosts || []).find((p) => p.id === id);
  }

  public addActivityPost(
    post: Omit<ActivityPost, 'id' | 'createdAt' | 'updatedAt' | 'likesCount' | 'likedBy'> & {
      likesCount?: number;
      likedBy?: string[];
    }
  ): ActivityPost {
    const id = `act-${Date.now()}`;
    const now = new Date().toISOString();
    const formattedMedia = (post.media || []).map((m, idx) => ({
      ...m,
      id: m.id || `med-${id}-${idx + 1}-${Date.now()}`,
      activityPostId: id,
      createdAt: m.createdAt || now,
    }));

    const newPost: ActivityPost = {
      ...post,
      id,
      media: formattedMedia,
      likesCount: post.likesCount || 0,
      likedBy: post.likedBy || [],
      createdAt: now,
      updatedAt: now,
    };

    if (!this.data.activityPosts) {
      this.data.activityPosts = [];
    }
    this.data.activityPosts.unshift(newPost);
    this.persist();
    return newPost;
  }

  public updateActivityPost(
    id: string,
    updates: Partial<ActivityPost>,
    requestingHmId: string
  ): { success: boolean; post?: ActivityPost; error?: string } {
    if (!this.data.activityPosts) {
      return { success: false, error: 'No activity posts found.' };
    }

    const post = this.data.activityPosts.find((p) => p.id === id);
    if (!post) {
      return { success: false, error: 'Activity post not found.' };
    }

    // Security check: Only the owner Headmaster can edit this post
    if (post.headmasterId !== requestingHmId) {
      return {
        success: false,
        error: 'Unauthorized: You are only allowed to edit your own activity posts.',
      };
    }

    if (updates.title !== undefined) post.title = updates.title;
    if (updates.description !== undefined) post.description = updates.description;
    if (updates.category !== undefined) post.category = updates.category;
    if (updates.activityDate !== undefined) post.activityDate = updates.activityDate;
    if (updates.media !== undefined) {
      post.media = updates.media.map((m, idx) => ({
        ...m,
        id: m.id || `med-${id}-${idx + 1}-${Date.now()}`,
        activityPostId: id,
        createdAt: m.createdAt || new Date().toISOString(),
      }));
    }
    post.updatedAt = new Date().toISOString();

    this.persist();
    return { success: true, post };
  }

  public deleteActivityPost(
    id: string,
    requestingHmId: string
  ): { success: boolean; error?: string } {
    if (!this.data.activityPosts) {
      return { success: false, error: 'No activity posts found.' };
    }

    const idx = this.data.activityPosts.findIndex((p) => p.id === id);
    if (idx === -1) {
      return { success: false, error: 'Activity post not found.' };
    }

    const post = this.data.activityPosts[idx];
    // Security check: Only the owner Headmaster can delete this post
    if (post.headmasterId !== requestingHmId) {
      return {
        success: false,
        error: 'Unauthorized: You are only allowed to delete your own activity posts.',
      };
    }

    this.data.activityPosts.splice(idx, 1);
    this.persist();
    return { success: true };
  }

  public toggleLikeActivityPost(id: string, userId: string): ActivityPost | undefined {
    if (!this.data.activityPosts) return undefined;
    const post = this.data.activityPosts.find((p) => p.id === id);
    if (!post) return undefined;

    post.likedBy = post.likedBy || [];
    const alreadyLiked = post.likedBy.includes(userId);

    if (alreadyLiked) {
      post.likedBy = post.likedBy.filter((u) => u !== userId);
      post.likesCount = Math.max(0, (post.likesCount || 1) - 1);
    } else {
      post.likedBy.push(userId);
      post.likesCount = (post.likesCount || 0) + 1;
    }

    this.persist();
    return post;
  }

  // --- Student Performance Records ---
  public getStudents(filters?: {
    schoolId?: string;
    mandal?: string;
    district?: string;
    class?: string;
    search?: string;
  }): StudentRecord[] {
    let list = this.data.students || [];

    if (filters?.schoolId) {
      list = list.filter((s) => s.schoolId === filters.schoolId);
    }
    if (filters?.mandal) {
      list = list.filter((s) => s.mandal.toLowerCase() === filters.mandal!.toLowerCase());
    }
    if (filters?.district) {
      list = list.filter((s) => s.district.toLowerCase() === filters.district!.toLowerCase());
    }
    if (filters?.class) {
      list = list.filter((s) => s.class.toLowerCase() === filters.class!.toLowerCase());
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (s) =>
          s.studentName.toLowerCase().includes(q) ||
          s.rollNumber.toLowerCase().includes(q) ||
          s.schoolName.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => b.totalMarks - a.totalMarks);
  }

  public getStudentById(id: string): StudentRecord | undefined {
    return (this.data.students || []).find((s) => s.id === id);
  }

  public addStudent(data: {
    studentName: string;
    rollNumber: string;
    schoolId: string;
    schoolName?: string;
    district?: string;
    mandal?: string;
    class?: string;
    section?: string;
    academicYear?: string;
    gender?: 'Male' | 'Female' | 'Other';
    marks: SubjectMarks;
  }): StudentRecord {
    if (!this.data.students) this.data.students = [];

    // Validate marks between 0 and 100
    const subjects: (keyof SubjectMarks)[] = [
      'telugu',
      'hindi',
      'english',
      'mathematics',
      'science',
      'socialStudies',
    ];
    for (const subj of subjects) {
      const val = Number(data.marks[subj]) || 0;
      if (val < 0 || val > 100) {
        throw new Error(`Invalid mark for ${subj}: must be between 0 and 100`);
      }
      data.marks[subj] = Math.round(val);
    }

    const school = this.getSchoolById(data.schoolId);
    const stats = computeStudentStats(data.marks);

    const newStudent: StudentRecord = {
      id: `stu-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      studentName: data.studentName.trim(),
      rollNumber: data.rollNumber.trim(),
      schoolId: data.schoolId,
      schoolName: data.schoolName || school?.name || 'Government High School',
      district: data.district || school?.district || 'Warangal Urban',
      mandal: data.mandal || school?.mandal || 'Kazipet',
      class: data.class || 'Class 10',
      section: data.section || 'A',
      academicYear: data.academicYear || '2025-26',
      gender: data.gender || 'Male',
      marks: data.marks,
      ...stats,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.students.push(newStudent);
    this.persist();
    return newStudent;
  }

  public updateStudent(
    id: string,
    updates: Partial<{
      studentName: string;
      rollNumber: string;
      class: string;
      section: string;
      academicYear: string;
      gender: 'Male' | 'Female' | 'Other';
      marks: SubjectMarks;
    }>
  ): StudentRecord | undefined {
    if (!this.data.students) return undefined;
    const idx = this.data.students.findIndex((s) => s.id === id);
    if (idx === -1) return undefined;

    const current = this.data.students[idx];

    let marks = current.marks;
    if (updates.marks) {
      const subjects: (keyof SubjectMarks)[] = [
        'telugu',
        'hindi',
        'english',
        'mathematics',
        'science',
        'socialStudies',
      ];
      for (const subj of subjects) {
        const val = Number(updates.marks[subj] ?? current.marks[subj]) || 0;
        if (val < 0 || val > 100) {
          throw new Error(`Invalid mark for ${subj}: must be between 0 and 100`);
        }
        updates.marks[subj] = Math.round(val);
      }
      marks = { ...current.marks, ...updates.marks };
    }

    const stats = computeStudentStats(marks);

    const updated: StudentRecord = {
      ...current,
      ...updates,
      marks,
      ...stats,
      updatedAt: new Date().toISOString(),
    };

    this.data.students[idx] = updated;
    this.persist();
    return updated;
  }

  public deleteStudent(id: string): { success: boolean; error?: string } {
    if (!this.data.students) return { success: false, error: 'Student list empty' };
    const idx = this.data.students.findIndex((s) => s.id === id);
    if (idx === -1) {
      return { success: false, error: 'Student record not found' };
    }
    this.data.students.splice(idx, 1);
    this.persist();
    return { success: true };
  }

  public getStudentSummary(filters?: {
    schoolId?: string;
    mandal?: string;
    district?: string;
  }): StudentPerformanceSummary {
    const list = this.getStudents(filters);
    if (list.length === 0) {
      return {
        totalStudents: 0,
        averageMarks: 0,
        highestMarks: 0,
        passPercentage: 0,
        subjectAverages: {
          telugu: 0,
          hindi: 0,
          english: 0,
          mathematics: 0,
          science: 0,
          socialStudies: 0,
        },
      };
    }

    const totalStudents = list.length;
    const totalScoreSum = list.reduce((acc, s) => acc + s.totalMarks, 0);
    const highestMarks = Math.max(...list.map((s) => s.totalMarks));
    const passedCount = list.filter((s) => s.passed).length;

    const subjectSums = {
      telugu: list.reduce((acc, s) => acc + s.marks.telugu, 0),
      hindi: list.reduce((acc, s) => acc + s.marks.hindi, 0),
      english: list.reduce((acc, s) => acc + s.marks.english, 0),
      mathematics: list.reduce((acc, s) => acc + s.marks.mathematics, 0),
      science: list.reduce((acc, s) => acc + s.marks.science, 0),
      socialStudies: list.reduce((acc, s) => acc + s.marks.socialStudies, 0),
    };

    return {
      totalStudents,
      averageMarks: Math.round((totalScoreSum / totalStudents) * 10) / 10,
      highestMarks,
      passPercentage: Math.round((passedCount / totalStudents) * 1000) / 10,
      subjectAverages: {
        telugu: Math.round((subjectSums.telugu / totalStudents) * 10) / 10,
        hindi: Math.round((subjectSums.hindi / totalStudents) * 10) / 10,
        english: Math.round((subjectSums.english / totalStudents) * 10) / 10,
        mathematics: Math.round((subjectSums.mathematics / totalStudents) * 10) / 10,
        science: Math.round((subjectSums.science / totalStudents) * 10) / 10,
        socialStudies: Math.round((subjectSums.socialStudies / totalStudents) * 10) / 10,
      },
    };
  }
}

export const db = new Database();
