import React, { useState, useEffect } from 'react';
import { ActivityPost, ActivityCategory, User, Headmaster } from '../../types.ts';
import { api } from '../../api.ts';
import { ActivityFeedCard } from './ActivityFeedCard.tsx';
import { ActivityUploadModal } from './ActivityUploadModal.tsx';
import {
  Sparkles,
  Plus,
  Search,
  Filter,
  Layers,
  Award,
  Calendar,
  AlertCircle,
  RefreshCw,
  Info,
  CheckCircle2,
} from 'lucide-react';

interface ActivityFeedPageProps {
  currentUser: User | null;
  onSelectHM?: (hmId: string) => void;
  onSelectSchool?: (schoolId: string) => void;
  onNavigateToAchievements?: () => void;
}

const CATEGORIES: (ActivityCategory | 'All')[] = [
  'All',
  'Academic Activity',
  'Sports',
  'Cultural Activity',
  'Science & Innovation',
  'Student Activity',
  'Community Activity',
  'Environmental Activity',
  'School Event',
  'Awareness Program',
  'Other',
];

export const ActivityFeedPage: React.FC<ActivityFeedPageProps> = ({
  currentUser,
  onSelectHM,
  onSelectSchool,
  onNavigateToAchievements,
}) => {
  const [posts, setPosts] = useState<ActivityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory | 'All'>('All');
  const [filterOnlyMine, setFilterOnlyMine] = useState(false);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<ActivityPost | null>(null);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  const [currentHM, setCurrentHM] = useState<Headmaster | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isHM = currentUser?.role === 'HEADMASTER';
  const isOfficer = currentUser?.role === 'EDUCATION_OFFICER';

  // Load current HM data if logged in
  useEffect(() => {
    if (isHM && currentUser.headmasterId) {
      api.getHeadmasterById(currentUser.headmasterId)
        .then((hm) => setCurrentHM(hm))
        .catch(console.error);
    }
  }, [isHM, currentUser]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await api.getActivityPosts({
        headmasterId: filterOnlyMine && currentUser?.headmasterId ? currentUser.headmasterId : undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        search: searchQuery.trim() || undefined,
      });
      setPosts(data);
    } catch (err) {
      console.error('Failed to load activity posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [selectedCategory, filterOnlyMine]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadPosts();
  };

  const handleCreatePost = async (formData: {
    title: string;
    description: string;
    category: ActivityCategory;
    activityDate: string;
    media: any[];
  }) => {
    if (!currentUser?.headmasterId) {
      throw new Error('You must be logged in as a Headmaster to publish activity posts.');
    }

    const payload = {
      headmasterId: currentUser.headmasterId,
      headmasterName: currentUser.name,
      schoolId: currentHM?.schoolId || '',
      schoolName: currentHM?.schoolName || 'Telangana Government High School',
      district: currentHM?.district || 'Telangana',
      mandal: currentHM?.mandal || '',
      title: formData.title,
      description: formData.description,
      category: formData.category,
      activityDate: formData.activityDate,
      media: formData.media,
    };

    const newPost = await api.createActivityPost(payload);
    setPosts((prev) => [newPost, ...prev]);
    showToast('Activity post published successfully to the common feed!');
  };

  const handleUpdatePost = async (formData: {
    title: string;
    description: string;
    category: ActivityCategory;
    activityDate: string;
    media: any[];
  }) => {
    if (!editingPost || !currentUser?.headmasterId) return;

    const updated = await api.updateActivityPost(editingPost.id, {
      requestingHmId: currentUser.headmasterId,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      activityDate: formData.activityDate,
      media: formData.media,
    });

    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setEditingPost(null);
    showToast('Activity post updated successfully!');
  };

  const handleDeletePost = async () => {
    if (!postToDelete || !currentUser?.headmasterId) return;

    try {
      await api.deleteActivityPost(postToDelete, currentUser.headmasterId);
      setPosts((prev) => prev.filter((p) => p.id !== postToDelete));
      setPostToDelete(null);
      showToast('Activity post deleted successfully.');
    } catch (err: any) {
      alert(err.message || 'Failed to delete post.');
    }
  };

  const handleLike = async (postId: string) => {
    if (!currentUser) return;
    try {
      const updated = await api.toggleLikeActivityPost(postId, currentUser.id);
      setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-800 text-white px-4 py-3 rounded-lg shadow-xl flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 bg-blue-50 text-[#1E3A8A] rounded-lg">
                <Layers className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  HM School Activity Feed
                </h1>
                <p className="text-xs text-gray-500 font-medium">
                  Social sharing timeline for Headmasters to showcase school events, cultural celebrations, sports &amp; science activities
                </p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center space-x-3 shrink-0">
            {isHM && (
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(true)}
                className="inline-flex items-center space-x-2 bg-[#1E3A8A] hover:bg-blue-800 text-white px-4 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Upload Activity Post</span>
              </button>
            )}

            {isOfficer && (
              <span className="inline-flex items-center space-x-1.5 bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1.5 rounded-lg text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                <span>Officer Observation View</span>
              </span>
            )}
          </div>
        </div>

        {/* Clear Guidance Banner distinguishing from official achievements */}
        <div className="mt-5 p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-blue-900">
          <div className="flex items-start space-x-2">
            <Info className="w-4 h-4 text-[#1E3A8A] shrink-0 mt-0.5" />
            <span>
              <strong>Curricular &amp; Co-Curricular Social Stream:</strong> Headmasters share student moments, sports matches, and school exhibitions here.
              For official institutional achievements requiring DEO verification and bonus scoring credits, submit via the <strong>Achievement Verification System</strong>.
            </span>
          </div>
          {onNavigateToAchievements && (
            <button
              type="button"
              onClick={onNavigateToAchievements}
              className="inline-flex items-center space-x-1 font-bold text-[#1E3A8A] hover:text-blue-900 underline shrink-0 cursor-pointer"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Official Achievements</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-4 mb-6 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Search by activity, school, HM, or district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs border border-gray-300 rounded-lg pl-9 pr-8 py-2.5 text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-[#1E3A8A]"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  api.getActivityPosts({
                    headmasterId: filterOnlyMine && currentUser?.headmasterId ? currentUser.headmasterId : undefined,
                    category: selectedCategory !== 'All' ? selectedCategory : undefined,
                  }).then(setPosts);
                }}
                className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </form>

          {/* Right toggles (My posts vs All) */}
          <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end">
            {isHM && (
              <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setFilterOnlyMine(false)}
                  className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                    !filterOnlyMine
                      ? 'bg-white text-gray-900 shadow-xs font-bold'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  All Schools Feed
                </button>
                <button
                  type="button"
                  onClick={() => setFilterOnlyMine(true)}
                  className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                    filterOnlyMine
                      ? 'bg-white text-blue-900 shadow-xs font-bold'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  My School's Posts
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={loadPosts}
              className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              title="Refresh feed"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="pt-2 border-t border-gray-100 flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-gray-400 text-[11px] font-bold uppercase tracking-wider shrink-0 pr-1">
            Category:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                selectedCategory === cat
                  ? 'bg-[#1E3A8A] text-white font-bold shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Stream */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-xs">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A8A] mx-auto mb-3"></div>
          <p className="text-xs text-gray-500 font-medium">Loading school activity feed...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-xs">
          <div className="w-14 h-14 bg-blue-50 text-blue-700 rounded-full flex items-center justify-center mx-auto mb-3">
            <Layers className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">No Activity Posts Found</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto mb-4">
            {searchQuery || selectedCategory !== 'All' || filterOnlyMine
              ? 'Try changing your search terms or category filter to see more posts.'
              : 'Be the first Headmaster to share a school science fair, sports victory, or cultural celebration!'}
          </p>

          <div className="flex items-center justify-center space-x-3">
            {(searchQuery || selectedCategory !== 'All' || filterOnlyMine) && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setFilterOnlyMine(false);
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            )}
            {isHM && (
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(true)}
                className="px-4 py-2 bg-[#1E3A8A] hover:bg-blue-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                + Create Activity Post
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <ActivityFeedCard
              key={post.id}
              post={post}
              currentUser={currentUser}
              onLike={handleLike}
              onEdit={(p) => setEditingPost(p)}
              onDelete={(id) => setPostToDelete(id)}
              onSelectHM={onSelectHM}
            />
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <ActivityUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onSubmit={handleCreatePost}
        />
      )}

      {/* Edit Modal */}
      {editingPost && (
        <ActivityUploadModal
          isOpen={!!editingPost}
          onClose={() => setEditingPost(null)}
          onSubmit={handleUpdatePost}
          editingPost={editingPost}
        />
      )}

      {/* Delete Confirmation Modal */}
      {postToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-200">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 text-center mb-1">
              Delete Activity Post?
            </h3>
            <p className="text-xs text-gray-500 text-center mb-5">
              Are you sure you want to permanently delete this post? All attached images and videos will be removed from the common feed.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setPostToDelete(null)}
                className="px-4 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeletePost}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer"
              >
                Yes, Delete Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
