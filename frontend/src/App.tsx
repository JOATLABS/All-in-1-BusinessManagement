import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { SiteContentProvider } from './content/SiteContentProvider';
import { LandingPage } from './pages/LandingPage';
import ReserveTablePage from './pages/ReserveTablePage';
import { EventsPage } from './pages/EventsPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminLogin } from './pages/admin/AdminLogin';
import { SiteConfiguration } from './pages/admin/SiteConfiguration';
import { Reservations } from './pages/admin/Reservations';
import { AdminEventsPage } from './pages/admin/AdminEventsPage';
import { TeamManagement } from './pages/admin/TeamManagement';
import RRLanding from './pages/RRLanding';

const App = () => (
  <AuthProvider>
    <SiteContentProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/reserve" element={<ReserveTablePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/rr" element={<RRLanding />} />
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
            <Route path="events" element={<AdminEventsPage />} />
            <Route path="site-configuration" element={<SiteConfiguration />} />
            <Route path="team" element={<TeamManagement />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </SiteContentProvider>
  </AuthProvider>
);

export default App;
