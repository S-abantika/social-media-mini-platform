import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { messageService } from '../../services/messageService';
import { userService } from '../../services/userService';
import { useSocket } from '../../hooks/useSocket';
import { useToast } from '../../hooks/useToast';
import ConversationList from '../../components/chat/ConversationList';
import ChatWindow from '../../components/chat/ChatWindow';
import ChatUserInfo from '../../components/chat/ChatUserInfo';
import Modal from '../../components/common/Modal';
import Avatar from '../../components/common/Avatar';
import { ConversationSkeleton } from '../../components/common/Skeleton';
import { MessageSquare } from 'lucide-react';

export const MessagesPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { socket, isUserOnline } = useSocket();
  const { showToast } = useToast();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUserInfo, setShowUserInfo] = useState(false);

  // New Chat modal state
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [suggestedPeers, setSuggestedPeers] = useState([]);
  const [loadingPeers, setLoadingPeers] = useState(false);

  // Fetch user conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await messageService.getConversations();
        if (res.success && res.data) {
          setConversations(res.data);
        }
      } catch (err) {
        showToast('Failed to load chats', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [showToast]);

  // Listen to socket conversation updates
  useEffect(() => {
    if (!socket) return;

    const handleConversationUpdated = ({ conversationId: cId, lastMessage }) => {
      setConversations((prev) => {
        const existing = prev.find((c) => c._id === cId);
        if (existing) {
          return prev.map((c) =>
            c._id === cId
              ? { ...c, lastMessage, updatedAt: new Date() }
              : c
          );
        }
        return prev;
      });
    };

    socket.on('conversation_updated', handleConversationUpdated);
    return () => {
      socket.off('conversation_updated', handleConversationUpdated);
    };
  }, [socket]);

  // Open New Chat Modal
  const handleOpenNewChat = async () => {
    setIsNewChatModalOpen(true);
    setLoadingPeers(true);
    try {
      const res = await userService.getSuggestedUsers();
      if (res.success && res.data) {
        setSuggestedPeers(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPeers(false);
    }
  };

  const handleStartChatWith = async (peerId) => {
    try {
      const res = await messageService.startConversation(peerId);
      if (res.success && res.data) {
        setIsNewChatModalOpen(false);
        // Prepend if not existing
        setConversations((prev) => {
          if (!prev.some((c) => c._id === res.data._id)) {
            return [res.data, ...prev];
          }
          return prev;
        });
        navigate(`/messages/${res.data._id}`);
      }
    } catch (err) {
      showToast('Could not start chat', 'error');
    }
  };

  const currentConversation = conversations.find((c) => c._id === conversationId);

  return (
    <div className="h-[calc(100vh-60px)] md:h-screen flex overflow-hidden bg-white dark:bg-slate-900">
      {/* Left Conversations List: Hidden on mobile if conversation is selected */}
      <div
        className={`w-full md:w-80 lg:w-96 flex-shrink-0 h-full ${
          conversationId ? 'hidden md:flex flex-col' : 'flex flex-col'
        }`}
      >
        {loading ? (
          <div className="p-4 space-y-2">
            <ConversationSkeleton />
            <ConversationSkeleton />
            <ConversationSkeleton />
          </div>
        ) : (
          <ConversationList
            conversations={conversations}
            activeConversationId={conversationId}
            onSelectConversation={(id) => navigate(`/messages/${id}`)}
            onNewChat={handleOpenNewChat}
          />
        )}
      </div>

      {/* Right / Center Chat Window: Shown on mobile when conversation selected */}
      <div
        className={`flex-1 h-full flex ${
          !conversationId ? 'hidden md:flex items-center justify-center' : 'flex'
        }`}
      >
        {conversationId && currentConversation ? (
          <div className="flex-1 flex h-full overflow-hidden">
            <div className="flex-1 h-full flex flex-col">
              <ChatWindow
                conversation={currentConversation}
                conversationId={conversationId}
                onBack={() => navigate('/messages')}
                onToggleInfo={() => setShowUserInfo(!showUserInfo)}
              />
            </div>

            {/* Desktop participant info side pane */}
            {showUserInfo && (
              <ChatUserInfo
                user={currentConversation.participants?.find((p) => p._id !== conversationId)}
                onClose={() => setShowUserInfo(false)}
              />
            )}
          </div>
        ) : (
          <div className="text-center p-8 text-slate-400">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
              Your Campus Messages
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mb-4">
              Select an existing discussion or click the compose button to connect with a peer.
            </p>
            <button
              onClick={handleOpenNewChat}
              className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl transition shadow-xs"
            >
              Start New Chat
            </button>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      <Modal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        title="Start a Campus Discussion"
        maxWidth="max-w-md"
      >
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {loadingPeers ? (
            <p className="text-xs text-slate-400 text-center py-4">Loading classmates...</p>
          ) : suggestedPeers.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">No suggestions available.</p>
          ) : (
            suggestedPeers.map((peer) => (
              <div
                key={peer._id}
                onClick={() => handleStartChatWith(peer._id)}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-slate-800/80 cursor-pointer transition"
              >
                <Avatar
                  src={peer.profileImage}
                  name={peer.fullName}
                  size="md"
                  isOnline={isUserOnline(peer._id)}
                />
                <div className="truncate">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {peer.fullName}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    @{peer.username} {peer.department ? `· ${peer.department}` : ''}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
};

export default MessagesPage;
