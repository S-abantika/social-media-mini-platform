import React, { useState } from 'react';
import { Search, MessageSquarePlus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import Avatar from '../common/Avatar';

export const ConversationList = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat
}) => {
  const { user } = useAuth();
  const { isUserOnline } = useSocket();
  const [filterQuery, setFilterQuery] = useState('');

  // Extract other participant
  const getOtherUser = (conv) => {
    return (
      conv.participants?.find((p) => p._id.toString() !== user?._id.toString()) || {}
    );
  };

  const filteredConversations = conversations.filter((conv) => {
    const other = getOtherUser(conv);
    const fullName = other.fullName?.toLowerCase() || '';
    const username = other.username?.toLowerCase() || '';
    const q = filterQuery.toLowerCase();
    return fullName.includes(q) || username.includes(q);
  });

  const formatLastTime = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours < 24) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800">
      {/* Header & New Chat Button */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Messages
        </h2>
        {onNewChat && (
          <button
            onClick={onNewChat}
            className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl transition"
            title="Start conversation"
            aria-label="Start conversation"
          >
            <MessageSquarePlus className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search Conversations */}
      <div className="p-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full bg-slate-100 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 pl-8 pr-3 py-2 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Conversations Scrollable List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800/40">
        {filteredConversations.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            {filterQuery ? 'No matching conversations.' : 'No conversations yet. Start a chat!'}
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const other = getOtherUser(conv);
            const isActive = activeConversationId === conv._id;
            const unreadCount = conv.unreadCounts?.[user?._id] || 0;

            return (
              <div
                key={conv._id}
                onClick={() => onSelectConversation(conv._id)}
                className={`flex items-center gap-3 p-3.5 cursor-pointer transition ${
                  isActive
                    ? 'bg-indigo-50/80 dark:bg-indigo-950/30'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Avatar
                  src={other.profileImage}
                  name={other.fullName}
                  size="md"
                  isOnline={isUserOnline(other._id)}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {other.fullName || 'Campus Peer'}
                    </h4>
                    <span className="text-[11px] text-slate-400 font-mono flex-shrink-0">
                      {formatLastTime(conv.lastMessage?.createdAt || conv.updatedAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate pr-2">
                      {conv.lastMessage?.content || 'Started a new conversation'}
                    </p>
                    {unreadCount > 0 && (
                      <span className="w-5 h-5 text-[10px] font-bold bg-indigo-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ConversationList;
