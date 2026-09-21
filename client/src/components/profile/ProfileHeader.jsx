import React, { useState } from 'react';
import {
  MapPin,
  GraduationCap,
  Globe,
  Calendar,
  UserPlus,
  UserCheck,
  Edit3,
  MessageSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { followService } from '../../services/followService';
import { messageService } from '../../services/messageService';
import { useSocket } from '../../hooks/useSocket';
import { useToast } from '../../hooks/useToast';
import Avatar from '../common/Avatar';
import Button from '../common/Button';

export const ProfileHeader = ({
  user,
  isSelf,
  initialFollowing = false,
  onOpenEdit,
  onOpenFollowers,
  onOpenFollowing
}) => {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [followersCount, setFollowersCount] = useState(user?.followersCount || 0);
  const [isTogglingFollow, setIsTogglingFollow] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(false);

  const { isUserOnline } = useSocket();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleFollowToggle = async () => {
    setIsTogglingFollow(true);
    const nextState = !isFollowing;
    setIsFollowing(nextState);
    setFollowersCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    try {
      if (isFollowing) {
        await followService.unfollowUser(user._id);
        showToast(`Unfollowed @${user.username}`, 'info');
      } else {
        await followService.followUser(user._id);
        showToast(`Following @${user.username}!`, 'success');
      }
    } catch (err) {
      // Revert
      setIsFollowing(isFollowing);
      setFollowersCount(user?.followersCount || 0);
      showToast(err.response?.data?.message || 'Failed to update follow status', 'error');
    } finally {
      setIsTogglingFollow(false);
    }
  };

  const handleStartMessage = async () => {
    setIsStartingChat(true);
    try {
      const res = await messageService.startConversation(user._id);
      if (res.success && res.data) {
        navigate(`/messages/${res.data._id}`);
      }
    } catch (err) {
      showToast('Failed to start conversation', 'error');
    } finally {
      setIsStartingChat(false);
    }
  };

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : 'Recently';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden mb-6">
      {/* Cover Image Banner */}
      <div className="h-44 sm:h-56 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-800 relative">
        {user?.coverImage && (
          <img
            src={user.coverImage}
            alt="Profile cover banner"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Profile Info Container */}
      <div className="p-5 sm:p-6 pt-0 relative">
        {/* Avatar & Action Button Row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-4">
          <Avatar
            src={user?.profileImage}
            name={user?.fullName || 'User'}
            size="2xl"
            isOnline={isUserOnline(user?._id)}
            className="ring-4 ring-white dark:ring-slate-900 rounded-full shadow-lg"
          />

          <div className="flex items-center gap-2.5">
            {isSelf ? (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenEdit}
                icon={Edit3}
                className="shadow-2xs"
              >
                Edit Profile
              </Button>
            ) : (
              <>
                <Button
                  variant={isFollowing ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={handleFollowToggle}
                  isLoading={isTogglingFollow}
                  icon={isFollowing ? UserCheck : UserPlus}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStartMessage}
                  isLoading={isStartingChat}
                  icon={MessageSquare}
                  title="Direct Message"
                >
                  Message
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Name & Academic Department */}
        <div className="space-y-1 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {user?.fullName}
            </h2>
            {user?.department && (
              <span className="text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-200/60 dark:border-indigo-800/40">
                {user.department}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            @{user?.username}
          </p>
        </div>

        {/* Bio */}
        {user?.bio && (
          <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed mb-4 max-w-2xl">
            {user.bio}
          </p>
        )}

        {/* Metadata Details Row */}
        <div className="flex items-center gap-4 sm:gap-6 flex-wrap text-xs text-slate-500 dark:text-slate-400 mb-5">
          {user?.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{user.location}</span>
            </div>
          )}
          {user?.website && (
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-indigo-500" />
              <a
                href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium truncate max-w-xs"
              >
                {user.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Joined {joinDate}</span>
          </div>
        </div>

        {/* Followers / Following Counters */}
        <div className="flex items-center gap-6 border-t border-slate-100 dark:border-slate-800 pt-4 text-sm">
          <button
            onClick={onOpenFollowers}
            className="hover:underline text-left group"
          >
            <span className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 transition">
              {followersCount}
            </span>{' '}
            <span className="text-slate-500 dark:text-slate-400">Followers</span>
          </button>

          <button
            onClick={onOpenFollowing}
            className="hover:underline text-left group"
          >
            <span className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 transition">
              {user?.followingCount || 0}
            </span>{' '}
            <span className="text-slate-500 dark:text-slate-400">Following</span>
          </button>

          <div className="text-left">
            <span className="font-bold text-slate-900 dark:text-slate-100">
              {user?.postsCount || 0}
            </span>{' '}
            <span className="text-slate-500 dark:text-slate-400">Posts</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
