import logo from './logo.svg';
import './App.css';
import { useEffect } from 'react';

import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ClientFormComponent from './components/ClientFormComponents/ClientFormComponent';
import TherapistFirstFormComponent from './components/TherapisFormComponents/TherapistFirstFormComponen';
import TherapistSecondFormComponent from './components/TherapisFormComponents/TherapistSecondFormComponen';


function App() {
   useEffect(() => {
        if (window.Telegram && window.Telegram.WebApp) {
            const tg = window.Telegram.WebApp;

            tg.ready();
            tg.expand();
            const user = tg.initDataUnsafe?.user;
            
            if (user) {
                console.log('Telegram ID:', user.id);
                console.log('Username:', user.username);
                console.log('Имя:', user.first_name);
                console.log('Фамилия:', user.last_name);
            }
        }
    }, []);

  return (
    <Router>
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
