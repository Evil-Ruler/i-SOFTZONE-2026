import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  // Check if a secure session token exists in browser memory
  const token = localStorage.getItem('token');

  // If token is found, render the dashboard; otherwise kick them back to login
  return token ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;
