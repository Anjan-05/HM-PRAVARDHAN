import {
  User,
  School,
  Headmaster,
  PerformanceRecord,
  Achievement,
  Complaint,
  ScoreAppeal,
  AppNotification,
  CategoryScores,
  ActivityPost,
  StudentRecord,
  SubjectMarks,
} from '../../src/types.ts';

export function calculateBaseScore(c: CategoryScores): number {
  const base =
    c.academic * 0.3 +
    c.studentDev * 0.15 +
    c.schoolMgmt * 0.2 +
    c.teacherMgmt * 0.15 +
    c.infrastructure * 0.1 +
    c.admin * 0.1;
  return Math.round(base * 10) / 10;
}

export function computeStudentStats(marks: SubjectMarks) {
  const totalMarks =
    marks.telugu +
    marks.hindi +
    marks.english +
    marks.mathematics +
    marks.science +
    marks.socialStudies;
  const percentage = Math.round((totalMarks / 6) * 10) / 10;
  const passed =
    marks.telugu >= 35 &&
    marks.hindi >= 35 &&
    marks.english >= 35 &&
    marks.mathematics >= 35 &&
    marks.science >= 35 &&
    marks.socialStudies >= 35;

  let grade = 'F';
  if (!passed) {
    grade = 'F';
  } else if (percentage >= 91) {
    grade = 'A1';
  } else if (percentage >= 81) {
    grade = 'A2';
  } else if (percentage >= 71) {
    grade = 'B1';
  } else if (percentage >= 61) {
    grade = 'B2';
  } else if (percentage >= 51) {
    grade = 'C1';
  } else if (percentage >= 41) {
    grade = 'C2';
  } else {
    grade = 'D';
  }

  return { totalMarks, percentage, grade, passed };
}

