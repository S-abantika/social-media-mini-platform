import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, PlusCircle, Bell, MessageSquare, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';

export const MobileNav = ({ onOpenCreatePost }) => {
  const { user } = useAuth();
  const { unreadNotifCount } = useSocket();

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Explore', path: '/explore', icon: Compass },
    {
      name: 'Create',
      isAction: true,
      onClick: onOpenCreatePost,
      icon: PlusCircle
    },
    {
      name: 'Alerts',
      path: '/notifications',
      icon: Bell,
      badge: unreadNotifCount > 0 ? unreadNotifCount : null
    },
    { name: 'Messages', path: '/messages', icon: MessageSquare },
    { name: 'Profile', path: `/profile/${user?.username || ''}`, icon: User }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex items-center justify-around py-2 px-1 md:hidden select-none">
      {navItems.map((item) => {
        const Icon = item.icon;

        if (item.isAction) {
          return (
            <button
              key={item.name}
              onClick={item.onClick}
              className="flex flex-col items-center justify-center text-indigo-600 dark:text-indigo-400 p-1 active:scale-95 transition"
              aria-label="Create Post"
            >
              <Icon className="w-6 h-6" />
              <span className="text-[10px] font-medium mt-0.5">{item.name}</span>
            </button>
          );
        }

        return (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center p-1 relative transition-colors ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`
            }
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {item.badge && (
                <span className="absolute -top-1 -right-2 w-4 h-4 text-[10px] font-bold bg-indigo-600 text-white rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5">{item.name}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default MobileNav;
