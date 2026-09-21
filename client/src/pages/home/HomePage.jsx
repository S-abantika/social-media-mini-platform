import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, Compass, Users, RefreshCw } from 'lucide-react';
import { postService } from '../../services/postService';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import PostComposer from '../../components/post/PostComposer';
import PostCard from '../../components/post/PostCard';
import { PostSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';

export const HomePage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'explore'

  const fetchFeedPosts = useCallback(async (targetPage = 1, append = false) => {
    if (targetPage === 1 && !append) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const res =
        activeTab === 'feed'
          ? await postService.getFeed(targetPage)
          : await postService.getExplore({ page: targetPage });

      if (res.success && res.data) {
        if (append) {
          setPosts((prev) => [...prev, ...res.data]);
        } else {
          setPosts(res.data);
        }
        setHasNextPage(res.pagination?.hasNextPage || false);
        setPage(targetPage);
      }
    } catch (err) {
      console.error('Failed to load feed:', err);
      showToast('Could not load feed posts', 'error');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [activeTab, showToast]);

  useEffect(() => {
    fetchFeedPosts(1, false);

    // Listen to global post:created event (e.g. from mobile modal)
    const handleGlobalPostCreated = () => {
      fetchFeedPosts(1, false);
    };

    window.addEventListener('post:created', handleGlobalPostCreated);
    return () => {
      window.removeEventListener('post:created', handleGlobalPostCreated);
    };
  }, [fetchFeedPosts]);

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDeleted = (postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  const handlePostUpdated = (updatedPost) => {
    setPosts((prev) =>
      prev.map((p) => (p._id === updatedPost._id ? updatedPost : p))
    );
  };

  const handleLoadMore = () => {
    if (hasNextPage && !loadingMore) {
      fetchFeedPosts(page + 1, true);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-3 sm:p-5">
      {/* Feed Tabs Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl p-1.5 border border-slate-200/80 dark:border-slate-800 shadow-2xs mb-5 flex items-center justify-between">
        <div className="flex items-center gap-1 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              activeTab === 'feed'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Campus Feed</span>
          </button>

          <button
            onClick={() => setActiveTab('explore')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              activeTab === 'explore'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Discover All</span>
          </button>
        </div>

        <button
          onClick={() => fetchFeedPosts(1, false)}
          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition hidden sm:flex items-center gap-1 text-xs"
          title="Refresh feed"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Post Composer */}
      <PostComposer onPostCreated={handlePostCreated} />

      {/* Posts Stream */}
      {loading ? (
        <div className="space-y-4">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={Users}
          title={activeTab === 'feed' ? 'Your feed is quiet' : 'No posts found'}
          description={
            activeTab === 'feed'
              ? 'Follow classmates or switch to the Discover All tab to see what other departments are sharing.'
              : 'Be the first student to publish a post on Connectly!'
          }
          actionLabel={activeTab === 'feed' ? 'Explore Campus Posts' : undefined}
          onAction={activeTab === 'feed' ? () => setActiveTab('explore') : undefined}
        />
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onPostDeleted={handlePostDeleted}
              onPostUpdated={handlePostUpdated}
            />
          ))}

          {/* Load More Button */}
          {hasNextPage && (
            <div className="text-center pt-2 pb-6">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleLoadMore}
                isLoading={loadingMore}
              >
                Load More Posts
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HomePage;
