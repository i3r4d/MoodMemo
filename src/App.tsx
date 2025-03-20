
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { PremiumProvider } from '@/contexts/PremiumProvider';
import Layout from '@/components/Layout';
import Index from '@/pages/Index';
import Journal from '@/pages/Journal';
import Dashboard from '@/pages/Dashboard';
import Settings from '@/pages/Settings';
import Exercises from '@/pages/Exercises';
import Insights from '@/pages/Insights';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Onboarding from '@/pages/Onboarding';
import ProtectedRoute from '@/components/ProtectedRoute';
import ThemeProvider from '@/contexts/ThemeContext';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <PremiumProvider>
            <div className="min-h-screen bg-background">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/onboarding"
                  element={
                    <ProtectedRoute>
                      <Onboarding />
                    </ProtectedRoute>
                  }
                />
                <Route path="/" element={<Layout><Index /></Layout>} />
                <Route
                  path="/journal"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Journal />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Dashboard />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/insights"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Insights />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/exercises"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Exercises />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Settings />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <Toaster />
            </div>
          </PremiumProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
