import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, GraduationCap, Globe, X } from 'lucide-react';
import Avatar from '../common/Avatar';
import Button from '../common/Button';

export const ChatUserInfo = ({ user, onClose }) => {
  const navigate = useNavigate();
  if (!user) return null;

  return (
    <div className="w-72 bg-white dark:bg-slate-900 border-l border-slate-200/80 dark:border-slate-800 p-5 flex flex-col justify-between hidden lg:flex">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Participant Info
          </h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex flex-col items-center text-center">
          <Avatar
            src={user.profileImage}
            name={user.fullName}
            size="xl"
            isOnline={user.isOnline}
            className="mb-3"
          />
          <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {user.fullName}
          </h4>
          <p className="text-xs text-slate-400 mb-1">@{user.username}</p>
          {user.department && (
            <span className="text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2.5 py-0.5 rounded-full mt-1">
              {user.department}
            </span>
          )}
        </div>

        {user.bio && (
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-center">
            {user.bio}
          </p>
        )}

        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
          {user.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{user.location}</span>
            </div>
          )}
          {user.website && (
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-500" />
              <a
                href={user.website}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 hover:underline truncate"
              >
                {user.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate(`/profile/${user.username}`)}
        icon={User}
        className="w-full"
      >
        View Full Profile
      </Button>
    </div>
  );
};

export default ChatUserInfo;
