import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import AdminPanel from './components/AdminPanel';
import NFCSimulation from './components/NFCSimulation';

function App() {
  return (
    <Router>
      <div className="App">
        <h1>Employee Benefits App</h1>
        <nav>
          <ul>
            <li>
              <Link to="/admin">Admin Panel</Link>
            </li>
            <li>
              <Link to="/nfc-simulation">NFC Simulation</Link>
            </li>
          </ul>
        </nav>

        {/* Define routes here */}
        <Routes>
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/nfc-simulation" element={<NFCSimulation />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
