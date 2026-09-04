import React, { useState, useEffect } from 'react';
import { School, Achievement, PerformanceRecord } from '../../types.ts';
import { api } from '../../api.ts';
import {
  Building,
  Users,
  GraduationCap,
  MapPin,
  Phone,
  Mail,
  Award,
  Calendar,
  X,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';

interface SchoolDetailsModalProps {
  school: School | null;
  onClose: () => void;
  onSelectHM?: (hmId: string) => void;
}

export const SchoolDetailsModal: React.FC<SchoolDetailsModalProps> = ({
  school,
  onClose,
  onSelectHM,
}) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loadingAch, setLoadingAch] = useState(false);

  useEffect(() => {
    if (school?.headmasterId) {
      setLoadingAch(true);
      api
        .getAchievements({ headmasterId: school.headmasterId, status: 'VERIFIED' })
        .then(setAchievements)
        .catch(console.error)
        .finally(() => setLoadingAch(false));
    } else {
      setAchievements([]);
    }
  }, [school]);

  if (!school) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#1E3A8A] text-white px-6 py-4 flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-[11px] font-mono bg-blue-900/80 border border-blue-400/40 px-2 py-0.5 rounded text-blue-100 font-bold">
                {school.schoolCode}
              </span>
              <span className="text-xs text-blue-200 font-semibold">{school.category}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold leading-snug text-white">{school.name}</h2>
            <div className="text-xs text-blue-200 mt-0.5 flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-blue-300" />
              <span>
                {school.mandal}, {school.district} District
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-blue-200 hover:text-white p-1 rounded hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#F3F4F6] border border-gray-200 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-500 font-bold">Students Enrolled</div>
              <div className="text-xl font-bold text-gray-900 mt-1">{school.studentCount}</div>
            </div>
            <div className="bg-[#F3F4F6] border border-gray-200 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-500 font-bold">Teaching Staff</div>
              <div className="text-xl font-bold text-gray-900 mt-1">{school.teacherCount}</div>
            </div>
            <div className="bg-[#F3F4F6] border border-gray-200 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-500 font-bold">Pupil-Teacher Ratio</div>
              <div className="text-xl font-bold text-[#1E3A8A] mt-1">
                {Math.round(school.studentCount / (school.teacherCount || 1))} : 1
              </div>
            </div>
          </div>

          {/* School Leadership / Headmaster */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="text-xs text-[#1E3A8A] font-bold uppercase tracking-wider flex items-center space-x-1">
                <UserCheck className="w-3.5 h-3.5 text-[#1E3A8A]" />
                <span>Headmaster in Charge</span>
              </div>
              <div className="font-bold text-gray-900 text-base mt-0.5">
                {school.headmasterName}
              </div>
              <div className="text-xs text-gray-500">
                Official Head of Institution &bull; Responsible for School Administration
              </div>
            </div>
            {school.headmasterId && onSelectHM && (
              <button
                onClick={() => {
                  onClose();
                  onSelectHM(school.headmasterId!);
                }}
                className="bg-[#1E3A8A] hover:bg-blue-900 text-white font-bold text-xs px-3.5 py-2 rounded shadow-xs transition-colors cursor-pointer"
              >
                View HM Profile
              </button>
            )}
          </div>

          {/* Institutional Contact & Profile */}
          <div className="space-y-2 border border-gray-200 rounded-lg p-4 bg-white">
            <h4 className="font-bold text-[#1E3A8A] text-xs uppercase tracking-wider">
              Institutional Profile
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
              <div>
                <span className="text-gray-400 font-medium">Address:</span> {school.address}
              </div>
              <div>
                <span className="text-gray-400 font-medium">Established Year:</span> {school.establishedYear}
              </div>
              <div className="flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                <span>{school.phone}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                <span>{school.email}</span>
              </div>
            </div>
          </div>

          {/* Verified Achievements from this school */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-gray-700 text-xs uppercase tracking-wider flex items-center space-x-1">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>Verified School Achievements ({achievements.length})</span>
              </h4>
            </div>

            {loadingAch ? (
              <div className="text-xs text-gray-400 py-2">Loading achievements...</div>
            ) : achievements.length === 0 ? (
              <div className="bg-[#F3F4F6] p-3 rounded-lg border border-gray-200 text-xs text-gray-500">
                No verified bonus achievements logged for this school yet.
              </div>
            ) : (
              <div className="space-y-2">
                {achievements.map((ach) => (
                  <div
                    key={ach.id}
                    className="bg-[#F3F4F6] border border-gray-200 rounded-lg p-3 flex flex-col sm:flex-row justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-gray-900 text-xs">{ach.title}</span>
                        <span className="text-[10px] bg-green-100 text-green-800 font-bold px-1.5 py-0.5 rounded">
                          +{ach.bonusCreditsAwarded} Pts
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{ach.description}</p>
                      <div className="text-[10px] text-gray-400 mt-1">
                        Category: {ach.category} &bull; Verified on {ach.verifiedAt?.split('T')[0]}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs px-4 py-2 rounded cursor-pointer transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
