import React, { useState, useRef } from 'react';
import { ActivityCategory, ActivityMedia, ActivityPost } from '../../types.ts';
import {
  X,
  Upload,
  Image as ImageIcon,
  Video as VideoIcon,
  Plus,
  Trash2,
  Sparkles,
  AlertCircle,
  Film,
} from 'lucide-react';

interface ActivityUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    category: ActivityCategory;
    activityDate: string;
    media: Omit<ActivityMedia, 'id' | 'activityPostId' | 'createdAt'>[];
  }) => Promise<void>;
  editingPost?: ActivityPost | null;
}

const CATEGORIES: ActivityCategory[] = [
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

// Sample media presets for rapid testing without searching local disk
const SAMPLE_MEDIA_PRESETS = [
  {
    label: 'Science Project',
    type: 'IMAGE' as const,
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    caption: 'Science exhibition solar prototype model',
  },
  {
    label: 'Sports Match',
    type: 'IMAGE' as const,
    url: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=1200&q=80',
    caption: 'Inter-school athletics & sports tournament',
  },
  {
    label: 'Sports Video',
    type: 'VIDEO' as const,
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    caption: 'Championship celebration video clip',
  },
  {
    label: 'Cultural Dance',
    type: 'IMAGE' as const,
    url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
    caption: 'Annual day folk dance & stage celebrations',
  },
  {
    label: 'Tree Plantation',
    type: 'IMAGE' as const,
    url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
    caption: 'Eco-club green school plantation',
  },
  {
    label: 'Smart Class',
    type: 'IMAGE' as const,
    url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
    caption: 'Interactive digital classroom session',
  },
];

export const ActivityUploadModal: React.FC<ActivityUploadModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingPost,
}) => {
  const isEditing = !!editingPost;

  const [title, setTitle] = useState(editingPost?.title || '');
  const [description, setDescription] = useState(editingPost?.description || '');
  const [category, setCategory] = useState<ActivityCategory>(
    editingPost?.category || 'Science & Innovation'
  );
  const [activityDate, setActivityDate] = useState(
    editingPost?.activityDate || new Date().toISOString().split('T')[0]
  );
  const [mediaList, setMediaList] = useState<
    Array<{ mediaUrl: string; mediaType: 'IMAGE' | 'VIDEO'; caption?: string }>
  >(
    editingPost?.media?.map((m) => ({
      mediaUrl: m.mediaUrl,
      mediaType: m.mediaType,
      caption: m.caption || '',
    })) || []
  );

  const [customUrl, setCustomUrl] = useState('');
  const [customMediaType, setCustomMediaType] = useState<'IMAGE' | 'VIDEO'>('IMAGE');
  const [customCaption, setCustomCaption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      // 15MB limit check per file
      if (file.size > 15 * 1024 * 1024) {
        setErrorMessage(`File "${file.name}" exceeds 15MB limit.`);
        return;
      }

      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');

      if (!isImage && !isVideo) {
        setErrorMessage(`Unsupported format: ${file.name}. Please upload JPG, PNG, WEBP, or MP4/WebM.`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const resultUrl = reader.result as string;
        setMediaList((prev) => [
          ...prev,
          {
            mediaUrl: resultUrl,
            mediaType: isVideo ? 'VIDEO' : 'IMAGE',
            caption: file.name.replace(/\.[^/.]+$/, ''),
          },
        ]);
        setErrorMessage('');
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddCustomUrl = () => {
    if (!customUrl.trim()) return;
    setMediaList((prev) => [
      ...prev,
      {
        mediaUrl: customUrl.trim(),
        mediaType: customMediaType,
        caption: customCaption.trim() || undefined,
      },
    ]);
    setCustomUrl('');
    setCustomCaption('');
  };

  const handleAddPreset = (preset: (typeof SAMPLE_MEDIA_PRESETS)[0]) => {
    setMediaList((prev) => [
      ...prev,
      {
        mediaUrl: preset.url,
        mediaType: preset.type,
        caption: preset.caption,
      },
    ]);
  };

  const handleRemoveMedia = (index: number) => {
    setMediaList((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Please provide an activity title.');
      return;
    }
    if (!category) {
      setErrorMessage('Please select a category.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        category,
        activityDate,
        media: mediaList,
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save activity post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8 overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-[#1E3A8A] text-white px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-white">
              {isEditing ? 'Edit Activity Post' : 'Upload School Activity'}
            </h2>
            <p className="text-xs text-blue-200 mt-0.5">
              Share curricular &amp; co-curricular photos or short videos to the HM Activity Feed
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-blue-200 hover:text-white transition-colors cursor-pointer p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informational banner distinguishing from official achievements */}
        <div className="bg-blue-50 border-b border-blue-100 px-6 py-2.5 text-xs text-blue-900 flex items-start space-x-2">
          <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <strong>Activity Stream Note:</strong> Activity posts are shared socially with all Headmasters
            to celebrate school life. They do <em>not</em> receive bonus ranking credits or enter officer verification.
          </div>
        </div>

        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Activity Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. District Science Fair & Robotics Demo, Annual Sports Day, Haritha Haram..."
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
            />
          </div>

          {/* Category & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Activity Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ActivityCategory)}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#1E3A8A]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Date of Activity <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={activityDate}
                onChange={(e) => setActivityDate(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-[#1E3A8A]"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Description &amp; Highlights
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the event, student participation, teachers involved, achievements or highlights..."
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-[#1E3A8A]"
            />
          </div>

          {/* Media Section */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/70 space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center space-x-1.5">
                  <ImageIcon className="w-4 h-4 text-[#1E3A8A]" />
                  <span>Media Uploads (Images &amp; Videos)</span>
                </h4>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Attach multiple pictures or short school activity video clips
                </p>
              </div>
              <span className="text-xs font-bold text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-200">
                {mediaList.length} media attached
              </span>
            </div>

            {/* File Upload Trigger */}
            <div className="flex flex-wrap gap-2 pt-1">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
                id="activity-media-upload"
              />
              <label
                htmlFor="activity-media-upload"
                className="inline-flex items-center space-x-1.5 px-3 py-2 bg-white border border-gray-300 hover:border-blue-600 rounded-lg text-xs font-bold text-gray-700 hover:text-blue-700 cursor-pointer shadow-xs transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload From Device</span>
              </label>

              {/* Sample Media Presets */}
              <div className="flex items-center space-x-1 overflow-x-auto py-0.5 text-[11px]">
                <span className="text-gray-400 pl-2">Sample Presets:</span>
                {SAMPLE_MEDIA_PRESETS.slice(0, 4).map((p) => (
                  <button
                    type="button"
                    key={p.label}
                    onClick={() => handleAddPreset(p)}
                    className="bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 text-gray-700 hover:text-blue-800 px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer shrink-0"
                  >
                    + {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Or add via URL directly */}
            <div className="pt-2 border-t border-gray-200/80">
              <div className="text-[11px] font-bold text-gray-500 mb-1">
                Or attach via direct Web URL:
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  placeholder="https://... (image or mp4/webm video URL)"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="flex-1 text-xs border border-gray-300 rounded px-2.5 py-1.5 text-gray-800 bg-white"
                />
                <select
                  value={customMediaType}
                  onChange={(e) => setCustomMediaType(e.target.value as 'IMAGE' | 'VIDEO')}
                  className="text-xs border border-gray-300 rounded px-2 py-1.5 bg-white text-gray-800"
                >
                  <option value="IMAGE">Image</option>
                  <option value="VIDEO">Video</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddCustomUrl}
                  disabled={!customUrl.trim()}
                  className="bg-[#1E3A8A] hover:bg-blue-800 disabled:opacity-50 text-white font-bold text-xs px-3 py-1.5 rounded transition-colors cursor-pointer shrink-0"
                >
                  Add URL
                </button>
              </div>
            </div>

            {/* Preview of attached media */}
            {mediaList.length > 0 && (
              <div className="pt-3 border-t border-gray-200">
                <div className="text-xs font-bold text-gray-700 mb-2">Attached Media Preview:</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {mediaList.map((m, idx) => (
                    <div
                      key={idx}
                      className="relative group bg-gray-900 rounded-lg overflow-hidden border border-gray-300 aspect-video flex items-center justify-center shadow-xs"
                    >
                      {m.mediaType === 'VIDEO' ? (
                        <div className="relative w-full h-full flex items-center justify-center bg-gray-900">
                          <video
                            src={m.mediaUrl}
                            className="w-full h-full object-cover opacity-80"
                            muted
                            playsInline
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="bg-black/60 text-white p-1.5 rounded-full">
                              <Film className="w-5 h-5 text-amber-400" />
                            </span>
                          </div>
                          <span className="absolute bottom-1 left-1 text-[10px] bg-black/80 text-white px-1.5 rounded font-mono">
                            Video
                          </span>
                        </div>
                      ) : (
                        <img
                          src={m.mediaUrl}
                          alt={m.caption || 'Activity media'}
                          className="w-full h-full object-cover"
                        />
                      )}

                      {/* Remove media button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveMedia(idx)}
                        className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded-md opacity-90 transition-opacity cursor-pointer"
                        title="Remove media"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {m.caption && (
                        <div className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[10px] px-1.5 py-0.5 truncate">
                          {m.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-[#1E3A8A] hover:bg-blue-800 disabled:opacity-50 rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              {isSubmitting
                ? isEditing
                  ? 'Updating Post...'
                  : 'Publishing Post...'
                : isEditing
                ? 'Save Changes'
                : 'Publish to Activity Feed'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
