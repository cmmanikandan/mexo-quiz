import React, { useState } from 'react';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { CreateModal } from '../create/CreateModal';

export const AppShell: React.FC<{ children: React.ReactNode; hideSidebar?: boolean }> = ({
  children,
  hideSidebar = false,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-purple-500 selection:text-white max-w-full overflow-x-hidden">
      <AppHeader
        onHamburger={() => setSidebarOpen(!sidebarOpen)}
        onOpenCreate={() => setCreateModalOpen(true)}
      />

      <div className="flex-1 flex max-w-full overflow-x-hidden">
        {!hideSidebar && (
          <AppSidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onOpenCreate={() => setCreateModalOpen(true)}
          />
        )}

        <main className={`flex-1 min-w-0 max-w-full transition-all duration-200 pb-20 lg:pb-8 overflow-x-hidden ${!hideSidebar ? 'lg:pl-64' : ''}`}>
          {children}
        </main>
      </div>

      {!hideSidebar && <MobileBottomNav onOpenCreate={() => setCreateModalOpen(true)} />}

      <CreateModal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} />
    </div>
  );
};

