import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';

function App() {
  return (
    <Router>
      {/* 
        The global wrapper below ensures the application resets all default margins 
        and allows your split-screen layout to occupy the full height of the viewport.
      */}
      <div style={{ margin: 0, padding: 0, boxSizing: 'border-box' }}>
        <Routes>
          {/* Automatically forward root traffic directly into your enterprise terminal login */}
          <Route path="/" element={<Navigate to="/login" />} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;