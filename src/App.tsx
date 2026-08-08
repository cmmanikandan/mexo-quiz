import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RoleProvider } from './contexts/RoleContext';
import { AppShell } from './components/layout/AppShell';

import { LandingPage } from './pages/landing/LandingPage';
import { SignInPage } from './pages/auth/SignInPage';
import { DashboardPage } from './pages/home/DashboardPage';
import { DiscoverPage } from './pages/discover/DiscoverPage';
import { QuizLibraryPage } from './pages/library/QuizLibraryPage';
import { ClassesPage } from './pages/classes/ClassesPage';
import { ClassDetailPage } from './pages/classes/ClassDetailPage';
import { AssignmentsPage } from './pages/assignments/AssignmentsPage';
import { SessionsPage } from './pages/sessions/SessionsPage';
import { HostSessionPage } from './pages/sessions/HostSessionPage';
import { ReportsPage } from './pages/reports/ReportsPage';
import { ReportDetailPage } from './pages/reports/ReportDetailPage';
import { LeaderboardPage } from './pages/leaderboard/LeaderboardPage';
import { ProgressPage } from './pages/progress/ProgressPage';
import { CalendarPage } from './pages/calendar/CalendarPage';
import { MessagesPage } from './pages/messages/MessagesPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { AccountPage } from './pages/account/AccountPage';
import { AdminConsolePage } from './pages/admin/AdminConsolePage';
import { ActivityPage } from './pages/activity/ActivityPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { NotificationsPage } from './pages/notifications/NotificationsPage';
import { QuizDetailPage } from './pages/library/QuizDetailPage';

import { QuizBuilder } from './components/builder/QuizBuilder';
import { QuizPlayer } from './components/player/QuizPlayer';
import { QuizResultView } from './components/results/QuizResultView';
import { LiveLobby } from './components/live/LiveLobby';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <img src="/logo.png" alt="MEXO" className="w-12 h-12 animate-bounce object-contain" />
          <p className="text-xs font-bold text-slate-300">Connecting to MEXO Account...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/welcome" replace />;
  }

  return <>{children}</>;
};

export const AppContent: React.FC = () => {
  return (
    <Routes>
      <Route path="/welcome" element={<LandingPage />} />
      <Route path="/signin" element={<SignInPage />} />

      {/* Main Unified Account Routes under AppShell */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppShell>
              <DashboardPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/discover"
        element={
          <ProtectedRoute>
            <AppShell>
              <DiscoverPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/library"
        element={
          <ProtectedRoute>
            <AppShell>
              <QuizLibraryPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/library/:id"
        element={
          <ProtectedRoute>
            <AppShell>
              <QuizDetailPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <AppShell>
              <NotificationsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/classes"
        element={
          <ProtectedRoute>
            <AppShell>
              <ClassesPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/classes/:id"
        element={
          <ProtectedRoute>
            <AppShell>
              <ClassDetailPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/assignments"
        element={
          <ProtectedRoute>
            <AppShell>
              <AssignmentsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sessions"
        element={
          <ProtectedRoute>
            <AppShell>
              <SessionsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/host/:sessionId"
        element={
          <ProtectedRoute>
            <AppShell hideSidebar>
              <HostSessionPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <AppShell>
              <ReportsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/:id"
        element={
          <ProtectedRoute>
            <AppShell>
              <ReportDetailPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/leaderboard"
        element={
          <ProtectedRoute>
            <AppShell>
              <LeaderboardPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/progress"
        element={
          <ProtectedRoute>
            <AppShell>
              <ProgressPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <AppShell>
              <CalendarPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <AppShell>
              <MessagesPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <AppShell>
              <SettingsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/account/*"
        element={
          <ProtectedRoute>
            <AppShell hideSidebar>
              <AccountPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/activity"
        element={
          <ProtectedRoute>
            <AppShell>
              <ActivityPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <AppShell>
              <ProfilePage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AppShell>
              <AdminConsolePage />
            </AppShell>
          </ProtectedRoute>
        }
      />

      {/* Result view — standalone, no nav shell */}
      <Route
        path="/result/:attemptId"
        element={
          <ProtectedRoute>
            <QuizResultView />
          </ProtectedRoute>
        }
      />

      {/* Standalone Player, Builder, and Live Lobby */}
      <Route
        path="/quiz/:id"
        element={
          <ProtectedRoute>
            <QuizPlayer />
          </ProtectedRoute>
        }
      />
      <Route
        path="/flashcards/:id"
        element={
          <ProtectedRoute>
            <QuizPlayer />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lesson/:id"
        element={
          <ProtectedRoute>
            <QuizPlayer />
          </ProtectedRoute>
        }
      />
      <Route
        path="/builder/:id"
        element={
          <ProtectedRoute>
            <QuizBuilder />
          </ProtectedRoute>
        }
      />
      <Route
        path="/live/:code"
        element={
          <ProtectedRoute>
            <LiveLobby />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export function App() {
  return (
    <Router>
      <AuthProvider>
        <RoleProvider>
          <AppContent />
        </RoleProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

