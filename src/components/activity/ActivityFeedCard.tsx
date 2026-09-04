import React, { useState } from 'react';
import { ActivityPost, ActivityMedia, User } from '../../types.ts';
import {
  Heart,
  Calendar,
  MapPin,
  School as SchoolIcon,
  Edit2,
  Trash2,
  Share2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Play,
} from 'lucide-react';

interface ActivityFeedCardProps {
  post: ActivityPost;
  currentUser: User | null;
  onLike: (postId: string) => void;
  onEdit?: (post: ActivityPost) => void;
  onDelete?: (postId: string) => void;
  onSelectHM?: (hmId: string) => void;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Academic Activity': { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
  Sports: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
  'Cultural Activity': { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
  'Science & Innovation': { bg: 'bg-cyan-50', text: 'text-cyan-800', border: 'border-cyan-200' },
  'Student Activity': { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200' },
  'Community Activity': { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  'Environmental Activity': { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-200' },
  'School Event': { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200' },
  'Awareness Program': { bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-200' },
  Other: { bg: 'bg-gray-50', text: 'text-gray-800', border: 'border-gray-200' },
};

export const ActivityFeedCard: React.FC<ActivityFeedCardProps> = ({
  post,
  currentUser,
  onLike,
  onEdit,
  onDelete,
  onSelectHM,
}) => {
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [lightboxMedia, setLightboxMedia] = useState<ActivityMedia | null>(null);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Security check: Only author HM can edit or delete this post
  const isOwner = Boolean(
    currentUser &&
      currentUser.role === 'HEADMASTER' &&
      currentUser.headmasterId &&
      currentUser.headmasterId === post.headmasterId
  );

  const isLiked = Boolean(currentUser && post.likedBy?.includes(currentUser.id));
  const categoryStyle = CATEGORY_COLORS[post.category] || CATEGORY_COLORS['Other'];

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  const formattedPostDate = new Date(post.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const formattedActivityDate = new Date(post.activityDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const mediaList = post.media || [];
  const currentMedia = mediaList[activeMediaIndex];

  return (
    <article className="bg-white rounded-xl border border-gray-200 shadow-xs hover:shadow-sm transition-shadow duration-200 overflow-hidden mb-6">
      {/* Post Header */}
      <div className="p-4 sm:p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start space-x-3 min-w-0">
            {/* HM Initials Avatar */}
            <button
              type="button"
              onClick={() => onSelectHM && onSelectHM(post.headmasterId)}
              className="w-11 h-11 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center font-bold text-sm shrink-0 hover:ring-2 hover:ring-blue-400 transition-all cursor-pointer shadow-xs"
              title={`View HM profile for ${post.headmasterName}`}
            >
              {post.headmasterName
                .split(' ')
                .slice(0, 2)
                .map((n) => n[0])
                .join('')}
            </button>

            {/* Author details */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <button
                  type="button"
                  onClick={() => onSelectHM && onSelectHM(post.headmasterId)}
                  className="font-bold text-gray-900 text-sm hover:text-blue-700 transition-colors text-left truncate cursor-pointer"
                >
                  {post.headmasterName}
                </button>
                <span className="inline-flex items-center text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3 mr-0.5 text-blue-600" />
                  Headmaster
                </span>
              </div>

              <div className="flex items-center text-xs text-gray-600 font-medium mt-0.5 truncate">
                <SchoolIcon className="w-3.5 h-3.5 text-gray-400 mr-1 shrink-0" />
                <span className="truncate">{post.schoolName}</span>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 text-[11px] text-gray-400 mt-0.5">
                {(post.district || post.mandal) && (
                  <span className="flex items-center">
                    <MapPin className="w-3 h-3 mr-0.5" />
                    {[post.mandal, post.district].filter(Boolean).join(', ')}
                  </span>
                )}
                <span>•</span>
                <span>Posted {formattedPostDate}</span>
              </div>
            </div>
          </div>

          {/* Category Badge & Owner Action Buttons */}
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold border ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border}`}
            >
              {post.category}
            </span>

            {/* If Owner: Show Edit & Delete. Other HMs / Officers cannot edit/delete */}
            {isOwner && (
              <div className="flex items-center space-x-1 border-l border-gray-200 sm:pl-2">
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(post)}
                    className="p-1.5 text-gray-500 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                    title="Edit your post"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(post.id)}
                    className="p-1.5 text-gray-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                    title="Delete your post"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Title & Activity Date */}
        <div className="mt-3">
          <h3 className="text-base font-bold text-gray-900 leading-snug">{post.title}</h3>
          <div className="flex items-center text-xs text-blue-900/80 font-medium mt-1">
            <Calendar className="w-3.5 h-3.5 mr-1 text-[#1E3A8A]" />
            <span>Activity Date: {formattedActivityDate}</span>
          </div>
        </div>

        {/* Description */}
        {post.description && (
          <p className="mt-2 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {post.description}
          </p>
        )}
      </div>

      {/* Media Player / Carousel / Viewer */}
      {mediaList.length > 0 && (
        <div className="relative bg-gray-950 border-t border-b border-gray-100 overflow-hidden">
          {currentMedia?.mediaType === 'VIDEO' ? (
            <div className="w-full flex items-center justify-center bg-black aspect-video max-h-[440px]">
              <video
                src={currentMedia.mediaUrl}
                controls
                playsInline
                preload="metadata"
                className="w-full h-full max-h-[440px] object-contain"
              >
                Your browser does not support HTML5 video playback.
              </video>
            </div>
          ) : (
            <div
              className="relative w-full aspect-video max-h-[440px] flex items-center justify-center bg-gray-900 cursor-pointer group"
              onClick={() => setLightboxMedia(currentMedia)}
            >
              <img
                src={currentMedia.mediaUrl}
                alt={currentMedia.caption || post.title}
                className="w-full h-full object-contain max-h-[440px]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full flex items-center space-x-1.5 backdrop-blur-xs">
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Click to view full photo</span>
                </span>
              </div>
            </div>
          )}

          {/* Caption overlay if present */}
          {currentMedia?.caption && (
            <div className="px-4 py-2 bg-gray-900/90 text-gray-200 text-xs flex justify-between items-center border-t border-gray-800">
              <span className="truncate">{currentMedia.caption}</span>
              {mediaList.length > 1 && (
                <span className="text-gray-400 text-[11px] shrink-0 ml-2 font-mono">
                  {activeMediaIndex + 1} / {mediaList.length}
                </span>
              )}
            </div>
          )}

          {/* Carousel navigation controls if multiple media items */}
          {mediaList.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMediaIndex((prev) => (prev > 0 ? prev - 1 : mediaList.length - 1));
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full transition-colors cursor-pointer"
                title="Previous media"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMediaIndex((prev) => (prev < mediaList.length - 1 ? prev + 1 : 0));
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full transition-colors cursor-pointer"
                title="Next media"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Thumbnails strip */}
              <div className="flex justify-center items-center gap-1.5 py-2 bg-gray-900">
                {mediaList.map((m, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveMediaIndex(idx)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      idx === activeMediaIndex ? 'w-6 bg-blue-500' : 'w-2 bg-gray-600 hover:bg-gray-400'
                    }`}
                    title={`Go to media ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Card Footer Actions */}
      <div className="px-4 sm:px-5 py-3 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
        <div className="flex items-center space-x-4">
          {/* Like / Cheer button */}
          <button
            type="button"
            onClick={() => onLike(post.id)}
            disabled={!currentUser}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              isLiked
                ? 'text-rose-600 bg-rose-50 hover:bg-rose-100'
                : 'text-gray-600 hover:text-rose-600 hover:bg-white'
            }`}
            title={currentUser ? 'Cheer this school activity' : 'Sign in to cheer'}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
            <span>{post.likesCount || 0}</span>
            <span className="hidden sm:inline font-normal text-gray-500">
              {post.likesCount === 1 ? 'cheer' : 'cheers'}
            </span>
          </button>

          {/* Share button */}
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-gray-600 hover:text-blue-700 hover:bg-white font-medium transition-colors cursor-pointer"
            title="Copy link to clipboard"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>

          {copiedNotification && (
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 animate-fade-in">
              Link copied!
            </span>
          )}
        </div>

        <div className="text-[11px] text-gray-400 flex items-center space-x-1">
          <span>School Activity Stream</span>
        </div>
      </div>

      {/* Lightbox Modal for full image view */}
      {lightboxMedia && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setLightboxMedia(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxMedia(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          <div
            className="max-w-4xl max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxMedia.mediaUrl}
              alt={lightboxMedia.caption || post.title}
              className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
            />
            {lightboxMedia.caption && (
              <p className="mt-3 text-white text-sm text-center bg-black/50 px-4 py-2 rounded-lg">
                {lightboxMedia.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </article>
  );
};
