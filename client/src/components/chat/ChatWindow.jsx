import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, Info, MoreVertical, Sparkles } from 'lucide-react';
import { messageService } from '../../services/messageService';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import { useToast } from '../../hooks/useToast';
import Avatar from '../common/Avatar';
import MessageBubble from './MessageBubble';
import Button from '../common/Button';

export const ChatWindow = ({
  conversation,
  conversationId,
  onBack,
  onToggleInfo
}) => {
  const { user } = useAuth();
  const { socket, isUserOnline } = useSocket();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isOtherTyping, setIsOtherTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Identify the other participant
  const otherUser =
    conversation?.participants?.find(
      (p) => p._id.toString() !== user?._id.toString()
    ) || {};

  const isOtherOnline = isUserOnline(otherUser._id);

  // Scroll to bottom
  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Fetch message history on conversation change
  useEffect(() => {
    if (!conversationId) return;

    let isMounted = true;
    setLoading(true);

    const fetchMessages = async () => {
      try {
        const res = await messageService.getMessages(conversationId);
        if (isMounted && res.success && res.data) {
          setMessages(res.data);
          setTimeout(() => scrollToBottom('auto'), 50);
        }
      } catch (err) {
        if (isMounted) {
          showToast('Failed to load message history', 'error');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMessages();

    // Socket: Join conversation room
    if (socket) {
      socket.emit('join_conversation', conversationId);

      // Tell the sender their messages are read
      socket.emit('message_read', {
        conversationId,
        senderId: otherUser._id
      });
    }

    return () => {
      isMounted = false;
      if (socket) {
        socket.emit('leave_conversation', conversationId);
      }
    };
  }, [conversationId, socket, otherUser._id, showToast]);

  // Socket event listeners for active chat
  useEffect(() => {
    if (!socket || !conversationId) return;

    const handleReceiveMessage = (newMessage) => {
      if (newMessage.conversation === conversationId) {
        setMessages((prev) => [...prev, newMessage]);
        setTimeout(() => scrollToBottom('smooth'), 50);

        // Mark as read immediately if chat window is open
        if (newMessage.sender?._id !== user?._id) {
          socket.emit('message_read', {
            conversationId,
            messageIds: [newMessage._id],
            senderId: newMessage.sender?._id
          });
        }
      }
    };

    const handleUserTyping = ({ conversationId: cId, userId }) => {
      if (cId === conversationId && userId !== user?._id) {
        setIsOtherTyping(true);
      }
    };

    const handleUserStopTyping = ({ conversationId: cId, userId }) => {
      if (cId === conversationId && userId !== user?._id) {
        setIsOtherTyping(false);
      }
    };

    const handleReadReceipt = ({ conversationId: cId, readAt }) => {
      if (cId === conversationId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.sender?._id === user?._id ? { ...msg, isRead: true, readAt } : msg
          )
        );
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stop_typing', handleUserStopTyping);
    socket.on('read_receipt', handleReadReceipt);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stop_typing', handleUserStopTyping);
      socket.off('read_receipt', handleReadReceipt);
    };
  }, [socket, conversationId, user?._id]);

  // Typing event emissions with debounce
  const handleInputChange = (e) => {
    setInputText(e.target.value);

    if (socket && conversationId) {
      socket.emit('typing', {
        conversationId,
        receiverId: otherUser._id,
        username: user?.username
      });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop_typing', {
          conversationId,
          receiverId: otherUser._id
        });
      }, 1500);
    }
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !conversationId) return;

    const content = inputText.trim();
    setInputText('');

    if (socket) {
      socket.emit('stop_typing', {
        conversationId,
        receiverId: otherUser._id
      });
    }

    // Try sending via Socket.IO first
    if (socket && socket.connected) {
      socket.emit(
        'send_message',
        {
          conversationId,
          receiverId: otherUser._id,
          content,
          messageType: 'text'
        },
        (response) => {
          if (!response?.success) {
            // Socket fallback to REST if failed
            sendMessageREST(content);
          }
        }
      );
    } else {
      // Direct REST fallback
      sendMessageREST(content);
    }
  };

  const sendMessageREST = async (content) => {
    try {
      const res = await messageService.sendMessage({
        conversationId,
        receiverId: otherUser._id,
        content,
        messageType: 'text'
      });
      if (res.success && res.data) {
        setMessages((prev) => [...prev, res.data]);
        setTimeout(() => scrollToBottom('smooth'), 50);
      }
    } catch (err) {
      showToast('Failed to send message', 'error');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/40">
      {/* Chat Header */}
      <div className="p-3.5 sm:p-4 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 -ml-1 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 md:hidden transition"
              aria-label="Back to conversations"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div
            onClick={() => navigate(`/profile/${otherUser.username}`)}
            className="cursor-pointer"
          >
            <Avatar
              src={otherUser.profileImage}
              name={otherUser.fullName}
              size="md"
              isOnline={isOtherOnline}
            />
          </div>

          <div
            onClick={() => navigate(`/profile/${otherUser.username}`)}
            className="cursor-pointer truncate"
          >
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate hover:text-indigo-600 transition">
              {otherUser.fullName || 'Campus Peer'}
            </h3>
            <p className="text-xs text-slate-400">
              {isOtherOnline ? (
                <span className="text-emerald-500 font-medium">Active now</span>
              ) : (
                `@${otherUser.username || 'user'}`
              )}
            </p>
          </div>
        </div>

        {onToggleInfo && (
          <button
            onClick={onToggleInfo}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            aria-label="User info"
          >
            <Info className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-1">
        {loading ? (
          <div className="flex items-center justify-center h-full text-xs text-slate-400">
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-400">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Start your campus discussion
            </p>
            <p className="text-xs text-slate-400 max-w-xs">
              Say hello, ask a study question, or coordinate on a project!
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender?._id === user?._id;
            return <MessageBubble key={msg._id} message={msg} isMe={isMe} />;
          })
        )}

        {/* Typing indicator */}
        {isOtherTyping && (
          <div className="flex items-center gap-2 text-xs text-slate-400 py-1 italic animate-pulse">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            <span>{otherUser.fullName?.split(' ')[0] || 'Peer'} is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Bar */}
      <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            placeholder={`Message ${otherUser.fullName?.split(' ')[0] || 'user'}...`}
            className="flex-1 bg-slate-100 dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
          />

          <Button
            type="submit"
            size="md"
            variant="primary"
            disabled={!inputText.trim()}
            icon={Send}
            className="px-4"
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
