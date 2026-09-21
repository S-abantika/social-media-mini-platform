import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import { useSocket } from '../../hooks/useSocket';
import Modal from '../common/Modal';
import Avatar from '../common/Avatar';
import { UserCardSkeleton } from '../common/Skeleton';

export const UserFollowListModal = ({ isOpen, onClose, title, userId, type }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isUserOnline } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen || !userId) return;

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res =
          type === 'followers'
            ? await userService.getFollowers(userId)
            : await userService.getFollowing(userId);

        if (res.success && res.data) {
          setUsers(res.data);
        }
      } catch (err) {
        console.error('Failed to load user list:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isOpen, userId, type]);

  const handleUserClick = (username) => {
    onClose();
    navigate(`/profile/${username}`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
        {loading ? (
          <>
            <UserCardSkeleton />
            <UserCardSkeleton />
            <UserCardSkeleton />
          </>
        ) : users.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">
            No users found in this list.
          </p>
        ) : (
          users.map((u) => (
            <div
              key={u._id}
              onClick={() => handleUserClick(u.username)}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar
                  src={u.profileImage}
                  name={u.fullName}
                  size="md"
                  isOnline={isUserOnline(u._id)}
                />
                <div className="truncate">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {u.fullName}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    @{u.username} {u.department ? `· ${u.department}` : ''}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
};

export default UserFollowListModal;
