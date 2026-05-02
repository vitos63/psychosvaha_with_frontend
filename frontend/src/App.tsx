import './App.css';
import { useEffect, useState } from 'react';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ClientFormComponent from './components/ClientFormComponents/ClientFormComponent';
import TherapistFirstFormComponent from './components/TherapisFormComponents/TherapistFirstFormComponen';
import TherapistSecondFormComponent from './components/TherapisFormComponents/TherapistSecondFormComponen';
import TherapistProfileEditPage from './components/TherapisFormComponents/TherapistProfileEditPage';
import SuccessPage from './components/SuccessPage/SuccessPage';
import AdminDashboardPage from './components/AdminDashboard/AdminDashboardPage';


function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.ready();
        tg.expand();
        if (typeof tg.setHeaderColor === 'function' && tg.themeParams?.bg_color) {
          tg.setHeaderColor(tg.themeParams.bg_color);
        }
        const userData = tg.initDataUnsafe?.user;
        if (userData) {
          setUser(userData);
        }
        clearInterval(interval);
      }
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ minHeight: 'var(--tg-viewport-stable-height, 100vh)', width: '100%', boxSizing: 'border-box' }}>
      <Router>
        <Routes>
          <Route path="/form-client" element={<ClientFormComponent client_id={user?.id || 1} />} />
          <Route path="/form-therapist-first" element={<TherapistFirstFormComponent client_id={user?.id || 1}/>} />
          <Route path="/form-therapist-second" element={<TherapistSecondFormComponent client_id={user?.id || 1}/>} />
          <Route path="/therapist/profile" element={<TherapistProfileEditPage />} />
          <Route path="/form-success" element={<SuccessPage />} />
          <Route path="/admin" element={<AdminDashboardPage tgId={user?.id} />} />
        </Routes>
      </Router>
    </div>



  );
}

export default App;
