import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { useSocket } from '../../hooks/useSocket';
import { useToast } from '../../hooks/useToast';
import NotificationItem from '../../components/notification/NotificationItem';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setUnreadNotifCount } = useSocket();
  const { showToast } = useToast();

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getNotifications();
      if (res.success && res.data) {
        setNotifications(res.data);
        setUnreadNotifCount(res.unreadCount || 0);
      }
    } catch (err) {
      showToast('Failed to load notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadNotifCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadNotifCount(0);
      showToast('All notifications marked as read', 'success');
    } catch (err) {
      showToast('Failed to mark all as read', 'error');
    }
  };

  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <div className="max-w-2xl mx-auto p-3 sm:p-5 space-y-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Notifications
          </h2>
          <p className="text-xs text-slate-400">
            Recent interactions, likes, comments & follows
          </p>
        </div>

        {hasUnread && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            icon={CheckCheck}
          >
            Mark all read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
          <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
          <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications yet"
          description="When other campus members like, comment on your posts, or follow you, you will see notifications here."
        />
      ) : (
        <div className="space-y-2.5">
          {notifications.map((notif) => (
            <NotificationItem
              key={notif._id}
              notification={notif}
              onMarkRead={handleMarkRead}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
