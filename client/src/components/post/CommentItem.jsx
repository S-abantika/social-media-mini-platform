import React from 'react';
import { Trash2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../common/Avatar';

export const CommentItem = ({ comment, postAuthorId, onDelete }) => {
  const { user } = useAuth();

  const author = comment.author;
  const isAuthor = user && author && user._id === author._id;
  const isPostAuthor = user && user._id === postAuthorId;
  const isAdmin = user && user.role === 'admin';
  const canDelete = isAuthor || isPostAuthor || isAdmin;

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffSec = Math.floor(diffMs / 1000);
      if (diffSec < 60) return 'just now';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `${diffHours}h`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex gap-2.5 py-2.5 group">
      <Avatar
        src={author?.profileImage}
        name={author?.fullName || 'User'}
        size="sm"
        className="mt-0.5"
      />
      <div className="flex-1 bg-slate-50 dark:bg-slate-800/60 rounded-xl px-3.5 py-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              {author?.fullName || 'Campus Peer'}
            </span>
            <span className="text-[11px] text-slate-400">
              @{author?.username}
            </span>
            <span className="text-[10px] text-slate-400">· {formatDate(comment.createdAt)}</span>
          </div>

          {canDelete && (
            <button
              onClick={() => onDelete(comment._id)}
              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition p-1"
              title="Delete comment"
              aria-label="Delete comment"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <p className="text-xs text-slate-700 dark:text-slate-200 mt-1 leading-relaxed">
          {comment.content}
        </p>
      </div>
    </div>
  );
};

export default CommentItem;
