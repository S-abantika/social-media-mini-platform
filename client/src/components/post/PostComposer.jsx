import React, { useState, useRef } from 'react';
import { Image, X, Send, Sparkles } from 'lucide-react';
import { postService } from '../../services/postService';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import Avatar from '../common/Avatar';
import Button from '../common/Button';

export const PostComposer = ({ onPostCreated, isModal = false }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|png|webp|gif)$/i)) {
      showToast('Please select a valid image file (JPEG, PNG, WEBP, GIF)', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size cannot exceed 5MB', 'error');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview('');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !imageFile) {
      showToast('Please write some text or attach an image.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('content', content.trim());
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await postService.createPost(formData);
      if (res.success && res.data) {
        setContent('');
        removeImage();
        showToast('Post published successfully!', 'success');
        if (onPostCreated) {
          onPostCreated(res.data);
        }
      }
    } catch (error) {
      showToast(
        error.response?.data?.message || 'Failed to create post. Please try again.',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const maxChars = 2000;
  const remainingChars = maxChars - content.length;

  return (
    <div
      className={`bg-white dark:bg-slate-900 ${
        isModal
          ? 'p-0'
          : 'rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs mb-5'
      }`}
    >
      <div className="flex gap-3.5">
        <Avatar
          src={user?.profileImage}
          name={user?.fullName || 'You'}
          size="md"
          className="mt-1"
        />

        <div className="flex-1 min-w-0">
          <form onSubmit={handleSubmit}>
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, maxChars))}
              placeholder={`What's on your mind today, ${user?.fullName?.split(' ')[0] || 'student'}? Share a project, event, or question...`}
              className="w-full bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm resize-none outline-none leading-relaxed"
            />

            {/* Image Preview Container */}
            {imagePreview && (
              <div className="relative my-3 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-72 bg-slate-100 dark:bg-slate-800">
                <img
                  src={imagePreview}
                  alt="Post attachment preview"
                  className="w-full h-full object-cover max-h-72"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1.5 bg-slate-900/70 hover:bg-slate-900 text-white rounded-full transition backdrop-blur-xs"
                  aria-label="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 mt-2">
              <div className="flex items-center gap-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  id="post-image-upload"
                />
                <label
                  htmlFor="post-image-upload"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 rounded-lg cursor-pointer transition select-none"
                >
                  <Image className="w-4 h-4 text-indigo-500" />
                  <span>Photo</span>
                </label>

                <span className="text-[11px] text-slate-400 font-mono ml-2 hidden sm:inline">
                  Use #hashtags to tag topics
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-[11px] font-mono ${
                    remainingChars < 50
                      ? 'text-rose-500 font-bold'
                      : 'text-slate-400'
                  }`}
                >
                  {content.length}/{maxChars}
                </span>

                <Button
                  type="submit"
                  size="sm"
                  variant="primary"
                  isLoading={isSubmitting}
                  disabled={!content.trim() && !imageFile}
                  icon={Send}
                >
                  Publish
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostComposer;
