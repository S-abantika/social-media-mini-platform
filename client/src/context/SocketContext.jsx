import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { token, user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
      return;
    }

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('[Socket] Connected with ID:', newSocket.id);
    });

    newSocket.on('user_online', ({ userId }) => {
      setOnlineUsers((prev) => new Set([...prev, userId]));
    });

    newSocket.on('user_offline', ({ userId }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    newSocket.on('new_notification', (notification) => {
      setUnreadNotifCount((prev) => prev + 1);
      const senderName = notification.sender?.fullName || 'Someone';
      let message = `${senderName} interacted with your account.`;

      if (notification.type === 'like') {
        message = `${senderName} liked your post!`;
      } else if (notification.type === 'comment') {
        message = `${senderName} commented on your post.`;
      } else if (notification.type === 'follow') {
        message = `${senderName} started following you.`;
      }

      showToast(message, 'info');
    });

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, [isAuthenticated, token, showToast]);

  const isUserOnline = (userId) => {
    if (!userId) return false;
    return onlineUsers.has(userId.toString());
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        isUserOnline,
        unreadNotifCount,
        setUnreadNotifCount
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
