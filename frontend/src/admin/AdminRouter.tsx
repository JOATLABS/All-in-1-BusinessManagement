import { Navigate, Route, Routes } from 'react-router-dom';
import type { SiteContent } from '../types/content';
import { AdminLayout } from './AdminLayout';
import { AdminAuthProvider } from './AdminAuthContext';
import { RequireAuth } from './RequireAuth';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { SiteConfigPage } from './pages/SiteConfigPage';

export const AdminRouter = ({ siteContent }: { siteContent: SiteContent }) => (
  <AdminAuthProvider>
    <Routes>
      <Route index element={<LoginPage />} />
      <Route
        element={
          <RequireAuth>
            <AdminLayout siteContent={siteContent} />
          </RequireAuth>
        }
      >
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="site-configuration" element={<SiteConfigPage />} />
        <Route path="" element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  </AdminAuthProvider>
);

