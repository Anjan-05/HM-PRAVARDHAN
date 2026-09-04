import React, { useState, useEffect } from 'react';
import { api } from '../../api.ts';
import { School } from '../../types.ts';
import {
  School as SchoolIcon,
  Search,
  Filter,
  Users,
  GraduationCap,
  MapPin,
  Building,
  Phone,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

interface ExploreSchoolsProps {
  onSelectSchool: (school: School) => void;
}

export const ExploreSchools: React.FC<ExploreSchoolsProps> = ({ onSelectSchool }) => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const data = await api.getSchools({
        district: selectedDistrict !== 'All' ? selectedDistrict : undefined,
        search: search || undefined,
      });
      setSchools(data);
    } catch (err) {
      console.error('Error fetching schools:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, [selectedDistrict]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSchools();
  };

  const filteredSchools = schools.filter((s) => {
    if (selectedCategory !== 'All' && s.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  const districts = ['All', 'Warangal Urban', 'Karimnagar', 'Hyderabad', 'Ranga Reddy', 'Medak', 'Nizamabad', 'Khammam', 'Nalgonda', 'Medchal-Malkajgiri'];
  const categories = ['All', 'High School (6-10)', 'Model School', 'Higher Secondary (6-12)', 'Upper Primary (1-8)'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="max-w-3xl">
          <div className="flex items-center space-x-2 text-xs font-bold text-[#1E3A8A] uppercase tracking-wider mb-1">
            <SchoolIcon className="w-4 h-4 text-[#1E3A8A]" />
            <span>State Education Directory</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Explore Government Schools</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
            Browse official school profiles across Telangana districts. View student enrollment, teacher staffing strength, assigned Headmasters, and institutional credentials.
          </p>
        </div>

        {/* Filter controls */}
        <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col md:flex-row gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search school name, code, or HM..."
              className="w-full bg-white border border-gray-300 rounded-lg py-2 pl-9 pr-3 text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </form>

          <div className="flex flex-wrap gap-2">
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="All">All Districts ({schools.length})</option>
              {districts.filter((d) => d !== 'All').map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <button
              onClick={fetchSchools}
              type="button"
              className="bg-[#1E3A8A] hover:bg-blue-900 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid of schools */}
      {loading ? (
        <div className="py-12 text-center text-sm text-gray-400">Loading schools directory...</div>
      ) : filteredSchools.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center text-gray-500">
          <p className="text-sm">No schools matched the selected criteria.</p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedDistrict('All');
              setSelectedCategory('All');
              fetchSchools();
            }}
            className="mt-3 text-xs text-[#1E3A8A] font-bold hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSchools.map((sch) => {
            const studentTeacherRatio = Math.round(sch.studentCount / (sch.teacherCount || 1));
            return (
              <div
                key={sch.id}
                className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs flex flex-col justify-between hover:border-blue-400 hover:shadow-sm transition-all"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[11px] font-mono font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                      {sch.schoolCode}
                    </span>
                    <span className="text-[11px] font-bold text-[#1E3A8A] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                      {sch.category}
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-900 text-base leading-snug mb-1">
                    {sch.name}
                  </h3>

                  <div className="flex items-center space-x-1.5 text-xs text-gray-500 mb-3">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                    <span className="truncate">
                      {sch.mandal}, {sch.district}
                    </span>
                  </div>

                  <div className="bg-[#F3F4F6] rounded-lg p-3 space-y-1.5 border border-gray-200 text-xs">
                    <div className="flex justify-between text-gray-600">
                      <span>Assigned Headmaster:</span>
                      <span className="font-bold text-gray-900 truncate max-w-[170px]">
                        {sch.headmasterName}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Students Enrolled:</span>
                      <span className="font-bold text-gray-800">{sch.studentCount}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Teaching Faculty:</span>
                      <span className="font-medium text-gray-800">{sch.teacherCount} Teachers</span>
                    </div>
                    <div className="flex justify-between text-gray-600 pt-1 border-t border-gray-200">
                      <span>PTR (Student:Teacher):</span>
                      <span className="font-bold text-[#1E3A8A]">{studentTeacherRatio} : 1</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] text-gray-400">Est. {sch.establishedYear}</span>
                  <button
                    onClick={() => onSelectSchool(sch)}
                    className="bg-blue-50 hover:bg-blue-100 text-[#1E3A8A] text-xs font-bold px-3 py-1.5 rounded flex items-center space-x-1 transition-colors cursor-pointer"
                  >
                    <span>View School Details</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
