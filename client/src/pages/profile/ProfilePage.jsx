import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import { postService } from '../../services/postService';
import { savedService } from '../../services/savedService';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import ProfileHeader from '../../components/profile/ProfileHeader';
import EditProfileModal from '../../components/profile/EditProfileModal';
import UserFollowListModal from '../../components/profile/UserFollowListModal';
import PostCard from '../../components/post/PostCard';
import { ProfileSkeleton, PostSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import { Grid, Bookmark, Image as ImageIcon } from 'lucide-react';

export const ProfilePage = () => {
  const { username: paramUsername } = useParams();
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // If no username in params, default to current user's username
  const targetUsername = paramUsername || currentUser?.username;

  const [profileData, setProfileData] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isSelf, setIsSelf] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Tabs: 'posts' | 'media' | 'saved'
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [followModal, setFollowModal] = useState({ isOpen: false, type: 'followers', title: '' });

  useEffect(() => {
    if (!targetUsername) return;

    const fetchProfile = async () => {
      setLoadingProfile(true);
      try {
        const res = await userService.getProfile(targetUsername);
        if (res.success && res.data) {
          setProfileData(res.data.user);
          setIsFollowing(res.data.isFollowing);
          setIsSelf(res.data.isSelf);
        }
      } catch (err) {
        showToast('User profile not found', 'error');
        navigate('/');
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [targetUsername, navigate, showToast]);

  // Fetch posts for profile tab
  useEffect(() => {
    if (!targetUsername) return;

    const fetchTabContent = async () => {
      setLoadingPosts(true);
      try {
        if (activeTab === 'saved') {
          const res = await savedService.getSavedPosts();
          if (res.success && res.data) {
            setSavedPosts(res.data);
          }
        } else {
          const res = await postService.getUserPosts(targetUsername);
          if (res.success && res.data) {
            setPosts(res.data);
          }
        }
      } catch (err) {
        console.error('Failed to load profile posts:', err);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchTabContent();
  }, [targetUsername, activeTab]);

  const displayedPosts =
    activeTab === 'saved'
      ? savedPosts
      : activeTab === 'media'
      ? posts.filter((p) => !!p.image)
      : posts;

  if (loadingProfile) {
    return (
      <div className="max-w-2xl mx-auto p-3 sm:p-5 space-y-5">
        <ProfileSkeleton />
        <PostSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-3 sm:p-5">
      <ProfileHeader
        user={profileData}
        isSelf={isSelf}
        initialFollowing={isFollowing}
        onOpenEdit={() => setIsEditModalOpen(true)}
        onOpenFollowers={() =>
          setFollowModal({
            isOpen: true,
            type: 'followers',
            title: `${profileData.fullName}'s Followers`
          })
        }
        onOpenFollowing={() =>
          setFollowModal({
            isOpen: true,
            type: 'following',
            title: `Users followed by ${profileData.fullName}`
          })
        }
      />

      {/* Profile Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-5">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'posts'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Posts ({posts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('media')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition ${
            activeTab === 'media'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Media</span>
        </button>

        {isSelf && (
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition ${
              activeTab === 'saved'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Saved</span>
          </button>
        )}
      </div>

      {/* Tab Posts Stream */}
      {loadingPosts ? (
        <div className="space-y-4">
          <PostSkeleton />
          <PostSkeleton />
        </div>
      ) : displayedPosts.length === 0 ? (
        <EmptyState
          title={
            activeTab === 'media'
              ? 'No media shared yet'
              : activeTab === 'saved'
              ? 'No saved posts'
              : 'No posts yet'
          }
          description={
            activeTab === 'saved'
              ? 'Bookmark posts you find interesting to read later.'
              : `${profileData.fullName} hasn't published anything here yet.`
          }
        />
      ) : (
        <div className="space-y-4">
          {displayedPosts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onPostDeleted={(id) => setPosts((prev) => prev.filter((p) => p._id !== id))}
              onPostUpdated={(updated) =>
                setPosts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)))
              }
            />
          ))}
        </div>
      )}

      {/* Edit Profile Modal */}
      {isSelf && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={profileData}
          onProfileUpdated={(updated) => setProfileData(updated)}
        />
      )}

      {/* Followers / Following Modal */}
      <UserFollowListModal
        isOpen={followModal.isOpen}
        onClose={() => setFollowModal({ ...followModal, isOpen: false })}
        title={followModal.title}
        userId={profileData?._id}
        type={followModal.type}
      />
    </div>
  );
};

export default ProfilePage;
