import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProjectDetails from './pages/ProjectDetails';
import PrivateRoute from './components/PrivateRoute';
import { authService } from './services/authService';

function App() {
  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            authService.isAuthenticated() ? 
            <Navigate to="/dashboard" /> : 
            <Navigate to="/login" />
          } 
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/projects/:id"
          element={
            <PrivateRoute>
              <ProjectDetails />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;