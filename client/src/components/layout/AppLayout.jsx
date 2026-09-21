import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';
import MobileNav from './MobileNav';
import Header from './Header';
import Modal from '../common/Modal';
import PostComposer from '../post/PostComposer';

export const AppLayout = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handlePostCreated = () => {
    setIsCreateModalOpen(false);
    // Dispatched so feed page knows to prepend new post
    window.dispatchEvent(new Event('post:created'));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex justify-center">
      <div className="w-full max-w-7xl flex relative">
        {/* Left Navigation Sidebar */}
        <Sidebar onOpenCreatePost={() => setIsCreateModalOpen(true)} />

        {/* Center Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-slate-200/80 dark:border-slate-800">
          <Header />
          <main className="flex-1 pb-20 md:pb-6">
            <Outlet />
          </main>
          <MobileNav onOpenCreatePost={() => setIsCreateModalOpen(true)} />
        </div>

        {/* Right Widget Sidebar */}
        <RightSidebar />
      </div>

      {/* Quick Create Post Modal (Available globally across all pages) */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Campus Post"
      >
        <PostComposer onPostCreated={handlePostCreated} isModal={true} />
      </Modal>
    </div>
  );
};

export default AppLayout;
