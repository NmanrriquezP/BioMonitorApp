
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RegisterUserPage from './pages/RegisterUserPage';
import WelcomePage from './pages/WelcomePage'; // New Welcome Page
import DashboardPage from './pages/DashboardPage';
import MeasureVitalsPage from './pages/MeasureVitalsPage';
import MedicalHistoryPage from './pages/MedicalHistoryPage';
import ProfilePage from './pages/ProfilePage';
import NearbyCentersPage from './pages/NearbyCentersPage'; // New page for medical centers
import { PageLayout } from './components/common/PageLayout';
import { useUserSession } from './hooks/useUserSession';

const App: React.FC = () => {
  const { users, currentUser } = useUserSession(); // Added currentUser to potentially refine logic if needed

  // This guard ensures that if a user is logged in but tries to go to '/' or '/register',
  // they are redirected to '/welcome' or '/dashboard' based on a more sophisticated logic if needed.
  // For now, HomePage handles its own redirect if currentUser exists.

  return (
    <PageLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterUserPage />} />
        <Route path="/welcome" element={currentUser ? <WelcomePage /> : <Navigate to="/" />} />
        
        {/* Protected Routes: Require a currentUser */}
        <Route path="/dashboard" element={currentUser ? <DashboardPage /> : <Navigate to="/" />} />
        <Route path="/measure" element={currentUser ? <MeasureVitalsPage /> : <Navigate to="/" />} />
        <Route path="/history" element={currentUser ? <MedicalHistoryPage /> : <Navigate to="/" />} />
        <Route path="/profile" element={currentUser ? <ProfilePage /> : <Navigate to="/" />} />
        <Route path="/medical-centers" element={currentUser ? <NearbyCentersPage /> : <Navigate to="/" />} /> 
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </PageLayout>
  );
};

export default App;