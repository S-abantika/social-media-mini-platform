import React, { useState } from 'react';

const sizeMap = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
  '2xl': 'w-24 h-24 text-2xl'
};

const dotSizeMap = {
  xs: 'w-1.5 h-1.5 border',
  sm: 'w-2 h-2 border',
  md: 'w-2.5 h-2.5 border-2',
  lg: 'w-3 h-3 border-2',
  xl: 'w-3.5 h-3.5 border-2',
  '2xl': 'w-5 h-5 border-2'
};

export const Avatar = ({
  src,
  name = 'User',
  size = 'md',
  isOnline = false,
  className = ''
}) => {
  const [imageError, setImageError] = useState(false);

  // Format full server URL for local uploads if starts with /uploads
  const resolvedSrc = src && src.startsWith('/uploads')
    ? `${import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'}${src}`
    : src;

  // Generate 2 initials
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U';

  const sizeClasses = sizeMap[size] || sizeMap.md;
  const dotClasses = dotSizeMap[size] || dotSizeMap.md;

  return (
    <div className={`relative inline-block flex-shrink-0 ${className}`}>
      {resolvedSrc && !imageError ? (
        <img
          src={resolvedSrc}
          alt={name}
          onError={() => setImageError(true)}
          className={`${sizeClasses} rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 bg-slate-100 dark:bg-slate-800`}
        />
      ) : (
        <div
          className={`${sizeClasses} rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-semibold flex items-center justify-center shadow-sm select-none`}
        >
          {initials}
        </div>
      )}

      {isOnline && (
        <span
          className={`absolute bottom-0 right-0 ${dotClasses} rounded-full bg-emerald-500 border-white dark:border-slate-900 ring-1 ring-emerald-400/20`}
          title="Online"
        />
      )}
    </div>
  );
};

export default Avatar;
