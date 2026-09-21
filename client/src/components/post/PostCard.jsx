import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  MoreHorizontal,
  Trash2,
  Edit2,
  Send,
  Sparkles
} from 'lucide-react';
import { postService } from '../../services/postService';
import { commentService } from '../../services/commentService';
import { savedService } from '../../services/savedService';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import { useToast } from '../../hooks/useToast';
import Avatar from '../common/Avatar';
import CommentItem from './CommentItem';
import Modal from '../common/Modal';
import Button from '../common/Button';

export const PostCard = ({ post, onPostDeleted, onPostUpdated }) => {
  const { user } = useAuth();
  const { isUserOnline } = useSocket();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const author = post.author || {};
  const isPostAuthor = user && author && user._id === author._id;
  const isAdmin = user && user.role === 'admin';

  // Local interaction states
  const [isLiked, setIsLiked] = useState(!!post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [isSaved, setIsSaved] = useState(!!post.isSaved);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);

  // Comments drawer states
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Edit / Delete modal states
  const [showMenu, setShowMenu] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editContent, setEditContent] = useState(post.content || '');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Format server media URL if starts with /uploads
  const resolvedImage = post.image && post.image.startsWith('/uploads')
    ? `${import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'}${post.image}`
    : post.image;

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMin = Math.floor(diffMs / (1000 * 60));
      if (diffMin < 1) return 'just now';
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const handleLikeToggle = async () => {
    // Optimistic UI update
    const nextIsLiked = !isLiked;
    const nextCount = nextIsLiked ? likesCount + 1 : Math.max(0, likesCount - 1);
    setIsLiked(nextIsLiked);
    setLikesCount(nextCount);

    try {
      const res = await postService.toggleLike(post._id);
      if (res.success && res.data) {
        setIsLiked(res.data.isLiked);
        setLikesCount(res.data.likesCount);
      }
    } catch (error) {
      // Revert on error
      setIsLiked(isLiked);
      setLikesCount(likesCount);
      showToast('Failed to update like status', 'error');
    }
  };

  const handleSaveToggle = async () => {
    const nextIsSaved = !isSaved;
    setIsSaved(nextIsSaved);

    try {
      if (isSaved) {
        await savedService.unsavePost(post._id);
        showToast('Removed from saved posts', 'info');
      } else {
        await savedService.savePost(post._id);
        showToast('Saved to your collection', 'success');
      }
    } catch (error) {
      setIsSaved(isSaved);
      showToast('Failed to update save status', 'error');
    }
  };

  const toggleCommentsDrawer = async () => {
    const nextState = !showComments;
    setShowComments(nextState);

    if (nextState && comments.length === 0) {
      setLoadingComments(true);
      try {
        const res = await commentService.getComments(post._id);
        if (res.success && res.data) {
          setComments(res.data);
        }
      } catch (error) {
        showToast('Failed to load comments', 'error');
      } finally {
        setLoadingComments(false);
      }
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await commentService.addComment(post._id, { content: newCommentText.trim() });
      if (res.success && res.data) {
        setComments([res.data, ...comments]);
        setCommentsCount((prev) => prev + 1);
        setNewCommentText('');
        showToast('Comment added!', 'success');
      }
    } catch (error) {
      showToast('Failed to post comment', 'error');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await commentService.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      setCommentsCount((prev) => Math.max(0, prev - 1));
      showToast('Comment deleted', 'info');
    } catch (error) {
      showToast('Failed to delete comment', 'error');
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/posts/${post._id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      showToast('Post link copied to clipboard!', 'success');
    } else {
      showToast('Sharing post: ' + url, 'info');
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    setIsDeleting(true);
    try {
      await postService.deletePost(post._id);
      showToast('Post deleted successfully', 'success');
      if (onPostDeleted) {
        onPostDeleted(post._id);
      }
    } catch (error) {
      showToast('Failed to delete post', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editContent.trim()) return;

    setIsUpdating(true);
    try {
      const res = await postService.updatePost(post._id, { content: editContent.trim() });
      if (res.success && res.data) {
        setIsEditModalOpen(false);
        showToast('Post updated successfully', 'success');
        if (onPostUpdated) {
          onPostUpdated(res.data);
        }
      }
    } catch (error) {
      showToast('Failed to update post', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  // Render clickable hashtags in post content
  const renderContentWithTags = (text) => {
    if (!text) return null;
    const parts = text.split(/(#[a-zA-Z0-9_]+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('#')) {
        const tag = part.slice(1);
        return (
          <span
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/explore?tag=${tag.toLowerCase()}`);
            }}
            className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <article className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-xs transition duration-200 overflow-hidden mb-4">
      {/* Post Header */}
      <div className="p-4 sm:p-5 pb-3 flex items-start justify-between gap-3">
        <div
          onClick={() => navigate(`/profile/${author?.username}`)}
          className="flex items-center gap-3 cursor-pointer group min-w-0"
        >
          <Avatar
            src={author?.profileImage}
            name={author?.fullName || 'Peer'}
            size="md"
            isOnline={isUserOnline(author?._id)}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 transition truncate">
                {author?.fullName || 'Campus Peer'}
              </h4>
              {author?.department && (
                <span className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md truncate">
                  {author.department}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>@{author?.username || 'user'}</span>
              <span>·</span>
              <span>{formatDate(post.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* More Actions Menu */}
        {(isPostAuthor || isAdmin) && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
              aria-label="More options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showMenu && (
              <div
                onClick={() => setShowMenu(false)}
                className="absolute right-0 mt-1 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1.5 z-20"
              >
                {isPostAuthor && (
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="w-full text-left px-3.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-indigo-500" /> Edit Post
                  </button>
                )}
                <button
                  onClick={handleDeletePost}
                  disabled={isDeleting}
                  className="w-full text-left px-3.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post Content */}
      <div className="px-4 sm:px-5 pb-3">
        <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
          {renderContentWithTags(post.content)}
        </p>
      </div>

      {/* Post Image Attachment */}
      {resolvedImage && (
        <div className="mx-4 sm:mx-5 mb-3 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-800 max-h-[460px] flex items-center justify-center">
          <img
            src={resolvedImage}
            alt="Post media"
            className="w-full h-full object-cover max-h-[460px] hover:scale-[1.01] transition duration-300"
            loading="lazy"
          />
        </div>
      )}

      {/* Interaction Buttons Bar */}
      <div className="px-4 sm:px-5 py-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Like Button */}
          <button
            onClick={handleLikeToggle}
            className={`flex items-center gap-1.5 font-medium transition active:scale-110 ${
              isLiked
                ? 'text-rose-500 font-bold'
                : 'hover:text-rose-500'
            }`}
            aria-label="Like post"
          >
            <Heart
              className={`w-4 h-4 transition ${
                isLiked ? 'fill-rose-500 text-rose-500' : ''
              }`}
            />
            <span>{likesCount}</span>
          </button>

          {/* Comment Toggle */}
          <button
            onClick={toggleCommentsDrawer}
            className="flex items-center gap-1.5 font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition"
            aria-label="View comments"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{commentsCount}</span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition"
            aria-label="Share post"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>

        {/* Save / Bookmark Button */}
        <button
          onClick={handleSaveToggle}
          className={`flex items-center gap-1.5 font-medium transition active:scale-110 ${
            isSaved
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'hover:text-indigo-600 dark:hover:text-indigo-400'
          }`}
          aria-label="Save post"
        >
          <Bookmark
            className={`w-4 h-4 transition ${
              isSaved ? 'fill-indigo-600 text-indigo-600 dark:fill-indigo-400 dark:text-indigo-400' : ''
            }`}
          />
          <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
        </button>
      </div>

      {/* Inline Comments Section */}
      {showComments && (
        <div className="px-4 sm:px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} className="flex gap-2.5 mb-3">
            <Avatar src={user?.profileImage} name={user?.fullName} size="xs" className="mt-1" />
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Write a thoughtful comment..."
                className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-indigo-500"
              />
              <Button
                type="submit"
                size="sm"
                variant="primary"
                isLoading={submittingComment}
                disabled={!newCommentText.trim()}
                className="py-1 px-3 text-xs"
              >
                Reply
              </Button>
            </div>
          </form>

          {/* Comments List */}
          {loadingComments ? (
            <p className="text-xs text-slate-400 text-center py-2">Loading discussion...</p>
          ) : comments.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-2">
              No comments yet. Be the first to share your perspective!
            </p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-64 overflow-y-auto pr-1">
              {comments.map((c) => (
                <CommentItem
                  key={c._id}
                  comment={c}
                  postAuthorId={author?._id}
                  onDelete={handleDeleteComment}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Post Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Post"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <textarea
            rows={4}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 resize-none"
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              variant="primary"
              isLoading={isUpdating}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </article>
  );
};

export default PostCard;
