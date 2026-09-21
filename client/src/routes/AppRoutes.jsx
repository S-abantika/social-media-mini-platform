import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout & Route Guards
import AppLayout from '../components/layout/AppLayout';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';

// Public Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';

// Authenticated Pages
import HomePage from '../pages/home/HomePage';
import ExplorePage from '../pages/explore/ExplorePage';
import ProfilePage from '../pages/profile/ProfilePage';
import MessagesPage from '../pages/messages/MessagesPage';
import NotificationsPage from '../pages/notifications/NotificationsPage';
import SavedPostsPage from '../pages/saved/SavedPostsPage';
import SettingsPage from '../pages/settings/SettingsPage';
import PostDetailPage from '../pages/post/PostDetailPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Protected Application Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/posts/:id" element={<PostDetailPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/saved" element={<SavedPostsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />

          {/* Admin Protected Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<AdminDashboardPage />} />
          </Route>
        </Route>

        {/* Messages Layout (has custom full-height container within layout) */}
        <Route element={<AppLayout />}>
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/messages/:conversationId" element={<MessagesPage />} />
        </Route>
      </Route>

      {/* Fallback Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
