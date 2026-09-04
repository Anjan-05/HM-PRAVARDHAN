import React, { useState, useEffect } from 'react';
import { api } from '../../api.ts';
import { Achievement } from '../../types.ts';
import {
  Award,
  Filter,
  CheckCircle2,
  FileText,
  Building,
  Calendar,
  Sparkles,
  Search,
  ExternalLink,
  X,
} from 'lucide-react';

interface AchievementWallProps {
  onSelectHM?: (hmId: string) => void;
}

export const AchievementWall: React.FC<AchievementWallProps> = ({ onSelectHM }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api
      .getAchievements({
        status: 'VERIFIED',
        featuredOnly: featuredOnly || undefined,
      })
      .then(setAchievements)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [featuredOnly]);

  const categories = [
    'All',
    'Academic Excellence',
    'Science & Innovation',
    'Sports & Athletics',
    'Environmental Initiative',
    'School Development',
    'Digital Literacy',
  ];

  const filtered = achievements.filter((a) => {
    if (selectedCategory !== 'All' && a.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="max-w-3xl">
          <div className="flex items-center space-x-2 text-xs font-bold text-[#1E3A8A] uppercase tracking-wider mb-1">
            <Award className="w-4 h-4 text-[#1E3A8A]" />
            <span>Excellence in Action</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            School Achievement &amp; Honors Wall
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
            Public gallery of officially verified government school achievements, state science prizes, sports championships, and campus transformations verified by District Education Officers.
          </p>
        </div>

        {/* Filters */}
        <div className="mt-6 pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                  selectedCategory === c
                    ? 'bg-[#1E3A8A] text-white shadow-xs'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <label className="flex items-center space-x-2 text-xs font-bold text-gray-700 cursor-pointer bg-[#F3F4F6] px-3 py-1.5 rounded-lg border border-gray-200">
            <input
              type="checkbox"
              checked={featuredOnly}
              onChange={(e) => setFeaturedOnly(e.target.checked)}
              className="rounded text-[#1E3A8A] focus:ring-0 cursor-pointer"
            />
            <span className="flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Show Featured Only</span>
            </span>
          </label>
        </div>
      </div>

      {/* Grid of Achievements */}
      {loading ? (
        <div className="py-16 text-center text-sm text-gray-400">Loading verified achievements...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center text-gray-500">
          No verified achievements found matching this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((ach) => (
            <div
              key={ach.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-xs flex flex-col justify-between hover:border-blue-400 hover:shadow-sm transition-all"
            >
              <div>
                {ach.imageUrl && (
                  <div
                    onClick={() => setSelectedImage(ach.imageUrl || null)}
                    className="h-48 overflow-hidden bg-gray-100 relative cursor-pointer group"
                  >
                    <img
                      src={ach.imageUrl}
                      alt={ach.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                      Click to expand photo
                    </div>
                    <span className="absolute top-2 right-2 bg-green-600 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-xs">
                      +{ach.bonusCreditsAwarded} Bonus Pts
                    </span>
                    {ach.isFeatured && (
                      <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center space-x-1 shadow-xs">
                        <Sparkles className="w-3 h-3" />
                        <span>Featured</span>
                      </span>
                    )}
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-center space-x-2 text-[11px] font-bold text-gray-500 mb-1">
                    <span className="bg-blue-50 text-[#1E3A8A] px-2 py-0.5 rounded border border-blue-100 uppercase">
                      {ach.category}
                    </span>
                    <span>&bull;</span>
                    <span>{ach.achievementDate}</span>
                  </div>

                  <h3 className="font-bold text-base text-gray-900 leading-snug mb-2">
                    {ach.title}
                  </h3>

                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-4">
                    {ach.description}
                  </p>

                  {ach.documentName && (
                    <div className="mt-3 inline-flex items-center space-x-1.5 text-[11px] text-[#1E3A8A] bg-blue-50 px-2 py-1 rounded border border-blue-100">
                      <FileText className="w-3.5 h-3.5 text-[#1E3A8A]" />
                      <span className="font-bold truncate max-w-[200px]">{ach.documentName}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card footer */}
              <div className="p-5 pt-3 border-t border-gray-100 bg-[#F3F4F6]/60">
                <div className="flex justify-between items-start text-xs text-gray-600">
                  <div className="truncate max-w-[200px]">
                    <div className="font-bold text-gray-900 truncate">{ach.schoolName}</div>
                    <div className="text-[11px] text-gray-500">{ach.headmasterName}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center space-x-1 text-[11px] text-green-700 font-bold bg-green-100 px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Verified</span>
                    </span>
                    <div className="text-[10px] text-gray-400 mt-0.5">{ach.district}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Modal Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-lg overflow-hidden">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-3 right-3 bg-black/60 text-white p-1.5 rounded-full hover:bg-black/90 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedImage}
              alt="Enlarged Achievement Evidence"
              referrerPolicy="no-referrer"
              className="max-h-[85vh] max-w-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};
