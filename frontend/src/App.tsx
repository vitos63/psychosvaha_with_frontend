import './App.css';
import { useEffect, useState } from 'react';

import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ClientFormComponent from './components/ClientFormComponents/ClientFormComponent';
import TherapistFirstFormComponent from './components/TherapisFormComponents/TherapistFirstFormComponen';
import TherapistSecondFormComponent from './components/TherapisFormComponents/TherapistSecondFormComponen';
import { createClientRequest } from './api/api';


function App() {
  const [user, setUser] = useState(null);
  const [tgApp, setTgApp] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        setTgApp(tg);
        tg.ready();
        tg.expand();
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
    <div style={{ minHeight: '100vh' }}>
      <Router>
        <nav>
          <Link to="/form-client">Форма клиента</Link>
          <Link to="/form-thrapist-first">Первая форма терапевта</Link>
          <Link to="/form-thrapist-second">Вторая форма терапевта</Link>
        </nav>

        <Routes>
          <Route path="/form-client" element={<ClientFormComponent client_id={user?.id || 1} />} />
          <Route path="/form-thrapist-first" element={<TherapistFirstFormComponent />} />
          <Route path="/form-thrapist-second" element={<TherapistSecondFormComponent />} />
        </Routes>
      </Router>
    </div>



  );
}

export default App;
