import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useUIStore } from '../../store/uiStore';
import GlobalAIAssistant from '../ai/GlobalAIAssistant';

interface AppShellProps {
  children: React.ReactNode;
}

const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { isSidebarOpen } = useUIStore();

  return (
    <div className="flex bg-surface min-h-screen overflow-hidden">
      <Sidebar />
      
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'ml-0'} overflow-y-auto`}>
        <TopBar />
        <div className="px-container-margin py-8 max-w-[1280px] mx-auto pb-24 md:pb-8">
          {children}
        </div>
      </main>
      
      {/* Global Floating AI Widget */}
      <GlobalAIAssistant />
    </div>
  );
};

export default AppShell;
