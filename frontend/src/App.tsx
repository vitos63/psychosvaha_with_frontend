import './App.css';
import { useEffect, useState } from 'react';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ClientFormComponent from './components/ClientFormComponents/ClientFormComponent';
import TherapistFirstFormComponent from './components/TherapisFormComponents/TherapistFirstFormComponen';
import TherapistSecondFormComponent from './components/TherapisFormComponents/TherapistSecondFormComponen';
import TherapistProfileEditPage from './components/TherapisFormComponents/TherapistProfileEditPage';
import TherapistProfileViewPage from './components/TherapisFormComponents/TherapistProfileViewPage';
import SuccessPage from './components/SuccessPage/SuccessPage';
import AdminDashboardPage from './components/AdminDashboard/AdminDashboardPage';
import SelectedTherapistsPage from './components/SelectedTherapists/SelectedTherapistsPage';
import ConcentOfPersonalData from './components/PDFDocuments/PersonalData';
import ReportProblem from './components/ReportProblem/ReportProblemButton';


type TgUser = NonNullable<NonNullable<TelegramWebApp['initDataUnsafe']>['user']>;

const MOBILE_PLATFORMS = new Set(['android', 'android_x', 'ios']);

function App() {
  const [user, setUser] = useState<TgUser | null>(null);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    const platform = (tg.platform || 'unknown').toLowerCase();
    const isMobile = MOBILE_PLATFORMS.has(platform);
    const versionAtLeast = (v: string) => {
      try { return typeof tg.isVersionAtLeast === 'function' && tg.isVersionAtLeast(v); }
      catch { return false; }
    };

    try { tg.ready(); } catch { /* noop */ }
    try { tg.expand(); } catch { /* noop */ }

    if (versionAtLeast('7.7')) {
      try { tg.disableVerticalSwipes?.(); } catch { /* noop */ }
    }


    if (!isMobile && versionAtLeast('8.0') && typeof tg.requestFullscreen === 'function') {
      try { tg.requestFullscreen(); } catch { /* noop */ }
    }

    if (typeof tg.setHeaderColor === 'function' && tg.themeParams?.bg_color) {
      try { tg.setHeaderColor(tg.themeParams.bg_color); } catch { /* noop */ }
    }

    const userData = tg.initDataUnsafe?.user;
    if (userData) {
      setUser(userData);
    }

    const onViewportChanged = (payload: unknown) => {
      const isStable =
        typeof payload === 'object' &&
        payload !== null &&
        (payload as { isStateStable?: boolean }).isStateStable === true;
      if (isStable && tg.isExpanded === false) {
        try { tg.expand(); } catch { /* noop */ }
      }
    };

    tg.onEvent?.('viewportChanged', onViewportChanged);
    return () => {
      tg.offEvent?.('viewportChanged', onViewportChanged);
    };
  }, []);

  return (
    <div style={{ minHeight: 'var(--tg-viewport-stable-height, 100vh)', width: '100%', boxSizing: 'border-box' }}>
      <Router>
        <Routes>
          <Route path="/form-client" element={<ClientFormComponent client_id={user?.id || 1} />} />
          <Route path="/form-therapist-first" element={<TherapistFirstFormComponent therapist_id={user?.id || 1} therapist_username={user?.username || ""}/>} />
          <Route path="/form-therapist-second" element={<TherapistSecondFormComponent therapist_id={user?.id || 1}/>} />
          <Route path="/therapist/profile" element={<TherapistProfileViewPage />} />
          <Route path="/therapist/profile/edit" element={<TherapistProfileEditPage />} />
          <Route path="/form-success" element={<SuccessPage />} />
          <Route path="/admin" element={<AdminDashboardPage tgId={user?.id} />} />
          <Route path="/selected_therapists/:request_id" element={<SelectedTherapistsPage />}/>
          <Route path="/consent_of_personal_data" element={<ConcentOfPersonalData />}/>
        </Routes>
        <ReportProblem tgUsername={user?.username} />
      </Router>
    </div>
  );
}

export default App;
