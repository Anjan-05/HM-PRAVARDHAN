import { Router, Request, Response } from 'express';
import { db } from '../db.ts';

const router = Router();

// Health check
router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Demo accounts endpoint
router.get('/auth/demo-users', (req: Request, res: Response) => {
  const users = db.getUsers();
  res.json(users);
});

// Login endpoint (controlled demo authentication)
router.post('/auth/login', (req: Request, res: Response) => {
  const { email, password, role } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const user = db.getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials. User not found in official registry.' });
  }

  // Check role match
  if (role) {
    const roleMatches =
      user.role === role ||
      (role === 'DEO' && (user.role === 'DEO' || user.role === 'EDUCATION_OFFICER')) ||
      (role === 'EDUCATION_OFFICER' && (user.role === 'DEO' || user.role === 'EDUCATION_OFFICER'));
    if (!roleMatches) {
      return res.status(403).json({
        error: `Access Denied: This account is registered as ${user.role}, not ${role}.`,
      });
    }
  }

  // For demo project: standard password check or demo pass
  const validPassword =
    !password ||
    password === 'meo123' ||
    password === 'deo123' ||
    password === 'officer123' ||
    password === 'hm123' ||
    password === 'demo123' ||
    password === 'password' ||
    password.length >= 4;

  if (!validPassword) {
    return res.status(401).json({ error: 'Incorrect password.' });
  }

  res.json({
    success: true,
    user,
    token: `demo-token-${user.id}-${Date.now()}`,
  });
});

// Schools
router.get('/schools', (req: Request, res: Response) => {
  const { district, mandal, search } = req.query;
  let schools = db.getSchools();

  if (district && district !== 'All') {
    schools = schools.filter((s) => s.district.toLowerCase() === String(district).toLowerCase());
  }
  if (mandal && mandal !== 'All') {
    schools = schools.filter((s) => s.mandal.toLowerCase() === String(mandal).toLowerCase());
  }
  if (search) {
    const q = String(search).toLowerCase();
    schools = schools.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.schoolCode.toLowerCase().includes(q) ||
        s.headmasterName.toLowerCase().includes(q)
    );
  }

  res.json(schools);
});

router.get('/schools/:id', (req: Request, res: Response) => {
  const school = db.getSchoolById(req.params.id);
  if (!school) return res.status(404).json({ error: 'School not found' });
  res.json(school);
});

router.post('/schools', (req: Request, res: Response) => {
  const newSchool = db.addSchool(req.body);
  res.status(201).json(newSchool);
});

router.put('/schools/:id', (req: Request, res: Response) => {
  const updated = db.updateSchool(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'School not found' });
  res.json(updated);
});

router.delete('/schools/:id', (req: Request, res: Response) => {
  const success = db.deleteSchool(req.params.id);
  if (!success) return res.status(404).json({ error: 'School not found' });
  res.json({ success: true });
});

// Headmasters
router.get('/headmasters', (req: Request, res: Response) => {
  const hms = db.getHeadmasters();
  res.json(hms);
});

router.get('/headmasters/:id', (req: Request, res: Response) => {
  const hm = db.getHeadmasterById(req.params.id);
  if (!hm) return res.status(404).json({ error: 'Headmaster not found' });
  res.json(hm);
});

router.post('/headmasters', (req: Request, res: Response) => {
  const newHm = db.addHeadmaster(req.body);
  res.status(201).json(newHm);
});

