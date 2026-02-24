import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AssignTicket from './pages/AssignTicket';
import ManageLead from './pages/ManageLead';
import MonitorEmployee from './pages/MonitorEmployee';
import ManageEmployee from './pages/ManageEmployee';
import ManageOrder from './pages/ManageOrder';
import GenerateReport from './pages/GenerateReport';
import MyAssets from './pages/MyAssets';
import AssetsHistory from './pages/AssetsHistory';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';
import Notifications from './pages/Notifications';
import ServiceRequests from './pages/ServiceRequests';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>; // You can replace with a proper spinner
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  
  return children;
};

// Public Route Wrapper (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (isLoggedIn) return <Navigate to="/dashboard" replace />;
  
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          
          {/* Protected Routes wrapped in DashboardLayout */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/assign-ticket" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AssignTicket />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/manage-lead" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                    <ManageLead />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/monitor-employee" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <MonitorEmployee />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/manage-employee" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ManageEmployee />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/manage-orders" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ManageOrder />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/generate-report" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <GenerateReport />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-assets" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <MyAssets />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/assets-history" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AssetsHistory />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Profile />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/change-password" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ChangePassword />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/notifications" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Notifications />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/service-requests" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ServiceRequests />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