export function generateSeedData() {
  const users: User[] = [
    {
      id: 'user-deo-1',
      name: 'Dr. K. Srinivas Rao, Ph.D.',
      email: 'deo@govschools.in',
      role: 'DEO',
      district: 'Warangal Urban',
      designation: 'District Educational Officer (DEO)',
      department: 'Department of School Education, Warangal Urban District',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'user-eo-legacy',
      name: 'Dr. K. Srinivas Rao',
      email: 'officer@govschools.in',
      role: 'DEO',
      district: 'Warangal Urban',
      designation: 'District Educational Officer (DEO)',
      department: 'Department of School Education, Warangal Urban District',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'user-meo-1',
      name: 'S. Venkateshwarlu, M.A., B.Ed.',
      email: 'meo@govschools.in',
      role: 'MEO',
      mandal: 'Kazipet',
      district: 'Warangal Urban',
      designation: 'Mandal Educational Officer (MEO)',
      department: 'Mandal Resource Centre, Kazipet Mandal',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'user-hm-1',
      name: 'M. Ramakrishna, M.Sc., B.Ed.',
      email: 'hm1@govschools.in',
      role: 'HEADMASTER',
      headmasterId: 'hm-1',
      designation: 'Headmaster (Gazetted)',
      department: 'ZPHS Kazipet, Warangal Urban',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'user-hm-2',
      name: 'Smt. P. Anitha, M.A., B.Ed.',
      email: 'hm2@govschools.in',
      role: 'HEADMASTER',
      headmasterId: 'hm-2',
      designation: 'Headmaster (Gazetted)',
      department: 'Govt Model High School, Hanamkonda',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 'user-hm-3',
      name: 'V. Satyanarayana, M.Sc., M.Ed.',
      email: 'hm3@govschools.in',
      role: 'HEADMASTER',
      headmasterId: 'hm-3',
      designation: 'Headmaster (Gazetted)',
      department: 'Govt High School, Karimnagar Town',
    },
  ];

  const rawSchools = [
    {
      id: 'sch-1',
      schoolCode: 'SCH-3601-01',
      name: 'Zilla Parishad High School, Kazipet',
      district: 'Warangal Urban',
      mandal: 'Kazipet',
      category: 'High School (6-10)' as const,
      studentCount: 520,
      teacherCount: 22,
      hmId: 'hm-1',
      hmName: 'M. Ramakrishna, M.Sc., B.Ed.',
      address: 'Main Road, Near Railway Junction, Kazipet',
      establishedYear: 1968,
      contactNumber: '0870-2451201',
    },
    {
      id: 'sch-2',
      schoolCode: 'SCH-3601-02',
      name: 'Government Model High School, Hanamkonda',
      district: 'Warangal Urban',
      mandal: 'Hanamkonda',
      category: 'Model School' as const,
      studentCount: 680,
      teacherCount: 28,
      hmId: 'hm-2',
      hmName: 'Smt. P. Anitha, M.A., B.Ed.',
      address: 'Subedari, Hanamkonda',
      establishedYear: 1974,
      contactNumber: '0870-2578912',
    },
    {
      id: 'sch-3',
      schoolCode: 'SCH-3602-01',
      name: 'Government High School, Karimnagar Main',
      district: 'Karimnagar',
      mandal: 'Karimnagar Urban',
      category: 'High School (6-10)' as const,
      studentCount: 610,
      teacherCount: 25,
      hmId: 'hm-3',
      hmName: 'V. Satyanarayana, M.Sc., M.Ed.',
      address: 'Collectorate Road, Karimnagar',
      establishedYear: 1971,
      contactNumber: '0878-2234511',
    },
    {
      id: 'sch-4',
      schoolCode: 'SCH-3601-03',
      name: 'Zilla Parishad High School, Waddepally',
      district: 'Warangal Urban',
      mandal: 'Hanamkonda',
      category: 'High School (6-10)' as const,
      studentCount: 440,
      teacherCount: 18,
      hmId: 'hm-4',
      hmName: 'K. Venkateshwarlu, M.A.',
      address: 'Waddepally Lake Road, Hanamkonda',
      establishedYear: 1982,
      contactNumber: '0870-2443322',
    },
    {
      id: 'sch-5',
      schoolCode: 'SCH-3603-01',
      name: 'Government Boys High School, Nampally',
      district: 'Hyderabad',
      mandal: 'Nampally',
      category: 'High School (6-10)' as const,
      studentCount: 780,
      teacherCount: 32,
      hmId: 'hm-5',
      hmName: 'Syed Abdul Rahim, M.Sc.',
      address: 'Station Road, Nampally, Hyderabad',
      establishedYear: 1955,
      contactNumber: '040-24601123',
    },
    {
      id: 'sch-6',
      schoolCode: 'SCH-3603-02',
      name: 'Government Girls High School, Mahbubia',
      district: 'Hyderabad',
      mandal: 'Abids',
      category: 'Higher Secondary (6-12)' as const,
      studentCount: 890,
      teacherCount: 38,
      hmId: 'hm-6',
      hmName: 'Dr. Fatima Begum, Ph.D.',
      address: 'Gunfoundry, Abids, Hyderabad',
      establishedYear: 1948,
      contactNumber: '040-23204567',
    },
    {
      id: 'sch-7',
      schoolCode: 'SCH-3604-01',
      name: 'Zilla Parishad High School, Shamshabad',
      district: 'Ranga Reddy',
      mandal: 'Shamshabad',
      category: 'High School (6-10)' as const,
      studentCount: 510,
      teacherCount: 20,
      hmId: 'hm-7',
      hmName: 'G. Mohan Reddy, M.Sc.',
      address: 'Airport Approach Road, Shamshabad',
      establishedYear: 1985,
      contactNumber: '08413-228901',
    },
    {
      id: 'sch-8',
      schoolCode: 'SCH-3604-02',
      name: 'Telangana State Model School, Ghatkesar',
      district: 'Medchal-Malkajgiri',
      mandal: 'Ghatkesar',
      category: 'Model School' as const,
      studentCount: 650,
      teacherCount: 27,
      hmId: 'hm-8',
      hmName: 'Smt. B. Sunitha, M.Phil.',
      address: 'Near ORR Junction, Ghatkesar',
      establishedYear: 2013,
      contactNumber: '08415-287654',
    },
    {
      id: 'sch-9',
      schoolCode: 'SCH-3602-02',
      name: 'Zilla Parishad High School, Choppadandi',
      district: 'Karimnagar',
      mandal: 'Choppadandi',
      category: 'High School (6-10)' as const,
      studentCount: 390,
      teacherCount: 16,
      hmId: 'hm-9',
      hmName: 'B. Rajeshwar, M.A., B.Ed.',
      address: 'Bus Stand Road, Choppadandi',
      establishedYear: 1978,
      contactNumber: '0878-2345091',
    },
    {
      id: 'sch-10',
      schoolCode: 'SCH-3605-01',
      name: 'Government High School, Sangareddy',
      district: 'Medak',
      mandal: 'Sangareddy',
      category: 'High School (6-10)' as const,
      studentCount: 560,
      teacherCount: 23,
      hmId: 'hm-10',
      hmName: 'T. Narsimha Chary, M.Sc.',
      address: 'Opposite Civil Hospital, Sangareddy',
      establishedYear: 1976,
      contactNumber: '08455-276123',
    },
    {
      id: 'sch-11',
      schoolCode: 'SCH-3606-01',
      name: 'Zilla Parishad High School, Armoor',
      district: 'Nizamabad',
      mandal: 'Armoor',
      category: 'High School (6-10)' as const,
      studentCount: 470,
      teacherCount: 19,
      hmId: 'hm-11',
      hmName: 'Ch. Gangadhar, M.A.',
      address: 'National Highway Road, Armoor',
      establishedYear: 1980,
      contactNumber: '08463-221345',
    },
    {
      id: 'sch-12',
      schoolCode: 'SCH-3607-01',
      name: 'Government High School, Khammam Fort',
      district: 'Khammam',
      mandal: 'Khammam Urban',
      category: 'High School (6-10)' as const,
      studentCount: 580,
      teacherCount: 24,
      hmId: 'hm-12',
      hmName: 'Smt. K. Lalitha, M.Sc., B.Ed.',
      address: 'Fort Road, Khammam',
      establishedYear: 1965,
      contactNumber: '08742-234789',
    },
    {
      id: 'sch-13',
      schoolCode: 'SCH-3608-01',
      name: 'Government High School, Nalgonda Town',
      district: 'Nalgonda',
      mandal: 'Nalgonda Urban',
      category: 'High School (6-10)' as const,
      studentCount: 530,
      teacherCount: 22,
      hmId: 'hm-13',
      hmName: 'P. Venkat Reddy, M.A., M.Ed.',
      address: 'Clock Tower Center, Nalgonda',
      establishedYear: 1969,
      contactNumber: '08682-245678',
    },
    {
      id: 'sch-14',
      schoolCode: 'SCH-3601-04',
      name: 'Government Upper Primary School, Hasanparthy',
      district: 'Warangal Urban',
      mandal: 'Hasanparthy',
      category: 'Upper Primary (1-8)' as const,
      studentCount: 290,
      teacherCount: 12,
      hmId: 'hm-14',
      hmName: 'D. Srinivas, B.Sc., B.Ed.',
      address: 'Village Center, Hasanparthy',
      establishedYear: 1988,
      contactNumber: '0870-2890123',
    },
    {
      id: 'sch-15',
      schoolCode: 'SCH-3602-03',
      name: 'Government Model High School, Manakondur',
      district: 'Karimnagar',
      mandal: 'Manakondur',
      category: 'Model School' as const,
      studentCount: 420,
      teacherCount: 18,
      hmId: 'hm-15',
      hmName: 'Smt. J. Madhavi, M.Sc.',
      address: 'Main Highway, Manakondur',
      establishedYear: 2012,
      contactNumber: '0878-2678123',
    },
  ];

  const schools: School[] = rawSchools.map((s) => ({
    id: s.id,
    schoolCode: s.schoolCode,
    name: s.name,
    district: s.district,
    mandal: s.mandal,
    category: s.category,
    studentCount: s.studentCount,
    teacherCount: s.teacherCount,
    headmasterId: s.hmId,
    headmasterName: s.hmName,
    address: s.address,
    establishedYear: s.establishedYear,
    contactNumber: s.contactNumber,
  }));

  const headmasters: Headmaster[] = rawSchools.map((s, idx) => ({
    id: s.hmId,
    userId: idx < 3 ? `user-hm-${idx + 1}` : `user-hm-gen-${idx + 1}`,
    name: s.hmName,
    email: idx < 3 ? `hm${idx + 1}@govschools.in` : `hm${idx + 1}@govschools.in`,
    qualification: idx % 2 === 0 ? 'M.Sc., B.Ed., PGCTE' : 'M.A., M.Ed., Ph.D.',
    experienceYears: 12 + ((idx * 3) % 15),
    joiningDate: `201${(idx % 8) + 2}-06-15`,
    schoolId: s.id,
    schoolName: s.name,
    district: s.district,
    mandal: s.mandal,
    phone: `+91 98480 ${20000 + idx * 111}`,
    photoUrl: idx === 0 
      ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
      : idx === 1
      ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
      : undefined,
  }));

  // Evaluation periods
  const periods = [
    { period: 'Term 1 (2025-26)', order: 1 },
    { period: 'Term 2 (2025-26)', order: 2 },
    { period: 'Term 3 (2025-26)', order: 3 }, // Current active term
  ];

  // Base scoring matrices for each HM across 3 terms
  const rawScores: Record<string, [CategoryScores, number, CategoryScores, number, CategoryScores, number]> = {
    'hm-1': [
      // Term 1 (baseline)
      { academic: 78, studentDev: 72, schoolMgmt: 80, teacherMgmt: 75, infrastructure: 70, admin: 82 },
      2, // bonus
      // Term 2
      { academic: 84, studentDev: 78, schoolMgmt: 85, teacherMgmt: 80, infrastructure: 74, admin: 86 },
      4,
      // Term 3 (current)
      { academic: 91, studentDev: 88, schoolMgmt: 92, teacherMgmt: 89, infrastructure: 84, admin: 90 },
      6,
    ],
    'hm-2': [
      // Term 1
      { academic: 82, studentDev: 80, schoolMgmt: 84, teacherMgmt: 82, infrastructure: 78, admin: 85 },
      3,
      // Term 2
      { academic: 87, studentDev: 84, schoolMgmt: 88, teacherMgmt: 85, infrastructure: 82, admin: 88 },
      5,
      // Term 3
      { academic: 94, studentDev: 91, schoolMgmt: 95, teacherMgmt: 92, infrastructure: 88, admin: 94 },
      8,
    ],
    'hm-3': [
      { academic: 75, studentDev: 70, schoolMgmt: 74, teacherMgmt: 72, infrastructure: 68, admin: 76 },
      1,
      { academic: 80, studentDev: 76, schoolMgmt: 81, teacherMgmt: 78, infrastructure: 74, admin: 82 },
      3,
      { academic: 88, studentDev: 84, schoolMgmt: 89, teacherMgmt: 85, infrastructure: 80, admin: 87 },
      5,
    ],
    'hm-4': [
      { academic: 70, studentDev: 65, schoolMgmt: 68, teacherMgmt: 66, infrastructure: 60, admin: 72 },
      0,
      { academic: 74, studentDev: 68, schoolMgmt: 72, teacherMgmt: 70, infrastructure: 65, admin: 75 },
      2,
      { academic: 81, studentDev: 77, schoolMgmt: 80, teacherMgmt: 76, infrastructure: 72, admin: 80 },
      3,
    ],
    'hm-5': [
      { academic: 85, studentDev: 82, schoolMgmt: 88, teacherMgmt: 84, infrastructure: 82, admin: 88 },
      4,
      { academic: 89, studentDev: 86, schoolMgmt: 90, teacherMgmt: 88, infrastructure: 85, admin: 91 },
      6,
      { academic: 95, studentDev: 93, schoolMgmt: 96, teacherMgmt: 94, infrastructure: 90, admin: 95 },
      9,
    ],
    'hm-6': [
      { academic: 86, studentDev: 84, schoolMgmt: 87, teacherMgmt: 86, infrastructure: 84, admin: 89 },
      4,
      { academic: 90, studentDev: 88, schoolMgmt: 91, teacherMgmt: 89, infrastructure: 87, admin: 92 },
      6,
      { academic: 93, studentDev: 92, schoolMgmt: 94, teacherMgmt: 91, infrastructure: 89, admin: 93 },
      7,
    ],
    'hm-7': [
      { academic: 72, studentDev: 68, schoolMgmt: 70, teacherMgmt: 69, infrastructure: 64, admin: 74 },
      1,
      { academic: 76, studentDev: 71, schoolMgmt: 75, teacherMgmt: 73, infrastructure: 68, admin: 78 },
      2,
      { academic: 82, studentDev: 79, schoolMgmt: 83, teacherMgmt: 79, infrastructure: 74, admin: 83 },
      4,
    ],
    'hm-8': [
      { academic: 80, studentDev: 78, schoolMgmt: 82, teacherMgmt: 80, infrastructure: 76, admin: 84 },
      2,
      { academic: 85, studentDev: 82, schoolMgmt: 86, teacherMgmt: 83, infrastructure: 80, admin: 87 },
      4,
      { academic: 90, studentDev: 87, schoolMgmt: 91, teacherMgmt: 88, infrastructure: 85, admin: 91 },
      6,
    ],
    'hm-9': [
      { academic: 68, studentDev: 62, schoolMgmt: 65, teacherMgmt: 64, infrastructure: 58, admin: 69 },
      0,
      { academic: 71, studentDev: 65, schoolMgmt: 69, teacherMgmt: 67, infrastructure: 62, admin: 72 },
      1,
      { academic: 77, studentDev: 72, schoolMgmt: 76, teacherMgmt: 73, infrastructure: 67, admin: 77 },
      2,
    ],
    'hm-10': [
      { academic: 74, studentDev: 71, schoolMgmt: 75, teacherMgmt: 72, infrastructure: 66, admin: 76 },
      1,
      { academic: 79, studentDev: 75, schoolMgmt: 80, teacherMgmt: 77, infrastructure: 72, admin: 81 },
      3,
      { academic: 86, studentDev: 82, schoolMgmt: 87, teacherMgmt: 83, infrastructure: 78, admin: 86 },
      5,
    ],
    'hm-11': [
      { academic: 69, studentDev: 64, schoolMgmt: 67, teacherMgmt: 66, infrastructure: 61, admin: 70 },
      0,
      { academic: 73, studentDev: 68, schoolMgmt: 71, teacherMgmt: 69, infrastructure: 65, admin: 74 },
      1,
      { academic: 79, studentDev: 74, schoolMgmt: 78, teacherMgmt: 75, infrastructure: 70, admin: 79 },
      2,
    ],
    'hm-12': [
      { academic: 76, studentDev: 73, schoolMgmt: 77, teacherMgmt: 75, infrastructure: 71, admin: 78 },
      2,
      { academic: 81, studentDev: 77, schoolMgmt: 82, teacherMgmt: 79, infrastructure: 76, admin: 83 },
      3,
      { academic: 87, studentDev: 84, schoolMgmt: 88, teacherMgmt: 85, infrastructure: 81, admin: 88 },
      5,
    ],
    'hm-13': [
      { academic: 73, studentDev: 69, schoolMgmt: 72, teacherMgmt: 70, infrastructure: 65, admin: 75 },
      1,
      { academic: 77, studentDev: 73, schoolMgmt: 77, teacherMgmt: 74, infrastructure: 70, admin: 79 },
      2,
      { academic: 83, studentDev: 79, schoolMgmt: 84, teacherMgmt: 80, infrastructure: 75, admin: 84 },
      4,
    ],
    'hm-14': [
      { academic: 65, studentDev: 60, schoolMgmt: 63, teacherMgmt: 62, infrastructure: 55, admin: 67 },
      0,
      { academic: 70, studentDev: 65, schoolMgmt: 68, teacherMgmt: 66, infrastructure: 60, admin: 71 },
      1,
      { academic: 75, studentDev: 71, schoolMgmt: 74, teacherMgmt: 71, infrastructure: 65, admin: 76 },
      2,
    ],
    'hm-15': [
      { academic: 77, studentDev: 74, schoolMgmt: 79, teacherMgmt: 76, infrastructure: 72, admin: 80 },
      2,
      { academic: 82, studentDev: 79, schoolMgmt: 84, teacherMgmt: 81, infrastructure: 77, admin: 85 },
      4,
      { academic: 89, studentDev: 86, schoolMgmt: 90, teacherMgmt: 87, infrastructure: 83, admin: 90 },
      6,
    ],
  };

  const performanceRecords: PerformanceRecord[] = [];

  // Generate records for each period
  periods.forEach((p, pIdx) => {
    schools.forEach((sch) => {
      const hmScores = rawScores[sch.headmasterId];
      if (!hmScores) return;

      const catScore = pIdx === 0 ? hmScores[0] : pIdx === 1 ? hmScores[2] : hmScores[4];
      const bonus = pIdx === 0 ? hmScores[1] : pIdx === 1 ? hmScores[3] : hmScores[5];

      const baseScore = calculateBaseScore(catScore);
      const finalScore = Math.round((baseScore + bonus) * 10) / 10;

      let prevScore: number | undefined = undefined;
      let impPct: number | undefined = undefined;
      let trend: 'UP' | 'DOWN' | 'STABLE' | 'BASELINE' = 'BASELINE';

      if (pIdx > 0) {
        const prevCat = pIdx === 1 ? hmScores[0] : hmScores[2];
        const prevBonus = pIdx === 1 ? hmScores[1] : hmScores[3];
        prevScore = Math.round((calculateBaseScore(prevCat) + prevBonus) * 10) / 10;
        impPct = Math.round(((finalScore - prevScore) / prevScore) * 1000) / 10;
        trend = impPct > 1.5 ? 'UP' : impPct < -1.5 ? 'DOWN' : 'STABLE';
      }

      performanceRecords.push({
        id: `perf-${sch.headmasterId}-${p.order}`,
        headmasterId: sch.headmasterId,
        headmasterName: sch.headmasterName,
        schoolId: sch.id,
        schoolName: sch.name,
        district: sch.district,
        mandal: sch.mandal,
        evaluationPeriod: p.period,
        periodOrder: p.order,
        categories: catScore,
        baseScore,
        approvedBonusCredits: bonus,
        finalScore,
        previousPeriodScore: prevScore,
        improvementPercentage: impPct,
        performanceTrend: trend,
        districtRank: 1, // Will be computed
        mandalRank: 1,
        overallRank: 1,
        rankChange: 0,
        evaluatedBy: 'Dr. K. Srinivas Rao, DEO',
        evaluatedAt: `2025-0${(pIdx * 4) + 3}-10T10:00:00.000Z`,
        officerRemarks:
          finalScore >= 90
            ? 'Exceptional academic progress and community engagement.'
            : finalScore >= 80
            ? 'Good overall progress with strong administrative discipline.'
            : 'Satisfactory baseline. Needs improvement in infrastructure and learning outcomes.',
      });
    });
  });

  // Calculate dynamic ranks for each period
  periods.forEach((p) => {
    const periodRecords = performanceRecords.filter((r) => r.evaluationPeriod === p.period);
    // Sort overall by finalScore desc
    periodRecords.sort((a, b) => b.finalScore - a.finalScore);
    periodRecords.forEach((r, idx) => {
      r.overallRank = idx + 1;
    });

    // District ranks
    const districts = Array.from(new Set(periodRecords.map((r) => r.district)));
    districts.forEach((dist) => {
      const distRecords = periodRecords.filter((r) => r.district === dist);
      distRecords.sort((a, b) => b.finalScore - a.finalScore);
      distRecords.forEach((r, idx) => {
        r.districtRank = idx + 1;
      });
    });

    // Mandal ranks
    const mandals = Array.from(new Set(periodRecords.map((r) => `${r.district}|${r.mandal}`)));
    mandals.forEach((m) => {
      const [dist, mandal] = m.split('|');
      const mandalRecords = periodRecords.filter((r) => r.district === dist && r.mandal === mandal);
      mandalRecords.sort((a, b) => b.finalScore - a.finalScore);
      mandalRecords.forEach((r, idx) => {
        r.mandalRank = idx + 1;
      });
    });
  });

  // Calculate rank changes between periods
  performanceRecords.forEach((r) => {
    if (r.periodOrder > 1) {
      const prev = performanceRecords.find(
        (prevR) => prevR.headmasterId === r.headmasterId && prevR.periodOrder === r.periodOrder - 1
      );
      if (prev) {
        r.previousRank = prev.overallRank;
        // In ranking: if prev was 5 and current is 3, improvement is +2 (5 - 3)
        r.rankChange = prev.overallRank - r.overallRank;
      }
    }
  });

  const achievements: Achievement[] = [
    {
      id: 'ach-1',
      headmasterId: 'hm-1',
      headmasterName: 'M. Ramakrishna, M.Sc., B.Ed.',
      schoolId: 'sch-1',
      schoolName: 'Zilla Parishad High School, Kazipet',
      district: 'Warangal Urban',
      mandal: 'Kazipet',
      title: 'State Science Fair 1st Prize — Solar Irrigation Project',
      description: 'Class 10 students developed an IoT-based automated solar irrigation system for dryland farmers, winning first prize at the State Level Jawaharlal Nehru National Science Exhibition.',
      category: 'Science & Innovation',
      achievementDate: '2025-08-15',
      imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
      documentUrl: 'data:text/plain;charset=utf-8;base64,U3RhdGUgU2NpZW5jZSBGYWlyIENlcnRpZmljYXRlIG9mIEV4Y2VsbGVuY2U=',
      documentName: 'Science_Fair_Certificate_2025.pdf',
      status: 'VERIFIED',
      bonusCreditsAwarded: 3,
      isFeatured: true,
      submittedAt: '2025-08-18T11:00:00.000Z',
      verifiedAt: '2025-08-22T14:30:00.000Z',
      verifiedBy: 'Dr. K. Srinivas Rao, DEO',
      officerFeedback: 'Remarkable student project and excellent mentorship by science teachers under HM leadership. 3 bonus credits approved.',
    },
    {
      id: 'ach-2',
      headmasterId: 'hm-1',
      headmasterName: 'M. Ramakrishna, M.Sc., B.Ed.',
      schoolId: 'sch-1',
      schoolName: 'Zilla Parishad High School, Kazipet',
      district: 'Warangal Urban',
      mandal: 'Kazipet',
      title: '100% Pass Percentage in SSC Public Examinations',
      description: 'Achieved 100% pass results in the SSC Board examinations with 18 students securing 10/10 GPA scores, supported by special morning and evening study hours.',
      category: 'Academic Achievement',
      achievementDate: '2025-05-20',
      imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80',
      documentName: 'SSC_Results_Gazette_Notification.pdf',
      status: 'VERIFIED',
      bonusCreditsAwarded: 3,
      isFeatured: true,
      submittedAt: '2025-05-25T09:00:00.000Z',
      verifiedAt: '2025-06-01T10:00:00.000Z',
      verifiedBy: 'Dr. K. Srinivas Rao, DEO',
      officerFeedback: 'Outstanding academic accomplishment for a government school in Kazipet mandal.',
    },
    {
      id: 'ach-3',
      headmasterId: 'hm-2',
      headmasterName: 'Smt. P. Anitha, M.A., B.Ed.',
      schoolId: 'sch-2',
      schoolName: 'Government Model High School, Hanamkonda',
      district: 'Warangal Urban',
      mandal: 'Hanamkonda',
      title: 'District Kho-Kho Championship Winners',
      description: 'School Under-17 girls team clinched the Gold Trophy in the Inter-District School Games Federation sports tournament.',
      category: 'Sports Achievement',
      achievementDate: '2025-07-28',
      imageUrl: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?w=600&auto=format&fit=crop&q=80',
      documentName: 'SGF_Championship_Trophy_Cert.pdf',
      status: 'VERIFIED',
      bonusCreditsAwarded: 2,
      isFeatured: true,
      submittedAt: '2025-08-01T12:00:00.000Z',
      verifiedAt: '2025-08-05T16:00:00.000Z',
      verifiedBy: 'Dr. K. Srinivas Rao, DEO',
      officerFeedback: 'Well deserved sports achievement. Encouraging girls physical education.',
    },
    {
      id: 'ach-4',
      headmasterId: 'hm-2',
      headmasterName: 'Smt. P. Anitha, M.A., B.Ed.',
      schoolId: 'sch-2',
      schoolName: 'Government Model High School, Hanamkonda',
      district: 'Warangal Urban',
      mandal: 'Hanamkonda',
      title: 'Digital Smart Classroom & Computer Lab Modernization',
      description: 'Mobilized alumni and CSR support to furnish 4 digital classrooms with smart interactive panels and high-speed fiber internet.',
      category: 'School Development',
      achievementDate: '2025-06-12',
      imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&fit=crop&q=80',
      documentName: 'CSR_Completion_Handover_Report.pdf',
      status: 'VERIFIED',
      bonusCreditsAwarded: 3,
      isFeatured: true,
      submittedAt: '2025-06-15T15:00:00.000Z',
      verifiedAt: '2025-06-20T11:00:00.000Z',
      verifiedBy: 'Dr. K. Srinivas Rao, DEO',
      officerFeedback: 'Exemplary community mobilizing for school infrastructure.',
    },
    {
      id: 'ach-5',
      headmasterId: 'hm-1',
      headmasterName: 'M. Ramakrishna, M.Sc., B.Ed.',
      schoolId: 'sch-1',
      schoolName: 'Zilla Parishad High School, Kazipet',
      district: 'Warangal Urban',
      mandal: 'Kazipet',
      title: 'Eco-Club Green School Award & Herbal Botanical Garden',
      description: 'Created a student-maintained botanical garden with 150 medicinal plants and rain-water harvesting pits, recognized by Department of Forest and Environment.',
      category: 'Environmental Initiative',
      achievementDate: '2025-08-25',
      imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80',
      documentName: 'EcoClub_Recognition_Letter.pdf',
      status: 'PENDING_VERIFICATION',
      bonusCreditsAwarded: 0,
      isFeatured: false,
      submittedAt: '2025-08-27T10:30:00.000Z',
    },
    {
      id: 'ach-6',
      headmasterId: 'hm-5',
      headmasterName: 'Syed Abdul Rahim, M.Sc.',
      schoolId: 'sch-5',
      schoolName: 'Government Boys High School, Nampally',
      district: 'Hyderabad',
      mandal: 'Nampally',
      title: 'National Level Robotex Innovation Championship Finalist',
      description: 'Students represented Telangana state at the national robotics championship in New Delhi, developing a flood warning siren.',
      category: 'Science & Innovation',
      achievementDate: '2025-07-14',
      imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&auto=format&fit=crop&q=80',
      documentName: 'National_Robotex_Certificate.pdf',
      status: 'VERIFIED',
      bonusCreditsAwarded: 3,
      isFeatured: true,
      submittedAt: '2025-07-20T10:00:00.000Z',
      verifiedAt: '2025-07-26T14:00:00.000Z',
      verifiedBy: 'Dr. K. Srinivas Rao, DEO',
      officerFeedback: 'Incredible technical feat by government high school students. 3 points awarded.',
    },
    {
      id: 'ach-7',
      headmasterId: 'hm-3',
      headmasterName: 'V. Satyanarayana, M.Sc., M.Ed.',
      schoolId: 'sch-3',
      schoolName: 'Government High School, Karimnagar Main',
      district: 'Karimnagar',
      mandal: 'Karimnagar Urban',
      title: 'District Level Classical Dance & Folk Arts 1st Place',
      description: 'School cultural troupe bagged first prize in folk dance drama at the Yuva Utsav district youth festival.',
      category: 'Cultural Achievement',
      achievementDate: '2025-08-10',
      imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80',
      documentName: 'Yuva_Utsav_Dance_Prize.pdf',
      status: 'PENDING_VERIFICATION',
      bonusCreditsAwarded: 0,
      isFeatured: false,
      submittedAt: '2025-08-15T16:00:00.000Z',
    },
  ];

  const complaints: Complaint[] = [
    {
      id: 'cmp-1',
      complaintNumber: 'CMP-2025-0042',
      headmasterId: 'hm-1',
      headmasterName: 'M. Ramakrishna, M.Sc., B.Ed.',
      schoolId: 'sch-1',
      schoolName: 'Zilla Parishad High School, Kazipet',
      district: 'Warangal Urban',
      title: 'Sanction for Mathematics School Assistant Vacancy',
      category: 'Teacher/Staff Shortage',
      description: 'Our senior mathematics teacher was transferred in July. Currently 220 students in Class 9 and 10 are without a dedicated math teacher. Requesting immediate deputation or Vidya Volunteer assignment.',
      relatedPerformanceCategory: 'teacherMgmt',
      supportingDocName: 'Staff_Vacancy_Report_Kazipet.pdf',
      submissionDate: '2025-07-15T10:00:00.000Z',
      status: 'Resolved',
      officerResponse: 'Deputation order issued on 25-July for Vidya Volunteer Smt. K. Bhavani. Regular vacancy put up in general transfers.',
      responseDate: '2025-07-26T14:30:00.000Z',
      resolvedBy: 'Dr. K. Srinivas Rao, DEO',
    },
    {
      id: 'cmp-2',
      complaintNumber: 'CMP-2025-0089',
      headmasterId: 'hm-1',
      headmasterName: 'M. Ramakrishna, M.Sc., B.Ed.',
      schoolId: 'sch-1',
      schoolName: 'Zilla Parishad High School, Kazipet',
      district: 'Warangal Urban',
      title: 'Drainage Overflow & Water Logging in School Playground',
      category: 'Infrastructure Problem',
      description: 'Municipal drainage line bordering the east boundary wall overflowed due to heavy rains, causing stagnant water in the sports field and raising dengue risk.',
      relatedPerformanceCategory: 'infrastructure',
      supportingDocName: 'Drainage_Inspection_Photos.pdf',
      submissionDate: '2025-08-20T09:30:00.000Z',
      status: 'Under Review',
      officerResponse: 'Letter dispatched to Municipal Commissioner, Greater Warangal Corporation for urgent desilting and culvert clearance.',
      responseDate: '2025-08-24T11:00:00.000Z',
      resolvedBy: 'Dr. K. Srinivas Rao, DEO',
    },
    {
      id: 'cmp-3',
      complaintNumber: 'CMP-2025-0104',
      headmasterId: 'hm-2',
      headmasterName: 'Smt. P. Anitha, M.A., B.Ed.',
      schoolId: 'sch-2',
      schoolName: 'Government Model High School, Hanamkonda',
      district: 'Warangal Urban',
      title: 'Delay in Release of Composite School Grant (CSG) 2nd Tranche',
      category: 'Funding Issue',
      description: 'Composite School Grant second installment of Rs. 75,000 for laboratory chemicals and library books not credited to SMC account, hampering practical exams.',
      relatedPerformanceCategory: 'schoolMgmt',
      submissionDate: '2025-08-10T14:15:00.000Z',
      status: 'Under Review',
    },
  ];

  const scoreAppeals: ScoreAppeal[] = [
    {
      id: 'apl-1',
      appealNumber: 'APL-2025-0012',
      headmasterId: 'hm-1',
      headmasterName: 'M. Ramakrishna, M.Sc., B.Ed.',
      schoolId: 'sch-1',
      schoolName: 'Zilla Parishad High School, Kazipet',
      performanceRecordId: 'perf-hm-1-2',
      evaluationPeriod: 'Term 2 (2025-26)',
      affectedCategory: 'infrastructure',
      currentCategoryScore: 74,
      claimedCategoryScore: 82,
      reason: 'During Term 2 inspection, the newly installed solar power plant and clean RO water plant were not counted as commissioning certificate was under processing. Handover certificate is now attached.',
      evidenceName: 'RO_Plant_Commissioning_Certificate.pdf',
      status: 'APPROVED',
      submissionDate: '2025-07-02T11:30:00.000Z',
      reviewedBy: 'Dr. K. Srinivas Rao, DEO',
      reviewDate: '2025-07-08T15:00:00.000Z',
      reviewRemarks: 'Verified RO plant inspection report from Assistant Executive Engineer, Panchayati Raj. Score adjusted from 74 to 80.',
      adjustedCategoryScore: 80,
    },
    {
      id: 'apl-2',
      appealNumber: 'APL-2025-0018',
      headmasterId: 'hm-2',
      headmasterName: 'Smt. P. Anitha, M.A., B.Ed.',
      schoolId: 'sch-2',
      schoolName: 'Government Model High School, Hanamkonda',
      performanceRecordId: 'perf-hm-2-3',
      evaluationPeriod: 'Term 3 (2025-26)',
      affectedCategory: 'teacherMgmt',
      currentCategoryScore: 92,
      claimedCategoryScore: 96,
      reason: 'Biometric attendance sync failure in first week of August showed 3 teachers as unauthorized absence, but manual muster roll counter-signed by Mandal Educational Officer (MEO) proves 100% attendance.',
      evidenceName: 'MEO_Attested_Muster_Roll.pdf',
      status: 'UNDER_REVIEW',
      submissionDate: '2025-08-28T09:45:00.000Z',
    },
  ];

  const notifications: AppNotification[] = [
    {
      id: 'notif-1',
      userId: 'user-hm-1',
      title: 'Bonus Credits Approved (+3 Points)',
      message: 'Your achievement "State Science Fair 1st Prize" was verified and 3 bonus credits were added to your Final Score.',
      type: 'BONUS_AWARDED',
      relatedId: 'ach-1',
      isRead: false,
      createdAt: '2025-08-22T14:30:00.000Z',
    },
    {
      id: 'notif-2',
      userId: 'user-hm-1',
      title: 'District Rank Improvement!',
      message: 'Congratulations! Your school has moved up to District Rank #2 in Warangal Urban.',
      type: 'RANK_CHANGE',
      relatedId: 'perf-hm-1-3',
      isRead: false,
      createdAt: '2025-08-23T10:00:00.000Z',
    },
    {
      id: 'notif-3',
      userId: 'user-hm-1',
      title: 'Complaint Resolved',
      message: 'Complaint CMP-2025-0042 regarding Mathematics teacher vacancy has been resolved with Vidya Volunteer deputation.',
      type: 'COMPLAINT_RESPONSE',
      relatedId: 'cmp-1',
      isRead: true,
      createdAt: '2025-07-26T14:30:00.000Z',
    },
    {
      id: 'notif-4',
      userId: 'user-hm-2',
      title: 'Achievement Verified (+2 Points)',
      message: 'Your sports achievement "District Kho-Kho Championship Winners" was verified by the District Educational Officer.',
      type: 'ACHIEVEMENT_VERIFIED',
      relatedId: 'ach-3',
      isRead: true,
      createdAt: '2025-08-05T16:00:00.000Z',
    },
    {
      id: 'notif-5',
      userId: 'user-eo-1',
      title: 'New Achievement Submitted',
      message: 'Headmaster M. Ramakrishna submitted "Eco-Club Green School Award" for verification.',
      type: 'SCORE_UPDATE',
      relatedId: 'ach-5',
      isRead: false,
      createdAt: '2025-08-27T10:30:00.000Z',
    },
  ];

  const activityPosts: ActivityPost[] = [
    {
      id: 'act-1',
      headmasterId: 'hm-1',
      headmasterName: 'M. Ramakrishna, M.Sc., B.Ed.',
      schoolId: 'sch-1',
      schoolName: 'Zilla Parishad High School, Kazipet',
      district: 'Warangal Urban',
      mandal: 'Kazipet',
      title: 'Annual Science Exhibition & Robotics Model Showcase',
      description: 'Over 180 students from Grades 6-10 presented working models on renewable solar energy, drip irrigation automation, and sensor-based smart street lighting. Heartfelt gratitude to science faculty and SMC members for mentoring the young minds!',
      category: 'Science & Innovation',
      activityDate: '2025-08-24',
      media: [
        {
          id: 'med-1-1',
          activityPostId: 'act-1',
          mediaUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
          mediaType: 'IMAGE',
          caption: 'Students demonstrating solar powered drip irrigation prototype',
          createdAt: '2025-08-24T10:30:00.000Z',
        },
        {
          id: 'med-1-2',
          activityPostId: 'act-1',
          mediaUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80',
          mediaType: 'IMAGE',
          caption: 'Chemistry lab demonstrations by high school students',
          createdAt: '2025-08-24T11:00:00.000Z',
        },
      ],
      likesCount: 14,
      likedBy: ['user-hm-2', 'user-hm-3'],
      createdAt: '2025-08-24T14:15:00.000Z',
      updatedAt: '2025-08-24T14:15:00.000Z',
    },
    {
      id: 'act-2',
      headmasterId: 'hm-2',
      headmasterName: 'Smt. P. Anitha, M.A., B.Ed.',
      schoolId: 'sch-2',
      schoolName: 'Government Model High School, Hanamkonda',
      district: 'Warangal Urban',
      mandal: 'Hanamkonda',
      title: 'Bathukamma & Telangana Cultural Heritage Celebrations',
      description: 'Grand festive celebrations with our girl students and teachers creating artistic floral stacks (Bathukamma). The event featured traditional folk songs, cultural storytelling on Telangana history, and prize distribution for best floral arrangements.',
      category: 'Cultural Activity',
      activityDate: '2025-08-18',
      media: [
        {
          id: 'med-2-1',
          activityPostId: 'act-2',
          mediaUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
          mediaType: 'IMAGE',
          caption: 'Cultural dance performances by junior school students',
          createdAt: '2025-08-18T09:30:00.000Z',
        },
        {
          id: 'med-2-2',
          activityPostId: 'act-2',
          mediaUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
          mediaType: 'IMAGE',
          caption: 'Annual school gathering and festive celebrations',
          createdAt: '2025-08-18T10:00:00.000Z',
        },
      ],
      likesCount: 22,
      likedBy: ['user-hm-1', 'user-eo-1'],
      createdAt: '2025-08-18T13:40:00.000Z',
      updatedAt: '2025-08-18T13:40:00.000Z',
    },
    {
      id: 'act-3',
      headmasterId: 'hm-1',
      headmasterName: 'M. Ramakrishna, M.Sc., B.Ed.',
      schoolId: 'sch-1',
      schoolName: 'Zilla Parishad High School, Kazipet',
      district: 'Warangal Urban',
      mandal: 'Kazipet',
      title: 'District Inter-School Volleyball Final Match Highlights',
      description: 'Our boys team secured the Runners-Up trophy in the Warangal District Inter-School Tournament against 24 competing high schools. Special applause to physical education teacher Sri N. Raju for tireless early morning coaching.',
      category: 'Sports',
      activityDate: '2025-08-12',
      media: [
        {
          id: 'med-3-1',
          activityPostId: 'act-3',
          mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          mediaType: 'VIDEO',
          caption: 'Match-winning rally and trophy celebration video',
          createdAt: '2025-08-12T16:20:00.000Z',
        },
        {
          id: 'med-3-2',
          activityPostId: 'act-3',
          mediaUrl: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=1200&q=80',
          mediaType: 'IMAGE',
          caption: 'Volleyball team lineup before the district championship final',
          createdAt: '2025-08-12T16:25:00.000Z',
        },
      ],
      likesCount: 19,
      likedBy: ['user-hm-2'],
      createdAt: '2025-08-12T18:00:00.000Z',
      updatedAt: '2025-08-12T18:00:00.000Z',
    },
    {
      id: 'act-4',
      headmasterId: 'hm-3',
      headmasterName: 'V. Satyanarayana, M.Sc., M.Ed.',
      schoolId: 'sch-3',
      schoolName: 'Government High School, Karimnagar Main',
      district: 'Karimnagar',
      mandal: 'Karimnagar',
      title: 'Haritha Haram: 150 Native Fruit & Shade Trees Planted',
      description: 'Eco-club students along with local municipal ward councilors led a massive greening campaign across the school playground and perimeter walls. Each class has adopted 10 saplings for year-round nurturing.',
      category: 'Environmental Activity',
      activityDate: '2025-08-04',
      media: [
        {
          id: 'med-4-1',
          activityPostId: 'act-4',
          mediaUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
          mediaType: 'IMAGE',
          caption: 'Eco-club members planting saplings on school grounds',
          createdAt: '2025-08-04T09:10:00.000Z',
        },
      ],
      likesCount: 11,
      likedBy: ['user-hm-1'],
      createdAt: '2025-08-04T11:30:00.000Z',
      updatedAt: '2025-08-04T11:30:00.000Z',
    },
  ];

  const rawStudents = [
    {
      id: 'stu-101',
      studentName: 'K. Sai Teja',
      rollNumber: '253601001',
      schoolId: 'sch-1',
      schoolName: 'Zilla Parishad High School, Kazipet',
      district: 'Warangal Urban',
      mandal: 'Kazipet',
      class: 'Class 10',
      section: 'A',
      academicYear: '2025-26',
      gender: 'Male' as const,
      marks: { telugu: 92, hindi: 84, english: 88, mathematics: 96, science: 94, socialStudies: 91 },
    },
    {
      id: 'stu-102',
      studentName: 'G. Sneha',
      rollNumber: '253601002',
      schoolId: 'sch-1',
      schoolName: 'Zilla Parishad High School, Kazipet',
      district: 'Warangal Urban',
      mandal: 'Kazipet',
      class: 'Class 10',
      section: 'A',
      academicYear: '2025-26',
      gender: 'Female' as const,
      marks: { telugu: 88, hindi: 85, english: 90, mathematics: 94, science: 89, socialStudies: 93 },
    },
    {
      id: 'stu-103',
      studentName: 'B. Rahul',
      rollNumber: '253601003',
      schoolId: 'sch-1',
      schoolName: 'Zilla Parishad High School, Kazipet',
      district: 'Warangal Urban',
      mandal: 'Kazipet',
      class: 'Class 10',
      section: 'A',
      academicYear: '2025-26',
      gender: 'Male' as const,
      marks: { telugu: 74, hindi: 68, english: 72, mathematics: 85, science: 78, socialStudies: 80 },
    },
    {
      id: 'stu-104',
      studentName: 'P. Divya',
      rollNumber: '253601004',
      schoolId: 'sch-1',
      schoolName: 'Zilla Parishad High School, Kazipet',
      district: 'Warangal Urban',
      mandal: 'Kazipet',
      class: 'Class 10',
      section: 'B',
      academicYear: '2025-26',
      gender: 'Female' as const,
      marks: { telugu: 85, hindi: 79, english: 82, mathematics: 88, science: 86, socialStudies: 84 },
    },
    {
      id: 'stu-105',
      studentName: 'M. Akhil',
      rollNumber: '253601005',
      schoolId: 'sch-1',
      schoolName: 'Zilla Parishad High School, Kazipet',
      district: 'Warangal Urban',
      mandal: 'Kazipet',
      class: 'Class 10',
      section: 'B',
      academicYear: '2025-26',
      gender: 'Male' as const,
      marks: { telugu: 62, hindi: 58, english: 64, mathematics: 70, science: 65, socialStudies: 68 },
    },
    {
      id: 'stu-106',
      studentName: 'T. Sravanthi',
      rollNumber: '253601006',
      schoolId: 'sch-1',
      schoolName: 'Zilla Parishad High School, Kazipet',
      district: 'Warangal Urban',
      mandal: 'Kazipet',
      class: 'Class 10',
      section: 'A',
      academicYear: '2025-26',
      gender: 'Female' as const,
      marks: { telugu: 95, hindi: 91, english: 94, mathematics: 98, science: 97, socialStudies: 96 },
    },
    {
      id: 'stu-107',
      studentName: 'D. Ajay Kumar',
      rollNumber: '253601007',
      schoolId: 'sch-1',
      schoolName: 'Zilla Parishad High School, Kazipet',
      district: 'Warangal Urban',
      mandal: 'Kazipet',
      class: 'Class 10',
      section: 'B',
      academicYear: '2025-26',
      gender: 'Male' as const,
      marks: { telugu: 45, hindi: 42, english: 48, mathematics: 52, science: 49, socialStudies: 50 },
    },
    {
      id: 'stu-108',
      studentName: 'V. Keerthana',
      rollNumber: '253601008',
      schoolId: 'sch-1',
      schoolName: 'Zilla Parishad High School, Kazipet',
      district: 'Warangal Urban',
      mandal: 'Kazipet',
      class: 'Class 10',
      section: 'A',
      academicYear: '2025-26',
      gender: 'Female' as const,
      marks: { telugu: 78, hindi: 82, english: 80, mathematics: 84, science: 83, socialStudies: 81 },
    },
    // School 2: Govt Model High School, Hanamkonda
    {
      id: 'stu-201',
      studentName: 'N. Tarun',
      rollNumber: '253602001',
      schoolId: 'sch-2',
      schoolName: 'Govt Model High School, Hanamkonda',
      district: 'Warangal Urban',
      mandal: 'Hanamkonda',
      class: 'Class 10',
      section: 'A',
      academicYear: '2025-26',
      gender: 'Male' as const,
      marks: { telugu: 90, hindi: 86, english: 88, mathematics: 92, science: 91, socialStudies: 89 },
    },
    {
      id: 'stu-202',
      studentName: 'R. Bhavani',
      rollNumber: '253602002',
      schoolId: 'sch-2',
      schoolName: 'Govt Model High School, Hanamkonda',
      district: 'Warangal Urban',
      mandal: 'Hanamkonda',
      class: 'Class 10',
      section: 'A',
      academicYear: '2025-26',
      gender: 'Female' as const,
      marks: { telugu: 94, hindi: 90, english: 92, mathematics: 96, science: 95, socialStudies: 93 },
    },
    // School 3: Govt High School, Karimnagar Main
    {
      id: 'stu-301',
      studentName: 'E. Harish',
      rollNumber: '253801001',
      schoolId: 'sch-3',
      schoolName: 'Government High School, Karimnagar Main',
      district: 'Karimnagar',
      mandal: 'Karimnagar',
      class: 'Class 10',
      section: 'A',
      academicYear: '2025-26',
      gender: 'Male' as const,
      marks: { telugu: 82, hindi: 78, english: 85, mathematics: 88, science: 84, socialStudies: 83 },
    },
  ];

  const students: StudentRecord[] = rawStudents.map((s) => {
    const stats = computeStudentStats(s.marks);
    return {
      ...s,
      ...stats,
      createdAt: '2025-07-15T09:00:00.000Z',
      updatedAt: '2025-07-15T09:00:00.000Z',
    };
  });

  return {
    users,
    schools,
    headmasters,
    performanceRecords,
    achievements,
    complaints,
    scoreAppeals,
    notifications,
    activityPosts,
    students,
  };
}
