import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MobilityProvider } from './context/MobilityContext';
import AppShell from './components/AppShell';
import StudentDashboard from './pages/StudentDashboard';
import RoutesPage from './pages/RoutesPage';
import AIAssistant from './pages/AIAssistant';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  return (
    <MobilityProvider>
      <BrowserRouter>
        <AppShell>
          <Routes>
            <Route path="/" element={<Navigate to="/student" replace />} />
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/routes" element={<RoutesPage />} />
            <Route path="/ai" element={<AIAssistant />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<Navigate to="/student" replace />} />
          </Routes>
        </AppShell>
      </BrowserRouter>
    </MobilityProvider>
  );
}
