import React from 'react';
import { Check, CheckCheck } from 'lucide-react';

export const MessageBubble = ({ message, isMe }) => {
  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} mb-3`}>
      <div
        className={`max-w-[75%] sm:max-w-[65%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-2xs ${
          isMe
            ? 'bg-indigo-600 text-white rounded-br-xs'
            : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200/60 dark:border-slate-700/60 rounded-bl-xs'
        }`}
      >
        <p className="whitespace-pre-line break-words">{message.content}</p>
      </div>

      {/* Timestamp & Read Receipts */}
      <div className="flex items-center gap-1 mt-1 px-1">
        <span className="text-[10px] text-slate-400 font-mono">
          {formatTime(message.createdAt)}
        </span>
        {isMe && (
          <span title={message.isRead ? 'Read' : 'Delivered'}>
            {message.isRead ? (
              <CheckCheck className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            ) : (
              <Check className="w-3.5 h-3.5 text-slate-400" />
            )}
          </span>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
