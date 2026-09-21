import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Hash, Users, Sparkles, X, Check } from 'lucide-react';
import { postService } from '../../services/postService';
import { userService } from '../../services/userService';
import { followService } from '../../services/followService';
import { useDebounce } from '../../hooks/useDebounce';
import { useSocket } from '../../hooks/useSocket';
import { useToast } from '../../hooks/useToast';
import PostCard from '../../components/post/PostCard';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import { PostSkeleton, UserCardSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';

const POPULAR_TAGS = [
  'all',
  'hackathon',
  'uxdesign',
  'robotics',
  'machinelearning',
  'campuslife',
  'bioinformatics',
  'cybersecurity',
  'announcement'
];

export const ExplorePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTag = searchParams.get('tag') || 'all';
  const initialSearch = searchParams.get('search') || '';

  const [searchInput, setSearchInput] = useState(initialSearch);
  const debouncedSearch = useDebounce(searchInput, 400);

  const [activeTag, setActiveTag] = useState(initialTag);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'people'

  const [posts, setPosts] = useState([]);
  const [people, setPeople] = useState([]);
  const [followingMap, setFollowingMap] = useState({});

  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingPeople, setLoadingPeople] = useState(false);

  const { isUserOnline } = useSocket();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Synchronize URL parameters
  useEffect(() => {
    const params = {};
    if (activeTag && activeTag !== 'all') params.tag = activeTag;
    if (debouncedSearch) params.search = debouncedSearch;
    setSearchParams(params, { replace: true });
  }, [activeTag, debouncedSearch, setSearchParams]);

  // Fetch posts based on tag or search
  useEffect(() => {
    const fetchPosts = async () => {
      setLoadingPosts(true);
      try {
        const res = await postService.getExplore({
          tag: activeTag === 'all' ? '' : activeTag,
          search: debouncedSearch
        });
        if (res.success && res.data) {
          setPosts(res.data);
        }
      } catch (err) {
        showToast('Failed to load explore posts', 'error');
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchPosts();
  }, [activeTag, debouncedSearch, showToast]);

  // Fetch users if searching
  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setPeople([]);
      return;
    }

    const fetchUsers = async () => {
      setLoadingPeople(true);
      try {
        const res = await userService.searchUsers(debouncedSearch);
        if (res.success && res.data) {
          setPeople(res.data);
        }
      } catch (err) {
        console.error('Failed to search users:', err);
      } finally {
        setLoadingPeople(false);
      }
    };

    fetchUsers();
  }, [debouncedSearch]);

  const handleFollowToggle = async (userId) => {
    const isCurrentlyFollowing = followingMap[userId];
    setFollowingMap((prev) => ({ ...prev, [userId]: !isCurrentlyFollowing }));

    try {
      if (isCurrentlyFollowing) {
        await followService.unfollowUser(userId);
        showToast('Unfollowed user', 'info');
      } else {
        await followService.followUser(userId);
        showToast('Now following!', 'success');
      }
    } catch (err) {
      setFollowingMap((prev) => ({ ...prev, [userId]: isCurrentlyFollowing }));
      showToast(err.response?.data?.message || 'Failed to update follow', 'error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-3 sm:p-5 space-y-5">
      {/* Search Header Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search posts, topics, project tags, or classmates..."
            className="w-full bg-slate-100 dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 pl-10 pr-9 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tag Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {POPULAR_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                activeTag === tag
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {tag === 'all' ? 'All Topics' : `#${tag}`}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs if searching: Posts vs People */}
      {debouncedSearch && (
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold border-b-2 transition ${
              activeTab === 'posts'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Hash className="w-4 h-4" />
            <span>Posts ({posts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('people')}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold border-b-2 transition ${
              activeTab === 'people'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Students ({people.length})</span>
          </button>
        </div>
      )}

      {/* Content Area */}
      {activeTab === 'people' && debouncedSearch ? (
        <div className="space-y-3">
          {loadingPeople ? (
            <div className="space-y-2">
              <UserCardSkeleton />
              <UserCardSkeleton />
            </div>
          ) : people.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No classmates found"
              description={`We couldn't find any students matching "${debouncedSearch}".`}
            />
          ) : (
            people.map((u) => {
              const isFollowing = followingMap[u._id];
              return (
                <div
                  key={u._id}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center justify-between gap-3"
                >
                  <div
                    onClick={() => navigate(`/profile/${u.username}`)}
                    className="flex items-center gap-3 min-w-0 cursor-pointer"
                  >
                    <Avatar
                      src={u.profileImage}
                      name={u.fullName}
                      size="lg"
                      isOnline={isUserOnline(u._id)}
                    />
                    <div className="truncate">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate hover:text-indigo-600">
                        {u.fullName}
                      </h4>
                      <p className="text-xs text-slate-400">@{u.username}</p>
                      {u.department && (
                        <span className="text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md mt-1 inline-block">
                          {u.department}
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={isFollowing ? 'secondary' : 'primary'}
                    onClick={() => handleFollowToggle(u._id)}
                  >
                    {isFollowing ? (
                      <span className="flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Following
                      </span>
                    ) : (
                      'Follow'
                    )}
                  </Button>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {loadingPosts ? (
            <div className="space-y-4">
              <PostSkeleton />
              <PostSkeleton />
            </div>
          ) : posts.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="No posts found"
              description={
                debouncedSearch
                  ? `No posts matched your search for "${debouncedSearch}".`
                  : `No posts found under #${activeTag}. Be the first to start a conversation!`
              }
            />
          ) : (
            posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onPostDeleted={(id) => setPosts((prev) => prev.filter((p) => p._id !== id))}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ExplorePage;
