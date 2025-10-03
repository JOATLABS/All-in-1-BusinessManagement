import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminRouter } from './admin/AdminRouter';
import { useSiteContent } from './hooks/useSiteContent';
import { LandingPage } from './pages/LandingPage';

const App = () => {
  const { content, isReady } = useSiteContent();

  return (
    <Routes>
      <Route path="/" element={<LandingPage content={content} isReady={isReady} />} />
      <Route path="/admin/*" element={<AdminRouter siteContent={content} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;

