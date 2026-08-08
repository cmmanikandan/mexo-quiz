import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { RoleProvider } from './contexts/RoleContext';
import { AppShell } from './components/layout/AppShell';

import { LandingPage } from './pages/landing/LandingPage';
import { SignInPage } from './pages/auth/SignInPage';
import { DashboardPage } from './pages/home/DashboardPage';
import { QuizLibraryPage } from './pages/library/QuizLibraryPage';
import { QuizBuilder } from './components/builder/QuizBuilder';
import { QuizPlayer } from './components/player/QuizPlayer';
import { QuizResultView } from './components/results/QuizResultView';
import { LiveLobby } from './components/live/LiveLobby';
import { LeaderboardPage } from './pages/leaderboard/LeaderboardPage';
import { AccountPage } from './pages/account/AccountPage';

import { StudentAssignmentsPage } from './pages/student/StudentAssignmentsPage';
import { StudentPracticePage } from './pages/student/StudentPracticePage';
import { StudentHistoryPage } from './pages/student/StudentHistoryPage';
import { StudentCertificatesPage } from './pages/student/StudentCertificatesPage';
import { StudentAchievementsPage } from './pages/student/StudentAchievementsPage';

import { TeacherQuizzesPage } from './pages/teacher/TeacherQuizzesPage';
import { TeacherAssignmentsPage } from './pages/teacher/TeacherAssignmentsPage';
import { TeacherClassesPage } from './pages/teacher/TeacherClassesPage';
import { TeacherQuestionBankPage } from './pages/teacher/TeacherQuestionBankPage';
import { TeacherAnalyticsPage } from './pages/teacher/TeacherAnalyticsPage';

import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <img src="/logo.png" alt="MEXO" className="w-12 h-12 animate-bounce object-contain" />
          <p className="text-xs font-bold text-slate-600">Connecting to MEXO Account...</p>
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

      {/* Main Shelled Routes */}
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
        path="/leaderboard"
        element={
          <ProtectedRoute>
            <AppShell>
              <LeaderboardPage />
            </AppShell>
          </ProtectedRoute>
        }
      />

      {/* Student Routes */}
      <Route
        path="/student/assignments"
        element={
          <ProtectedRoute>
            <AppShell>
              <StudentAssignmentsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/practice"
        element={
          <ProtectedRoute>
            <AppShell>
              <StudentPracticePage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/history"
        element={
          <ProtectedRoute>
            <AppShell>
              <StudentHistoryPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/certificates"
        element={
          <ProtectedRoute>
            <AppShell>
              <StudentCertificatesPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/achievements"
        element={
          <ProtectedRoute>
            <AppShell>
              <StudentAchievementsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />

      {/* Teacher Routes */}
      <Route
        path="/teacher/quizzes"
        element={
          <ProtectedRoute>
            <AppShell>
              <TeacherQuizzesPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/assignments"
        element={
          <ProtectedRoute>
            <AppShell>
              <TeacherAssignmentsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/classes"
        element={
          <ProtectedRoute>
            <AppShell>
              <TeacherClassesPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/question-bank"
        element={
          <ProtectedRoute>
            <AppShell>
              <TeacherQuestionBankPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/analytics"
        element={
          <ProtectedRoute>
            <AppShell>
              <TeacherAnalyticsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            <AppShell>
              <AdminDashboardPage />
            </AppShell>
          </ProtectedRoute>
        }
      />

      {/* Account Routes */}
      <Route
        path="/account/*"
        element={
          <ProtectedRoute>
            <AppShell>
              <AccountPage />
            </AppShell>
          </ProtectedRoute>
        }
      />

      {/* Result view */}
      <Route
        path="/result/:attemptId"
        element={
          <ProtectedRoute>
            <AppShell hideSidebar>
              <QuizResultView />
            </AppShell>
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

      <Route path="*" element={<Navigate to="/welcome" replace />} />
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