router.put('/headmasters/:id', (req: Request, res: Response) => {
  const updated = db.updateHeadmaster(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Headmaster not found' });
  res.json(updated);
});

// Performance Records & History
router.get('/performance', (req: Request, res: Response) => {
  const { headmasterId, period } = req.query;
  if (headmasterId) {
    const records = db.getPerformanceByHeadmaster(String(headmasterId));
    return res.json(records);
  }
  const records = db.getPerformanceRecords(period ? String(period) : undefined);
  res.json(records);
});

router.get('/performance/:headmasterId/latest', (req: Request, res: Response) => {
  const record = db.getLatestPerformanceRecord(req.params.headmasterId);
  if (!record) return res.status(404).json({ error: 'No performance record found for this HM' });
  res.json(record);
});

router.post('/performance', (req: Request, res: Response) => {
  const saved = db.savePerformanceRecord(req.body);
  res.json(saved);
});

// Rankings
router.get('/rankings', (req: Request, res: Response) => {
  const period = req.query.period ? String(req.query.period) : 'Term 3 (2025-26)';
  let records = db.getPerformanceRecords(period);

  const { district, mandal, search } = req.query;
  if (district && district !== 'All') {
    records = records.filter((r) => r.district.toLowerCase() === String(district).toLowerCase());
  }
  if (mandal && mandal !== 'All') {
    records = records.filter((r) => r.mandal.toLowerCase() === String(mandal).toLowerCase());
  }
  if (search) {
    const q = String(search).toLowerCase();
    records = records.filter(
      (r) =>
        r.headmasterName.toLowerCase().includes(q) ||
        r.schoolName.toLowerCase().includes(q)
    );
  }

  // Sort by finalScore desc
  records.sort((a, b) => b.finalScore - a.finalScore);
  res.json(records);
});

router.post('/rankings/recalculate', (req: Request, res: Response) => {
  const period = req.body.period || 'Term 3 (2025-26)';
  db.recalculateRankings(period);
  const updated = db.getPerformanceRecords(period);
  res.json({ success: true, count: updated.length });
});

// Achievements
router.get('/achievements', (req: Request, res: Response) => {
  const { headmasterId, status, featuredOnly } = req.query;
  const achievements = db.getAchievements({
    headmasterId: headmasterId ? String(headmasterId) : undefined,
    status: status ? String(status) : undefined,
    featuredOnly: featuredOnly === 'true',
  });
  res.json(achievements);
});

router.post('/achievements', (req: Request, res: Response) => {
  const { headmasterId, headmasterName, schoolId, schoolName, district, mandal, title, description, category, achievementDate, imageUrl, documentUrl, documentName } = req.body;
  if (!title || !category || !headmasterId) {
    return res.status(400).json({ error: 'Title, Category, and Headmaster are required.' });
  }

  const created = db.addAchievement({
    headmasterId,
    headmasterName,
    schoolId,
    schoolName,
    district,
    mandal,
    title,
    description: description || '',
    category,
    achievementDate: achievementDate || new Date().toISOString().split('T')[0],
    imageUrl,
    documentUrl,
    documentName,
  });

  res.status(201).json(created);
});

router.put('/achievements/:id/verify', (req: Request, res: Response) => {
  const { status, bonusCreditsAwarded, isFeatured, officerFeedback, verifiedBy } = req.body;
  if (!status || !verifiedBy) {
    return res.status(400).json({ error: 'Status and VerifiedBy are required.' });
  }

  const updated = db.verifyAchievement(req.params.id, {
    status,
    bonusCreditsAwarded: Number(bonusCreditsAwarded || 0),
    isFeatured: Boolean(isFeatured),
    officerFeedback,
    verifiedBy,
  });

  if (!updated) return res.status(404).json({ error: 'Achievement not found' });
  res.json(updated);
});

// --- Activity Feed Posts ---
router.get('/activities', (req: Request, res: Response) => {
  const { headmasterId, category, search, mandal, district } = req.query;
  const posts = db.getActivityPosts({
    headmasterId: headmasterId ? String(headmasterId) : undefined,
    category: category ? String(category) : undefined,
    search: search ? String(search) : undefined,
    mandal: mandal ? String(mandal) : undefined,
    district: district ? String(district) : undefined,
  });
  res.json(posts);
});

router.get('/activities/:id', (req: Request, res: Response) => {
  const post = db.getActivityPostById(req.params.id);
  if (!post) return res.status(404).json({ error: 'Activity post not found.' });
  res.json(post);
});

router.post('/activities', (req: Request, res: Response) => {
  const {
    headmasterId,
    headmasterName,
    schoolId,
    schoolName,
    district,
    mandal,
    title,
    description,
    category,
    activityDate,
    media,
  } = req.body;

  if (!headmasterId || !title || !category) {
    return res.status(400).json({ error: 'Headmaster, Title, and Category are required.' });
  }

  const created = db.addActivityPost({
    headmasterId,
    headmasterName: headmasterName || 'Headmaster',
    schoolId: schoolId || '',
    schoolName: schoolName || '',
    district: district || '',
    mandal: mandal || '',
    title,
    description: description || '',
    category,
    activityDate: activityDate || new Date().toISOString().split('T')[0],
    media: media || [],
  });

  res.status(201).json(created);
});

router.put('/activities/:id', (req: Request, res: Response) => {
  const { requestingHmId, title, description, category, activityDate, media } = req.body;

  if (!requestingHmId) {
    return res.status(400).json({ error: 'requestingHmId is required to verify ownership.' });
  }

  const result = db.updateActivityPost(
    req.params.id,
    { title, description, category, activityDate, media },
    requestingHmId
  );

  if (!result.success) {
    if (result.error?.includes('Unauthorized')) {
      return res.status(403).json({ error: result.error });
    }
    return res.status(404).json({ error: result.error || 'Failed to update post.' });
  }

  res.json(result.post);
});

router.delete('/activities/:id', (req: Request, res: Response) => {
  const requestingHmId = (req.query.requestingHmId || req.body.requestingHmId) as string;

  if (!requestingHmId) {
    return res.status(400).json({ error: 'requestingHmId is required to verify ownership.' });
  }

  const result = db.deleteActivityPost(req.params.id, requestingHmId);

  if (!result.success) {
    if (result.error?.includes('Unauthorized')) {
      return res.status(403).json({ error: result.error });
    }
    return res.status(404).json({ error: result.error || 'Failed to delete post.' });
  }

  res.json({ success: true });
});

router.post('/activities/:id/like', (req: Request, res: Response) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required to like/cheer post.' });
  }

  const updated = db.toggleLikeActivityPost(req.params.id, userId);
  if (!updated) {
    return res.status(404).json({ error: 'Activity post not found.' });
  }

  res.json(updated);
});

