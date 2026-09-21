import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, UserPlus, Mail, Check } from 'lucide-react';
import Avatar from '../common/Avatar';

export const NotificationItem = ({ notification, onMarkRead }) => {
  const navigate = useNavigate();
  const sender = notification.sender || {};

  const getTypeConfig = () => {
    switch (notification.type) {
      case 'like':
        return {
          icon: Heart,
          color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40',
          text: 'liked your post'
        };
      case 'comment':
        return {
          icon: MessageCircle,
          color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40',
          text: 'commented on your post'
        };
      case 'follow':
        return {
          icon: UserPlus,
          color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
          text: 'started following you'
        };
      default:
        return {
          icon: Mail,
          color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40',
          text: 'interacted with you'
        };
    }
  };

  const { icon: Icon, color, text } = getTypeConfig();

  const handleClick = () => {
    if (!notification.isRead && onMarkRead) {
      onMarkRead(notification._id);
    }

    if (notification.type === 'follow') {
      navigate(`/profile/${sender.username}`);
    } else if (notification.post) {
      navigate(`/posts/${notification.post._id || notification.post}`);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMin = Math.floor(diffMs / (1000 * 60));
      if (diffMin < 60) return `${Math.max(1, diffMin)}m ago`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`flex items-start gap-3.5 p-4 rounded-2xl cursor-pointer transition border ${
        notification.isRead
          ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
          : 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/40 hover:bg-indigo-50/70'
      }`}
    >
      {/* Icon Badge */}
      <div className={`p-2 rounded-xl flex-shrink-0 ${color}`}>
        <Icon className="w-4 h-4" />
      </div>

      {/* Avatar */}
      <Avatar
        src={sender.profileImage}
        name={sender.fullName}
        size="md"
        className="flex-shrink-0"
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-snug">
          <span className="font-bold text-slate-900 dark:text-slate-100">
            {sender.fullName || 'Campus Peer'}
          </span>{' '}
          {text}
        </p>

        {notification.post?.content && (
          <p className="text-xs text-slate-400 truncate mt-1 italic">
            "{notification.post.content}"
          </p>
        )}

        <span className="text-[11px] text-slate-400 mt-1.5 block">
          {formatDate(notification.createdAt)}
        </span>
      </div>

      {/* Unread indicator */}
      {!notification.isRead && (
        <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 flex-shrink-0 mt-2" />
      )}
    </div>
  );
};

export default NotificationItem;
