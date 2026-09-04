import React, { useState, useEffect } from 'react';
import { api } from '../../api.ts';
import { StudentRecord, SubjectMarks, StudentPerformanceSummary } from '../../types.ts';
import {
  GraduationCap,
  Users,
  Award,
  TrendingUp,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  Filter,
  BarChart3,
  FileSpreadsheet,
} from 'lucide-react';

interface StudentPerformanceManagerProps {
  role: 'HEADMASTER' | 'MEO' | 'DEO' | 'VISITOR' | 'PUBLIC';
  schoolId?: string;
  schoolName?: string;
  mandal?: string;
  district?: string;
  schoolsList?: { id: string; name: string; mandal?: string }[];
}

export const StudentPerformanceManager: React.FC<StudentPerformanceManagerProps> = ({
  role,
  schoolId,
  schoolName,
  mandal,
  district,
  schoolsList = [],
}) => {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [summary, setSummary] = useState<StudentPerformanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchoolFilter, setSelectedSchoolFilter] = useState<string>(schoolId || '');
  const [selectedMandalFilter, setSelectedMandalFilter] = useState<string>(mandal || '');

  // Form states for Add / Edit
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [studentName, setStudentName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [section, setSection] = useState('A');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [targetSchoolId, setTargetSchoolId] = useState(schoolId || '');
  const [marks, setMarks] = useState<SubjectMarks>({
    telugu: 75,
    hindi: 70,
    english: 72,
    mathematics: 68,
    science: 74,
    socialStudies: 78,
  });

  const isEditable = role === 'HEADMASTER';

  const loadData = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (role === 'HEADMASTER') {
        filters.schoolId = schoolId;
      } else if (role === 'MEO') {
        filters.mandal = mandal;
        if (selectedSchoolFilter) filters.schoolId = selectedSchoolFilter;
      } else if (role === 'DEO') {
        filters.district = district;
        if (selectedMandalFilter) filters.mandal = selectedMandalFilter;
        if (selectedSchoolFilter) filters.schoolId = selectedSchoolFilter;
      } else {
        if (schoolId) filters.schoolId = schoolId;
      }

      const [studentList, summaryData] = await Promise.all([
        api.getStudents(filters),
        api.getStudentSummary(filters),
      ]);

      setStudents(studentList);
      setSummary(summaryData);
    } catch (e) {
      console.error('Failed to load students data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [schoolId, mandal, district, selectedSchoolFilter, selectedMandalFilter]);

  // Handle Mark Change in Form
  const handleMarkChange = (subject: keyof SubjectMarks, value: string) => {
    const num = Math.min(100, Math.max(0, parseInt(value) || 0));
    setMarks((prev) => ({
      ...prev,
      [subject]: num,
    }));
  };

  // Preview computations
  const previewTotal = (Object.values(marks) as number[]).reduce((acc: number, m: number) => acc + (Number(m) || 0), 0);
  const previewPercentage = Math.round((previewTotal / 600) * 1000) / 10;
  const previewPassed = (Object.values(marks) as number[]).every((m: number) => Number(m) >= 35);
  let previewGrade = 'Fail';
  if (previewPassed) {
    if (previewPercentage >= 90) previewGrade = 'A+';
    else if (previewPercentage >= 80) previewGrade = 'A';
    else if (previewPercentage >= 70) previewGrade = 'B+';
    else if (previewPercentage >= 60) previewGrade = 'B';
    else if (previewPercentage >= 50) previewGrade = 'C';
    else previewGrade = 'D';
  }

  const openAddModal = () => {
    setEditingStudent(null);
    setStudentName('');
    setRollNumber(`26-${Math.floor(1000 + Math.random() * 9000)}`);
    setSection('A');
    setGender('Male');
    setTargetSchoolId(schoolId || '');
    setMarks({
      telugu: 75,
      hindi: 70,
      english: 72,
      mathematics: 68,
      science: 74,
      socialStudies: 78,
    });
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (stu: StudentRecord) => {
    setEditingStudent(stu);
    setStudentName(stu.studentName);
    setRollNumber(stu.rollNumber);
    setSection(stu.section);
    setGender(stu.gender);
    setTargetSchoolId(stu.schoolId);
    setMarks({ ...stu.marks });
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !rollNumber.trim()) {
      setFormError('Student Name and Roll Number are required.');
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      if (editingStudent) {
        await api.updateStudent(editingStudent.id, {
          studentName: studentName.trim(),
          rollNumber: rollNumber.trim(),
          section,
          gender,
          marks,
        });
        setFormSuccess('Student record updated successfully!');
      } else {
        const sch = schoolsList.find((s) => s.id === (targetSchoolId || schoolId));
        await api.createStudent({
          studentName: studentName.trim(),
          rollNumber: rollNumber.trim(),
          schoolId: targetSchoolId || schoolId,
          schoolName: sch?.name || schoolName || 'Government High School',
          mandal: sch?.mandal || mandal || 'Kazipet',
          district: district || 'Warangal Urban',
          class: 'Class 10',
          section,
          gender,
          marks,
        });
        setFormSuccess('New student record added successfully!');
      }

      setIsAddModalOpen(false);
      setTimeout(() => setFormSuccess(null), 3500);
      loadData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save student record.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    try {
      await api.deleteStudent(id);
      setDeleteConfirmId(null);
      setFormSuccess('Student record removed.');
      setTimeout(() => setFormSuccess(null), 3500);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete student');
    }
  };

  // Filtered student list by search
  const filteredStudents = students.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.studentName.toLowerCase().includes(q) ||
      s.rollNumber.toLowerCase().includes(q) ||
      s.schoolName.toLowerCase().includes(q) ||
      s.grade.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Toast */}
      {formSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{formSuccess}</span>
          </div>
          <button onClick={() => setFormSuccess(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header & Quick Action */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-blue-100 text-[#1E3A8A] text-[10px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wider">
              Class 10 Board Analytics
            </span>
            <span className="text-xs text-gray-500 font-medium">Academic Year 2025-26</span>
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 mt-1">
            Student Performance Management
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {role === 'HEADMASTER'
              ? `Official record of SSC Class 10 candidates for ${schoolName || 'your school'}`
              : role === 'MEO'
              ? `Mandal-wide Class 10 academic oversight for ${mandal || 'Kazipet'} Mandal`
              : `District-wide Class 10 governance across ${district || 'Warangal Urban'}`}
          </p>
        </div>

        {isEditable && (
          <button
            onClick={openAddModal}
            className="bg-[#1E3A8A] hover:bg-blue-900 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center space-x-2 cursor-pointer shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Class 10 Student</span>
          </button>
        )}
      </div>

      {/* Summary KPI Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
            <div className="flex justify-between items-center text-gray-500 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Total Enrolled</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-gray-900">{summary.totalStudents}</div>
            <div className="text-[11px] text-gray-500 mt-1">Class 10 registered candidates</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
            <div className="flex justify-between items-center text-gray-500 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Pass Percentage</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-600">{summary.passPercentage}%</div>
            <div className="text-[11px] text-gray-500 mt-1">Min 35 in all 6 subjects</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
            <div className="flex justify-between items-center text-gray-500 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Average Marks</span>
              <TrendingUp className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-gray-900">
              {summary.averageMarks} <span className="text-sm font-normal text-gray-400">/ 600</span>
            </div>
            <div className="text-[11px] text-gray-500 mt-1">
              Avg {((summary.averageMarks / 600) * 100).toFixed(1)}% overall
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
            <div className="flex justify-between items-center text-gray-500 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Highest Marks</span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-700">
              {summary.highestMarks} <span className="text-sm font-normal text-gray-400">/ 600</span>
            </div>
            <div className="text-[11px] text-gray-500 mt-1">
              Top Scorer {((summary.highestMarks / 600) * 100).toFixed(1)}% (Grade A+)
            </div>
          </div>
        </div>
      )}

      {/* Subject Wise Performance Averages */}
      {summary && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-blue-700" />
              <h3 className="font-bold text-sm text-gray-900">Subject-wise Average Marks</h3>
            </div>
            <span className="text-xs text-gray-400">Passing criteria: ≥ 35/100</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Telugu', key: 'telugu' as const, color: 'text-blue-700', bg: 'bg-blue-50' },
              { label: 'Hindi', key: 'hindi' as const, color: 'text-indigo-700', bg: 'bg-indigo-50' },
              { label: 'English', key: 'english' as const, color: 'text-teal-700', bg: 'bg-teal-50' },
              { label: 'Mathematics', key: 'mathematics' as const, color: 'text-purple-700', bg: 'bg-purple-50' },
              { label: 'Science', key: 'science' as const, color: 'text-emerald-700', bg: 'bg-emerald-50' },
              { label: 'Social Studies', key: 'socialStudies' as const, color: 'text-amber-800', bg: 'bg-amber-50' },
            ].map((s) => {
              const avg = summary.subjectAverages[s.key];
              return (
                <div key={s.key} className={`${s.bg} p-3 rounded-lg border border-gray-200/80 text-center`}>
                  <div className="text-[11px] font-bold text-gray-600 truncate">{s.label}</div>
                  <div className={`text-lg font-black mt-1 ${s.color}`}>
                    {avg} <span className="text-[10px] text-gray-500 font-normal">/ 100</span>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full ${avg >= 70 ? 'bg-emerald-500' : avg >= 50 ? 'bg-blue-500' : 'bg-amber-500'}`}
                      style={{ width: `${Math.min(100, avg)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by student name, roll number, or grade..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-1.5 pl-9 pr-3 text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* MEO or DEO School selector */}
          {(role === 'MEO' || role === 'DEO') && schoolsList.length > 0 && (
            <div className="flex items-center space-x-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-gray-500" />
              <select
                value={selectedSchoolFilter}
                onChange={(e) => setSelectedSchoolFilter(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-800 font-medium focus:bg-white"
              >
                <option value="">All Mandal Schools</option>
                {schoolsList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="text-xs text-gray-500 font-semibold">
            Showing <span className="text-gray-900 font-bold">{filteredStudents.length}</span> students
          </div>
        </div>
      </div>

      {/* Student Records Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-gray-500">Loading student records...</div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500 space-y-2">
            <GraduationCap className="w-8 h-8 text-gray-300 mx-auto" />
            <div className="font-bold text-gray-700">No student records found</div>
            <p className="text-gray-400">
              {isEditable
                ? 'Click "Add Class 10 Student" above to enter candidate board marks.'
                : 'No student performance entries recorded yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-bold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Roll No.</th>
                  <th className="py-3 px-4">Student Name</th>
                  {role !== 'HEADMASTER' && <th className="py-3 px-4">School</th>}
                  <th className="py-3 px-2 text-center">TEL</th>
                  <th className="py-3 px-2 text-center">HIN</th>
                  <th className="py-3 px-2 text-center">ENG</th>
                  <th className="py-3 px-2 text-center">MAT</th>
                  <th className="py-3 px-2 text-center">SCI</th>
                  <th className="py-3 px-2 text-center">SOC</th>
                  <th className="py-3 px-3 text-center">Total (600)</th>
                  <th className="py-3 px-3 text-center">%</th>
                  <th className="py-3 px-3 text-center">Grade</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  {isEditable && <th className="py-3 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-gray-900">{s.rollNumber}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">{s.studentName}</div>
                      <div className="text-[10px] text-gray-500">
                        Sec {s.section} &bull; {s.gender}
                      </div>
                    </td>
                    {role !== 'HEADMASTER' && (
                      <td className="py-3 px-4 text-gray-600 text-[11px] max-w-[160px] truncate">
                        {s.schoolName}
                      </td>
                    )}
                    <td className={`py-3 px-2 text-center font-semibold ${s.marks.telugu < 35 ? 'text-red-600 font-bold' : 'text-gray-800'}`}>
                      {s.marks.telugu}
                    </td>
                    <td className={`py-3 px-2 text-center font-semibold ${s.marks.hindi < 35 ? 'text-red-600 font-bold' : 'text-gray-800'}`}>
                      {s.marks.hindi}
                    </td>
                    <td className={`py-3 px-2 text-center font-semibold ${s.marks.english < 35 ? 'text-red-600 font-bold' : 'text-gray-800'}`}>
                      {s.marks.english}
                    </td>
                    <td className={`py-3 px-2 text-center font-semibold ${s.marks.mathematics < 35 ? 'text-red-600 font-bold' : 'text-gray-800'}`}>
                      {s.marks.mathematics}
                    </td>
                    <td className={`py-3 px-2 text-center font-semibold ${s.marks.science < 35 ? 'text-red-600 font-bold' : 'text-gray-800'}`}>
                      {s.marks.science}
                    </td>
                    <td className={`py-3 px-2 text-center font-semibold ${s.marks.socialStudies < 35 ? 'text-red-600 font-bold' : 'text-gray-800'}`}>
                      {s.marks.socialStudies}
                    </td>
                    <td className="py-3 px-3 text-center font-black text-gray-900">
                      {s.totalMarks}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-gray-700">
                      {s.percentage}%
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                          s.grade === 'A+'
                            ? 'bg-purple-100 text-purple-800'
                            : s.grade === 'A'
                            ? 'bg-blue-100 text-blue-800'
                            : s.grade === 'B+' || s.grade === 'B'
                            ? 'bg-emerald-100 text-emerald-800'
                            : s.grade === 'C' || s.grade === 'D'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {s.grade}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          s.passed
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {s.passed ? 'PASS' : 'FAIL'}
                      </span>
                    </td>
                    {isEditable && (
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => openEditModal(s)}
                            className="p-1 text-gray-500 hover:text-blue-700 rounded hover:bg-gray-100 cursor-pointer"
                            title="Edit marks"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(s.id)}
                            className="p-1 text-gray-500 hover:text-red-700 rounded hover:bg-red-50 cursor-pointer"
                            title="Delete student"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 text-gray-800 space-y-4">
            <div className="flex items-center space-x-2 text-red-600 font-bold">
              <AlertCircle className="w-5 h-5" />
              <span>Confirm Student Deletion</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Are you sure you want to delete this student record? All subject marks and calculations will be permanently removed.
            </p>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteStudent(deleteConfirmId)}
                className="px-3 py-1.5 text-xs bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg cursor-pointer"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full overflow-hidden text-gray-800 max-h-[94vh] flex flex-col">
            <div className="bg-[#1E3A8A] px-6 py-4 flex justify-between items-center text-white shrink-0">
              <div className="flex items-center space-x-2">
                <GraduationCap className="w-5 h-5 text-blue-200" />
                <h3 className="font-bold text-base">
                  {editingStudent ? 'Edit Student Board Marks' : 'Add Class 10 Student Record'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-blue-200 hover:text-white p-1 rounded hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="p-6 overflow-y-auto space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., K. Sai Kumar"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Hall Ticket / Roll Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., 26-0419"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 text-xs font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Section</label>
                  <select
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* 6 Subject Marks Input */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Subject Marks (Max 100 per subject)
                  </span>
                  <span className="text-[11px] text-gray-400">Passing score: 35</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: 'Telugu', key: 'telugu' as const },
                    { label: 'Hindi', key: 'hindi' as const },
                    { label: 'English', key: 'english' as const },
                    { label: 'Mathematics', key: 'mathematics' as const },
                    { label: 'Science', key: 'science' as const },
                    { label: 'Social Studies', key: 'socialStudies' as const },
                  ].map((s) => (
                    <div key={s.key} className="bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        {s.label}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        required
                        value={marks[s.key]}
                        onChange={(e) => handleMarkChange(s.key, e.target.value)}
                        className={`w-full bg-white border rounded py-1 px-2 text-sm font-bold text-center focus:outline-none ${
                          marks[s.key] < 35
                            ? 'border-red-400 text-red-700'
                            : 'border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Real-time Computed Summary */}
              <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-3 flex items-center justify-between text-xs">
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase">Computed Total</span>
                  <span className="text-base font-black text-blue-950">{previewTotal} / 600</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase">Percentage</span>
                  <span className="text-base font-black text-blue-950">{previewPercentage}%</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase">Grade</span>
                  <span
                    className={`text-sm font-extrabold px-2 py-0.5 rounded ${
                      previewGrade === 'Fail'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {previewGrade}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase">Status</span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      previewPassed ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                    }`}
                  >
                    {previewPassed ? 'PASS' : 'FAIL'}
                  </span>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-[#1E3A8A] hover:bg-blue-900 transition-colors cursor-pointer shadow-xs"
                >
                  {saving ? 'Saving...' : editingStudent ? 'Update Marks' : 'Save Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
