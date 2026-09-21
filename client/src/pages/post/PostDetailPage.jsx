import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { postService } from '../../services/postService';
import { useToast } from '../../hooks/useToast';
import PostCard from '../../components/post/PostCard';
import { PostSkeleton } from '../../components/common/Skeleton';

export const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await postService.getPostById(id);
        if (res.success && res.data) {
          setPost(res.data);
        }
      } catch (err) {
        showToast('Post not found or has been deleted', 'error');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, navigate, showToast]);

  return (
    <div className="max-w-2xl mx-auto p-3 sm:p-5 space-y-4">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Campus Feed</span>
      </button>

      {loading ? (
        <PostSkeleton />
      ) : post ? (
        <PostCard
          post={post}
          onPostDeleted={() => navigate('/')}
          onPostUpdated={(updated) => setPost(updated)}
        />
      ) : null}
    </div>
  );
};

export default PostDetailPage;
