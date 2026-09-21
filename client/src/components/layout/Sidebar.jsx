import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Compass,
  Bell,
  MessageSquare,
  Bookmark,
  User,
  Settings,
  ShieldAlert,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import Avatar from '../common/Avatar';

export const Sidebar = ({ onOpenCreatePost }) => {
  const { user, logout } = useAuth();
  const { unreadNotifCount } = useSocket();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Explore', path: '/explore', icon: Compass },
    {
      name: 'Notifications',
      path: '/notifications',
      icon: Bell,
      badge: unreadNotifCount > 0 ? unreadNotifCount : null
    },
    { name: 'Messages', path: '/messages', icon: MessageSquare },
    { name: 'Saved', path: '/saved', icon: Bookmark },
    { name: 'Profile', path: `/profile/${user?.username || ''}`, icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
    ...(user?.role === 'admin'
      ? [{ name: 'Admin Hub', path: '/admin', icon: ShieldAlert }]
      : [])
  ];

  return (
    <aside className="sticky top-0 h-screen w-64 flex flex-col justify-between p-4 border-r border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md select-none hidden md:flex">
      {/* Brand Header */}
      <div className="space-y-6">
        <div className="flex items-center gap-2.5 px-3 pt-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
              Connectly
            </h1>
            <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 tracking-wide uppercase">
              Campus Social
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/60'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-indigo-600 text-white rounded-full leading-tight">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer User Pill */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
        <div
          onClick={() => navigate(`/profile/${user?.username}`)}
          className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer transition"
        >
          <div className="flex items-center gap-3 min-w-0">
            <Avatar
              src={user?.profileImage}
              name={user?.fullName || 'User'}
              size="sm"
              isOnline={true}
            />
            <div className="truncate">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                {user?.fullName}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                @{user?.username}
              </p>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleLogout();
            }}
            title="Sign out"
            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
