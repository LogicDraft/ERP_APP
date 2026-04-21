import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './components/pages/Login';
import Dashboard from './components/pages/Dashboard';
import MentorAllocation from './components/pages/MentorAllocation';
import StudentList from './components/pages/StudentList';
import TimeTable from './components/pages/TimeTable';
import Profile from './components/pages/Profile';
import Faculty from './components/pages/Faculty';
import Attendance from './components/pages/Attendance';

import { App as CapacitorApp } from '@capacitor/app';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  // Handle Android Back Button
  const locationRef = React.useRef(location);
  const navigateRef = React.useRef(navigate);

  useEffect(() => {
    locationRef.current = location;
    navigateRef.current = navigate;
  }, [location, navigate]);

  useEffect(() => {
    const handleBackButton = async () => {
      CapacitorApp.addListener('backButton', ({ canGoBack }) => {
        const currentPath = locationRef.current.pathname;
        const rootPages = ['/mentor-allocation', '/student-list', '/timetable', '/attendance', '/faculty', '/profile'];

        if (currentPath === '/' || currentPath === '/login') {
          CapacitorApp.exitApp();
        } else if (rootPages.includes(currentPath)) {
          navigateRef.current('/');
        } else {
          navigateRef.current(-1);
        }
      });
    };

    handleBackButton();

    return () => {
      CapacitorApp.removeAllListeners();
    };
  }, []); // Empty dependency array to register only once

  if (!isLoggedIn) return null;

  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />

      <Route path="/mentor-allocation" element={
        <ProtectedRoute>
          <MentorAllocation />
        </ProtectedRoute>
      } />

      <Route path="/student-list" element={
        <ProtectedRoute>
          <StudentList />
        </ProtectedRoute>
      } />

      <Route path="/timetable" element={
        <ProtectedRoute>
          <TimeTable />
        </ProtectedRoute>
      } />

      <Route path="/attendance" element={
        <ProtectedRoute>
          <Attendance />
        </ProtectedRoute>
      } />

      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />

      <Route path="/faculty" element={
        <ProtectedRoute>
          <Faculty />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;
