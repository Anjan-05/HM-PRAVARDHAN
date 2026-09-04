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
  ActivityPost,
  StudentRecord,
  StudentPerformanceSummary,
} from './types.ts';

const BASE = '/api';

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    let errorMsg = 'An error occurred';
    try {
      const data = await res.json();
      errorMsg = data.error || errorMsg;
    } catch {
      errorMsg = res.statusText || errorMsg;
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

// Auth
export const api = {
  getDemoUsers: () => fetchApi<User[]>('/auth/demo-users'),
  login: (email: string, password?: string, role?: string) =>
    fetchApi<{ success: boolean; user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    }),

  // Schools
  getSchools: (params?: { district?: string; mandal?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.district) q.append('district', params.district);
    if (params?.mandal) q.append('mandal', params.mandal);
    if (params?.search) q.append('search', params.search);
    return fetchApi<School[]>(`/schools?${q.toString()}`);
  },
  getSchoolById: (id: string) => fetchApi<School>(`/schools/${id}`),
  createSchool: (data: Omit<School, 'id'>) =>
    fetchApi<School>('/schools', { method: 'POST', body: JSON.stringify(data) }),
  updateSchool: (id: string, data: Partial<School>) =>
    fetchApi<School>(`/schools/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSchool: (id: string) =>
    fetchApi<{ success: boolean }>(`/schools/${id}`, { method: 'DELETE' }),

  // Headmasters
  getHeadmasters: () => fetchApi<Headmaster[]>('/headmasters'),
  getHeadmasterById: (id: string) => fetchApi<Headmaster>(`/headmasters/${id}`),
  createHeadmaster: (data: Omit<Headmaster, 'id'>) =>
    fetchApi<Headmaster>('/headmasters', { method: 'POST', body: JSON.stringify(data) }),
  updateHeadmaster: (id: string, data: Partial<Headmaster>) =>
    fetchApi<Headmaster>(`/headmasters/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Performance & Rankings
  getPerformance: (params?: { headmasterId?: string; period?: string }) => {
    const q = new URLSearchParams();
    if (params?.headmasterId) q.append('headmasterId', params.headmasterId);
    if (params?.period) q.append('period', params.period);
    return fetchApi<PerformanceRecord[]>(`/performance?${q.toString()}`);
  },
  getLatestPerformance: (headmasterId: string) =>
    fetchApi<PerformanceRecord>(`/performance/${headmasterId}/latest`),
  savePerformance: (data: any) =>
    fetchApi<PerformanceRecord>('/performance', { method: 'POST', body: JSON.stringify(data) }),
  getRankings: (params?: { district?: string; mandal?: string; search?: string; period?: string }) => {
    const q = new URLSearchParams();
    if (params?.district) q.append('district', params.district);
    if (params?.mandal) q.append('mandal', params.mandal);
    if (params?.search) q.append('search', params.search);
    if (params?.period) q.append('period', params.period);
    return fetchApi<PerformanceRecord[]>(`/rankings?${q.toString()}`);
  },
  recalculateRankings: (period?: string) =>
    fetchApi<{ success: boolean; count: number }>('/rankings/recalculate', {
      method: 'POST',
      body: JSON.stringify({ period }),
    }),

  // Achievements
  getAchievements: (params?: { headmasterId?: string; status?: string; featuredOnly?: boolean }) => {
    const q = new URLSearchParams();
    if (params?.headmasterId) q.append('headmasterId', params.headmasterId);
    if (params?.status) q.append('status', params.status);
    if (params?.featuredOnly) q.append('featuredOnly', 'true');
    return fetchApi<Achievement[]>(`/achievements?${q.toString()}`);
  },
  createAchievement: (data: any) =>
    fetchApi<Achievement>('/achievements', { method: 'POST', body: JSON.stringify(data) }),
  verifyAchievement: (id: string, data: any) =>
    fetchApi<Achievement>(`/achievements/${id}/verify`, { method: 'PUT', body: JSON.stringify(data) }),

  // HM Activity Feed Posts
  getActivityPosts: (params?: { headmasterId?: string; category?: string; search?: string; mandal?: string; district?: string }) => {
    const q = new URLSearchParams();
    if (params?.headmasterId) q.append('headmasterId', params.headmasterId);
    if (params?.category) q.append('category', params.category);
    if (params?.search) q.append('search', params.search);
    if (params?.mandal) q.append('mandal', params.mandal);
    if (params?.district) q.append('district', params.district);
    return fetchApi<ActivityPost[]>(`/activities?${q.toString()}`);
  },
  getActivityPostById: (id: string) => fetchApi<ActivityPost>(`/activities/${id}`),
  createActivityPost: (data: any) =>
    fetchApi<ActivityPost>('/activities', { method: 'POST', body: JSON.stringify(data) }),
  updateActivityPost: (id: string, data: { requestingHmId: string; title?: string; description?: string; category?: string; activityDate?: string; media?: any[] }) =>
    fetchApi<ActivityPost>(`/activities/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteActivityPost: (id: string, requestingHmId: string) =>
    fetchApi<{ success: boolean }>(`/activities/${id}?requestingHmId=${encodeURIComponent(requestingHmId)}`, {
      method: 'DELETE',
    }),
  toggleLikeActivityPost: (id: string, userId: string) =>
    fetchApi<ActivityPost>(`/activities/${id}/like`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),

  // Complaints
  getComplaints: (headmasterId?: string) => {
    const q = headmasterId ? `?headmasterId=${encodeURIComponent(headmasterId)}` : '';
    return fetchApi<Complaint[]>(`/complaints${q}`);
  },
  createComplaint: (data: any) =>
    fetchApi<Complaint>('/complaints', { method: 'POST', body: JSON.stringify(data) }),
  respondComplaint: (id: string, data: any) =>
    fetchApi<Complaint>(`/complaints/${id}/respond`, { method: 'PUT', body: JSON.stringify(data) }),

  // Score Appeals
  getAppeals: (headmasterId?: string) => {
    const q = headmasterId ? `?headmasterId=${encodeURIComponent(headmasterId)}` : '';
    return fetchApi<ScoreAppeal[]>(`/appeals${q}`);
  },
  createAppeal: (data: any) =>
    fetchApi<ScoreAppeal>('/appeals', { method: 'POST', body: JSON.stringify(data) }),
  reviewAppeal: (id: string, data: any) =>
    fetchApi<ScoreAppeal>(`/appeals/${id}/review`, { method: 'PUT', body: JSON.stringify(data) }),

  // Student Performance (Class 10 focus)
  getStudents: (params?: { schoolId?: string; mandal?: string; district?: string; class?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.schoolId) q.append('schoolId', params.schoolId);
    if (params?.mandal) q.append('mandal', params.mandal);
    if (params?.district) q.append('district', params.district);
    if (params?.class) q.append('class', params.class);
    if (params?.search) q.append('search', params.search);
    return fetchApi<StudentRecord[]>(`/students?${q.toString()}`);
  },
  getStudentById: (id: string) => fetchApi<StudentRecord>(`/students/${id}`),
  getStudentSummary: (params?: { schoolId?: string; mandal?: string; district?: string }) => {
    const q = new URLSearchParams();
    if (params?.schoolId) q.append('schoolId', params.schoolId);
    if (params?.mandal) q.append('mandal', params.mandal);
    if (params?.district) q.append('district', params.district);
    return fetchApi<StudentPerformanceSummary>(`/students/summary?${q.toString()}`);
  },
  createStudent: (data: any) =>
    fetchApi<StudentRecord>('/students', { method: 'POST', body: JSON.stringify(data) }),
  updateStudent: (id: string, data: any) =>
    fetchApi<StudentRecord>(`/students/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteStudent: (id: string) =>
    fetchApi<{ success: boolean }>(`/students/${id}`, { method: 'DELETE' }),

  // Notifications
  getNotifications: (userId: string) => fetchApi<AppNotification[]>(`/notifications/${userId}`),
  markNotificationRead: (id: string) =>
    fetchApi<{ success: boolean }>(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: (userId: string) =>
    fetchApi<{ success: boolean }>(`/notifications/read-all/${userId}`, { method: 'PUT' }),

  // Analytics
  getAnalytics: () => fetchApi<AnalyticsSummary>('/analytics'),

  // Reset Demo
  resetDemo: () => fetchApi<{ success: boolean; message: string }>('/reset-demo', { method: 'POST' }),
};
