import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../shared/stores/auth.store';
import { AppShell } from '../shared/components/layout/AppShell';
import LandingPage from '../features/landing/pages/LandingPage';

const LoginPage          = lazy(() => import('../features/auth/pages/LoginPage'));
const SignUpPage          = lazy(() => import('../features/auth/pages/SignUpPage'));
const ForgotPasswordPage  = lazy(() => import('../features/auth/pages/ForgotPasswordPage'));
const ResetPasswordPage   = lazy(() => import('../features/auth/pages/ResetPasswordPage'));
const VerifyEmailPage     = lazy(() => import('../features/auth/pages/VerifyEmailPage'));
const DashboardPage       = lazy(() => import('../features/dashboard/pages/DashboardPage'));
const HabitsPage          = lazy(() => import('../features/habits/pages/HabitsPage'));
const MoodPage            = lazy(() => import('../features/mood/pages/MoodPage'));
const SleepPage           = lazy(() => import('../features/sleep/pages/SleepPage'));
const HydrationPage       = lazy(() => import('../features/hydration/pages/HydrationPage'));
const BreathingPage       = lazy(() => import('../features/breathing/pages/BreathingPage'));
const JournalPage         = lazy(() => import('../features/journal/pages/JournalPage'));
const JournalEntryPage    = lazy(() => import('../features/journal/pages/JournalEntryPage'));
const GoalsPage           = lazy(() => import('../features/goals/pages/GoalsPage'));
const GoalDetailPage      = lazy(() => import('../features/goals/pages/GoalDetailPage'));
const AnalyticsPage       = lazy(() => import('../features/analytics/pages/AnalyticsPage'));
const CalendarPage        = lazy(() => import('../features/calendar/pages/CalendarPage'));
const SettingsPage        = lazy(() => import('../features/settings/pages/SettingsPage'));

const Loader = () => (
  <div className="flex h-screen items-center justify-center bg-[var(--color-bg)]">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)]" />
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isInitialized } = useAuthStore();
  if (!isInitialized) return <Loader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const GuestRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isInitialized } = useAuthStore();
  if (!isInitialized) return <Loader />;
  if (isAuthenticated) return <Navigate to="/app/dashboard" replace />;
  return <>{children}</>;
};

export const AppRouter = () => (
  <Suspense fallback={<Loader />}>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login"           element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/signup"          element={<GuestRoute><SignUpPage /></GuestRoute>} />
      <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
      <Route path="/reset-password"  element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />
      <Route path="/verify-email"    element={<VerifyEmailPage />} />
      <Route path="/app" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard"  element={<DashboardPage />} />
        <Route path="habits"     element={<HabitsPage />} />
        <Route path="mood"       element={<MoodPage />} />
        <Route path="sleep"      element={<SleepPage />} />
        <Route path="hydration"  element={<HydrationPage />} />
        <Route path="breathing"  element={<BreathingPage />} />
        <Route path="journal"    element={<JournalPage />} />
        <Route path="journal/:id" element={<JournalEntryPage />} />
        <Route path="goals"      element={<GoalsPage />} />
        <Route path="goals/:id"  element={<GoalDetailPage />} />
        <Route path="analytics"  element={<AnalyticsPage />} />
        <Route path="calendar"   element={<CalendarPage />} />
        <Route path="settings"   element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
    </Routes>
  </Suspense>
);