// Complaints
router.get('/complaints', (req: Request, res: Response) => {
  const { headmasterId } = req.query;
  const complaints = db.getComplaints(headmasterId ? String(headmasterId) : undefined);
  res.json(complaints);
});

router.post('/complaints', (req: Request, res: Response) => {
  const { headmasterId, headmasterName, schoolId, schoolName, district, title, category, description, relatedPerformanceCategory, supportingDocUrl, supportingDocName } = req.body;
  if (!title || !category || !headmasterId) {
    return res.status(400).json({ error: 'Title, category, and Headmaster are required.' });
  }

  const created = db.addComplaint({
    headmasterId,
    headmasterName,
    schoolId,
    schoolName,
    district,
    title,
    category,
    description: description || '',
    relatedPerformanceCategory,
    supportingDocUrl,
    supportingDocName,
  });

  res.status(201).json(created);
});

router.put('/complaints/:id/respond', (req: Request, res: Response) => {
  const { status, officerResponse, resolvedBy } = req.body;
  if (!status || !resolvedBy) {
    return res.status(400).json({ error: 'Status and ResolvedBy are required.' });
  }

  const updated = db.updateComplaint(req.params.id, {
    status,
    officerResponse,
    resolvedBy,
  });

  if (!updated) return res.status(404).json({ error: 'Complaint not found' });
  res.json(updated);
});

// Score Appeals
router.get('/appeals', (req: Request, res: Response) => {
  const { headmasterId } = req.query;
  const appeals = db.getScoreAppeals(headmasterId ? String(headmasterId) : undefined);
  res.json(appeals);
});

