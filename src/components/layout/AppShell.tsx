import React, { useState } from 'react';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';
import { MobileBottomNav } from './MobileBottomNav';

export const AppShell: React.FC<{ children: React.ReactNode; hideSidebar?: boolean }> = ({
  children,
  hideSidebar = false,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-app-bg text-app-body flex flex-col selection:bg-purple-500 selection:text-white">
      <AppHeader onHamburger={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        {!hideSidebar && (
          <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}

        <main className={`flex-1 transition-all duration-200 pb-20 lg:pb-8 ${!hideSidebar ? 'lg:pl-64' : ''}`}>
          {children}
        </main>
      </div>

      {!hideSidebar && <MobileBottomNav />}
    </div>
  );
};
