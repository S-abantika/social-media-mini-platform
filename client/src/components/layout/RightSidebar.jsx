import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingUp, Users, ArrowRight, Check } from 'lucide-react';
import { userService } from '../../services/userService';
import { followService } from '../../services/followService';
import { useSocket } from '../../hooks/useSocket';
import { useToast } from '../../hooks/useToast';
import Avatar from '../common/Avatar';
import Button from '../common/Button';

export const RightSidebar = () => {
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [followingMap, setFollowingMap] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingSuggested, setLoadingSuggested] = useState(true);

  const { isUserOnline } = useSocket();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSuggested = async () => {
      try {
        const res = await userService.getSuggestedUsers();
        if (res.success && res.data) {
          setSuggestedUsers(res.data);
        }
      } catch (error) {
        console.error('Failed to load suggested users:', error);
      } finally {
        setLoadingSuggested(false);
      }
    };

    fetchSuggested();
  }, []);

  const handleFollowToggle = async (userId) => {
    const isCurrentlyFollowing = followingMap[userId];

    // Optimistic toggle
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
      // Revert on error
      setFollowingMap((prev) => ({ ...prev, [userId]: isCurrentlyFollowing }));
      showToast(err.response?.data?.message || 'Failed to update follow status', 'error');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const trendingTopics = [
    { tag: 'hackathon', count: '48 posts', desc: 'Campus Sprint 2026' },
    { tag: 'uxdesign', count: '32 posts', desc: 'Design System Guild' },
    { tag: 'robotics', count: '29 posts', desc: 'Autonomous Quadrupeds' },
    { tag: 'machinelearning', count: '25 posts', desc: 'Graph Neural Networks' },
    { tag: 'campuslife', count: '21 posts', desc: 'Library Study Lounges' }
  ];

  return (
    <aside className="sticky top-0 h-screen w-80 flex-col gap-5 p-4 border-l border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md overflow-y-auto hidden xl:flex">
      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search campus & peers..."
          className="w-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm pl-9 pr-4 py-2 rounded-xl outline-none border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition shadow-2xs"
        />
      </form>

      {/* Suggested Peers Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold text-sm">
            <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Suggested Peers</span>
          </div>
          <button
            onClick={() => navigate('/explore')}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            See all
          </button>
        </div>

        <div className="space-y-2.5">
          {loadingSuggested ? (
            <div className="text-xs text-slate-400 py-2 text-center">Loading peers...</div>
          ) : suggestedUsers.length === 0 ? (
            <div className="text-xs text-slate-400 py-2 text-center">No suggestions right now.</div>
          ) : (
            suggestedUsers.map((u) => {
              const isFollowing = followingMap[u._id];
              return (
                <div
                  key={u._id}
                  className="flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                >
                  <div
                    onClick={() => navigate(`/profile/${u.username}`)}
                    className="flex items-center gap-2.5 min-w-0 cursor-pointer"
                  >
                    <Avatar
                      src={u.profileImage}
                      name={u.fullName}
                      size="sm"
                      isOnline={isUserOnline(u._id)}
                    />
                    <div className="truncate">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate hover:text-indigo-600 transition">
                        {u.fullName}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {u.department || `@${u.username}`}
                      </p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={isFollowing ? 'secondary' : 'primary'}
                    onClick={() => handleFollowToggle(u._id)}
                    className="text-xs py-1 px-2.5 h-7"
                  >
                    {isFollowing ? (
                      <span className="flex items-center gap-1">
                        <Check className="w-3 h-3" /> Following
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
      </div>

      {/* Trending Topics Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold text-sm">
          <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Campus Trending</span>
        </div>

        <div className="space-y-2.5">
          {trendingTopics.map((topic) => (
            <div
              key={topic.tag}
              onClick={() => navigate(`/explore?tag=${topic.tag}`)}
              className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition"
            >
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  #{topic.tag}
                </p>
                <p className="text-[11px] text-slate-400">{topic.desc}</p>
              </div>
              <span className="text-[11px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                {topic.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Academic Disclaimer / Footer */}
      <div className="px-2 text-[11px] text-slate-400 leading-relaxed">
        <p>© 2026 Connectly Campus Network. Designed for collaborative university social learning.</p>
      </div>
    </aside>
  );
};

export default RightSidebar;