router.post('/appeals', (req: Request, res: Response) => {
  const {
    headmasterId,
    headmasterName,
    schoolId,
    schoolName,
    performanceRecordId,
    evaluationPeriod,
    affectedCategory,
    currentCategoryScore,
    claimedCategoryScore,
    reason,
    evidenceUrl,
    evidenceName,
  } = req.body;

  if (!headmasterId || !affectedCategory || !reason) {
    return res.status(400).json({ error: 'Required appeal fields missing.' });
  }

  const created = db.addScoreAppeal({
    headmasterId,
    headmasterName,
    schoolId,
    schoolName,
    performanceRecordId,
    evaluationPeriod,
    affectedCategory,
    currentCategoryScore: Number(currentCategoryScore || 0),
    claimedCategoryScore: Number(claimedCategoryScore || 0),
    reason,
    evidenceUrl,
    evidenceName,
  });

  res.status(201).json(created);
});

router.put('/appeals/:id/review', (req: Request, res: Response) => {
  const { status, reviewRemarks, adjustedCategoryScore, reviewedBy } = req.body;
  if (!status || !reviewedBy) {
    return res.status(400).json({ error: 'Status and ReviewedBy are required.' });
  }

  const updated = db.reviewScoreAppeal(req.params.id, {
    status,
    reviewRemarks: reviewRemarks || '',
    adjustedCategoryScore: adjustedCategoryScore !== undefined ? Number(adjustedCategoryScore) : undefined,
    reviewedBy,
  });

  if (!updated) return res.status(404).json({ error: 'Appeal not found' });
  res.json(updated);
});

// --- Student Performance Records ---
router.get('/students', (req: Request, res: Response) => {
  const { schoolId, mandal, district, class: studentClass, search } = req.query;
  const students = db.getStudents({
    schoolId: schoolId ? String(schoolId) : undefined,
    mandal: mandal ? String(mandal) : undefined,
    district: district ? String(district) : undefined,
    class: studentClass ? String(studentClass) : undefined,
    search: search ? String(search) : undefined,
  });
  res.json(students);
});

router.get('/students/summary', (req: Request, res: Response) => {
  const { schoolId, mandal, district } = req.query;
  const summary = db.getStudentSummary({
    schoolId: schoolId ? String(schoolId) : undefined,
    mandal: mandal ? String(mandal) : undefined,
    district: district ? String(district) : undefined,
  });
  res.json(summary);
});

router.get('/students/:id', (req: Request, res: Response) => {
  const student = db.getStudentById(req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  res.json(student);
});

router.post('/students', (req: Request, res: Response) => {
  try {
    const {
      studentName,
      rollNumber,
      schoolId,
      schoolName,
      district,
      mandal,
      class: studentClass,
      section,
      academicYear,
      gender,
      marks,
    } = req.body;

    if (!studentName || !rollNumber || !schoolId || !marks) {
      return res.status(400).json({ error: 'studentName, rollNumber, schoolId, and marks are required.' });
    }

    const created = db.addStudent({
      studentName,
      rollNumber,
      schoolId,
      schoolName,
      district,
      mandal,
      class: studentClass,
      section,
      academicYear,
      gender,
      marks,
    });

    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create student' });
  }
});

router.put('/students/:id', (req: Request, res: Response) => {
  try {
    const updated = db.updateStudent(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Student not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update student' });
  }
});

router.delete('/students/:id', (req: Request, res: Response) => {
  const result = db.deleteStudent(req.params.id);
  if (!result.success) return res.status(400).json({ error: result.error || 'Failed to delete student' });
  res.json({ success: true });
});

// Notifications
router.get('/notifications/:userId', (req: Request, res: Response) => {
  const notifs = db.getNotifications(req.params.userId);
  res.json(notifs);
});

router.put('/notifications/:id/read', (req: Request, res: Response) => {
  const success = db.markNotificationRead(req.params.id);
  res.json({ success });
});

router.put('/notifications/read-all/:userId', (req: Request, res: Response) => {
  const success = db.markAllNotificationsRead(req.params.userId);
  res.json({ success });
});

// Analytics
router.get('/analytics', (req: Request, res: Response) => {
  const summary = db.getAnalytics();
  res.json(summary);
});

// Reset Demo Data
router.post('/reset-demo', (req: Request, res: Response) => {
  db.resetToSeed();
  res.json({ success: true, message: 'Database reset to demo state.' });
});

export default router;
