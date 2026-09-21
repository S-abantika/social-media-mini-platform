import React, { useState, useEffect } from 'react';
import {
  Users,
  FileText,
  MessageCircle,
  MessageSquare,
  Activity,
  Trash2,
  Search,
  ShieldCheck
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../hooks/useToast';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [popularPosts, setPopularPosts] = useState([]);
  const [searchUser, setSearchUser] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingPostId, setDeletingPostId] = useState(null);

  const { showToast } = useToast();

  const fetchAdminData = async () => {
    try {
      const statsRes = await adminService.getStats();
      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data.stats);
        setPopularPosts(statsRes.data.popularPosts || []);
      }

      const usersRes = await adminService.getUsers(1, searchUser);
      if (usersRes.success && usersRes.data) {
        setUsers(usersRes.data);
      }
    } catch (err) {
      showToast('Failed to load admin analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [searchUser]);

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to moderate and delete this post?')) return;

    setDeletingPostId(postId);
    try {
      await adminService.deletePost(postId);
      setPopularPosts((prev) => prev.filter((p) => p._id !== postId));
      showToast('Post removed successfully by admin', 'success');
    } catch (err) {
      showToast('Failed to delete post', 'error');
    } finally {
      setDeletingPostId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 text-center text-xs text-slate-400">
        Loading campus administration metrics...
      </div>
    );
  }

  const statCards = [
    { label: 'Total Students', value: stats?.totalUsers || 0, icon: Users, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40' },
    { label: 'Campus Posts', value: stats?.totalPosts || 0, icon: FileText, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40' },
    { label: 'Discussions', value: stats?.totalComments || 0, icon: MessageCircle, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' },
    { label: 'Conversations', value: stats?.totalConversations || 0, icon: MessageSquare, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40' },
    { label: 'Active Online', value: stats?.activeUsers || 0, icon: Activity, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40' }
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Campus Administration Hub
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Platform metrics, student directory, and moderation tools
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 rounded-full border border-indigo-200/60 dark:border-indigo-800/40">
          Faculty Access
        </span>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-2"
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  {card.value}
                </p>
                <p className="text-[11px] font-medium text-slate-400">{card.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* User Directory Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Registered Student Directory ({users.length})
          </h3>
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              placeholder="Search by student name..."
              className="w-full bg-slate-100 dark:bg-slate-800 text-xs pl-8 pr-3 py-1.5 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                <th className="pb-2.5 font-semibold">User</th>
                <th className="pb-2.5 font-semibold">Department</th>
                <th className="pb-2.5 font-semibold">Followers</th>
                <th className="pb-2.5 font-semibold">Posts</th>
                <th className="pb-2.5 font-semibold">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 pr-2">
                    <div className="flex items-center gap-2">
                      <Avatar src={u.profileImage} name={u.fullName} size="xs" isOnline={u.isOnline} />
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{u.fullName}</p>
                        <p className="text-[11px] text-slate-400">@{u.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 text-slate-600 dark:text-slate-300">{u.department || 'General'}</td>
                  <td className="py-2.5 text-slate-600 dark:text-slate-300">{u.followersCount || 0}</td>
                  <td className="py-2.5 text-slate-600 dark:text-slate-300">{u.postsCount || 0}</td>
                  <td className="py-2.5">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        u.role === 'admin'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Moderation: High Engagement Posts */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Campus Content Moderation (Top Engaged Posts)
        </h3>

        <div className="space-y-3">
          {popularPosts.map((post) => (
            <div
              key={post._id}
              className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Avatar src={post.author?.profileImage} name={post.author?.fullName} size="xs" />
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {post.author?.fullName} (@{post.author?.username})
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2">
                  {post.content}
                </p>
                <div className="flex gap-3 text-[11px] text-slate-400">
                  <span>❤️ {post.likesCount || 0} likes</span>
                  <span>💬 {post.commentsCount || 0} comments</span>
                </div>
              </div>

              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDeletePost(post._id)}
                isLoading={deletingPostId === post._id}
                icon={Trash2}
                className="py-1 px-2.5 text-xs"
              >
                Moderate
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
