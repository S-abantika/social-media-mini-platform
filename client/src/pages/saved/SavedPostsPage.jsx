import React, { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import { savedService } from '../../services/savedService';
import { useToast } from '../../hooks/useToast';
import PostCard from '../../components/post/PostCard';
import { PostSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';

export const SavedPostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const res = await savedService.getSavedPosts();
        if (res.success && res.data) {
          setPosts(res.data);
        }
      } catch (err) {
        showToast('Failed to load saved posts', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchSaved();
  }, [showToast]);

  return (
    <div className="max-w-2xl mx-auto p-3 sm:p-5 space-y-5">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Saved Posts
        </h2>
        <p className="text-xs text-slate-400">
          Articles, research discussions, and campus events bookmarked for reference
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <PostSkeleton />
          <PostSkeleton />
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved posts"
          description="Click the bookmark icon on any post in your feed to save it here for later reading."
        />
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onPostDeleted={(id) => setPosts((prev) => prev.filter((p) => p._id !== id))}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedPostsPage;
