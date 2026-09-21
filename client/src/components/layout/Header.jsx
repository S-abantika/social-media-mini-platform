import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Search, MessageSquare } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../common/Avatar';

export const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between px-4 py-3 md:hidden">
      <div
        onClick={() => navigate('/')}
        className="flex items-center gap-2 cursor-pointer"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-xs">
          <Sparkles className="w-4 h-4" />
        </div>
        <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
          Connectly
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/explore')}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition"
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </button>
        <button
          onClick={() => navigate('/messages')}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition"
          aria-label="Messages"
        >
          <MessageSquare className="w-5 h-5" />
        </button>
        <div onClick={() => navigate(`/profile/${user?.username}`)} className="cursor-pointer">
          <Avatar src={user?.profileImage} name={user?.fullName} size="xs" />
        </div>
      </div>
    </header>
  );
};

export default Header;
