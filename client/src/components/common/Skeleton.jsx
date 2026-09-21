import React from 'react';

export const PostSkeleton = () => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm animate-pulse space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800" />
        <div className="space-y-1.5 flex-1">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
          <div className="h-3 bg-slate-100 dark:bg-slate-850 rounded w-1/4" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-full" />
        <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
        <div className="h-3.5 bg-slate-100 dark:bg-slate-850 rounded w-2/3" />
      </div>
      <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
      <div className="flex justify-between pt-2">
        <div className="h-4 bg-slate-100 dark:bg-slate-850 rounded w-16" />
        <div className="h-4 bg-slate-100 dark:bg-slate-850 rounded w-16" />
        <div className="h-4 bg-slate-100 dark:bg-slate-850 rounded w-16" />
      </div>
    </div>
  );
};

export const ProfileSkeleton = () => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm animate-pulse">
      <div className="h-44 bg-slate-200 dark:bg-slate-800 w-full" />
      <div className="p-6 pt-0 relative">
        <div className="flex justify-between items-end -mt-12 mb-4">
          <div className="w-24 h-24 rounded-full bg-slate-300 dark:bg-slate-700 ring-4 ring-white dark:ring-slate-900" />
          <div className="h-9 w-28 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
        <div className="space-y-2 mb-4">
          <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
          <div className="h-3.5 bg-slate-100 dark:bg-slate-850 rounded w-1/6" />
        </div>
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-2" />
        <div className="h-3 bg-slate-100 dark:bg-slate-850 rounded w-1/2 mb-6" />
        <div className="flex gap-6 border-t border-slate-100 dark:border-slate-800 pt-4">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20" />
        </div>
      </div>
    </div>
  );
};

export const ConversationSkeleton = () => {
  return (
    <div className="flex items-center gap-3 p-3.5 rounded-xl animate-pulse">
      <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex justify-between">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-28" />
          <div className="h-3 bg-slate-100 dark:bg-slate-850 rounded w-10" />
        </div>
        <div className="h-3 bg-slate-100 dark:bg-slate-850 rounded w-3/4" />
      </div>
    </div>
  );
};

export const UserCardSkeleton = () => {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 animate-pulse">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800" />
        <div className="space-y-1">
          <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-24" />
          <div className="h-2.5 bg-slate-100 dark:bg-slate-850 rounded w-16" />
        </div>
      </div>
      <div className="h-7 w-16 bg-slate-200 dark:bg-slate-800 rounded-lg" />
    </div>
  );
};
