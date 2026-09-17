import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import LandingPage from '../pages/LandingPage';
import CarpoolPage from '../pages/user/CarpoolPage';
import DashboardPage from '../pages/user/DashboardPage';
import MobilityAssistantPage from '../pages/user/MobilityAssistantPage';
import PreferencesPage from '../pages/user/PreferencesPage';
import ProfilePage from '../pages/user/ProfilePage';
import RouteComparisonPage from '../pages/user/RouteComparisonPage';
import RoutePlannerPage from '../pages/user/RoutePlannerPage';
import { useAuth } from '../context/AuthContext';

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          }
        />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/routes/plan" element={<RoutePlannerPage />} />
            <Route path="/routes/:id" element={<RouteComparisonPage />} />
            <Route path="/assistant" element={<MobilityAssistantPage />} />
            <Route path="/carpool" element={<CarpoolPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/preferences" element={<PreferencesPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
