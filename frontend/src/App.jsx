import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';

import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ClientFormComponent from './components/ClientFormComponents/ClientFormComponent';
import TherapistFirstFormComponent from './components/TherapisFormComponents/TherapistFirstFormComponen';
import TherapistSecondFormComponent from './components/TherapisFormComponents/TherapistSecondFormComponen';


function App() {
  const [user, setUser] = useState(null);

   useEffect(() => {
        if (window.Telegram && window.Telegram.WebApp) {
            const tg = window.Telegram.WebApp;

            tg.ready();
            tg.expand();
            const userData = tg.initDataUnsafe?.user;
            
            if (userData) {
              setUser(userData);
              console.log('Telegram ID:', userData.id);
              console.log('Username:', userData.username);
              console.log('Имя:', userData.first_name);
              console.log('Фамилия:', userData.last_name);
      }
        }
    }, []);

  return (
    <Router>
      {user && (
        <div style={{
          padding: '10px',
          background: '#f0f0f0',
          marginBottom: '20px'
        }}>
          <h3>👤 Пользователь Telegram:</h3>
          <p><strong>ID:</strong> {user.id}</p>
          <p><strong>Имя:</strong> {user.first_name} {user.last_name || ''}</p>
          {user.username && <p><strong>Username:</strong> @{user.username}</p>}
        </div>
      )}
      <nav>
        <Link to="/form-client">Форма клиента</Link>
        <Link to="/form-thrapist-first">Первая форма терапевта</Link>
        <Link to="/form-thrapist-second">Вторая форма терапевта</Link>
      </nav>
      
      <Routes>
        <Route path="/form-client" element={<ClientFormComponent />} />
        <Route path="/form-thrapist-first" element={<TherapistFirstFormComponent />} />
        <Route path="/form-thrapist-second" element={<TherapistSecondFormComponent />} />
      </Routes>
    </Router>

    
  );
}

export default App;
