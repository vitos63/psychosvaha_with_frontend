import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ClientFormComponent from './components/ClientFormComponents/ClientFormComponent';
import TherapistFirstFormComponent from './components/TherapisFormComponents/TherapistFirstFormComponen';
import TherapistSecondFormComponent from './components/TherapisFormComponents/TherapistSecondFormComponen';


function App() {
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
