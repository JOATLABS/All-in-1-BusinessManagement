import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { SiteContentProvider } from './content/SiteContentProvider';
import { LandingPage } from './pages/LandingPage';
import ReserveTablePage from './pages/ReserveTablePage';
import { EventsPage } from './pages/EventsPage';
import { MobileAppLandingPage } from './pages/MobileAppLandingPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminLogin } from './pages/admin/AdminLogin';
import { SiteConfiguration } from './pages/admin/SiteConfiguration';
import { Reservations } from './pages/admin/Reservations';

const App = () => (
  <AuthProvider>
    <SiteContentProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/mobile-app" element={<MobileAppLandingPage />} />
          <Route path="/reserve" element={<ReserveTablePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="reservations" element={<Reservations />} />
            <Route path="site-configuration" element={<SiteConfiguration />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </SiteContentProvider>
  </AuthProvider>
);

export default App;
