
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/contexts/AuthContext';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { PremiumProvider } from '@/contexts/PremiumContext';
import Layout from '@/components/Layout';
import Index from '@/pages/Index';
import Journal from '@/pages/Journal';
import Dashboard from '@/pages/Dashboard';
import Settings from '@/pages/Settings';
import Exercises from '@/pages/Exercises';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Onboarding from '@/pages/Onboarding';
import ProtectedRoute from '@/components/ProtectedRoute';
import ThemeProvider from '@/contexts/ThemeContext';

const App: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { isOnline, pendingEntries, syncPendingEntries } = useOfflineStorage();

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/service-worker.js')
          .then((registration) => {
            console.log('ServiceWorker registration successful');
          })
          .catch((err) => {
            console.log('ServiceWorker registration failed: ', err);
          });
      });
    }
  }, []);

  // Handle offline/online status
  useEffect(() => {
    if (isOnline && pendingEntries.length > 0) {
      syncPendingEntries();
    }
  }, [isOnline, pendingEntries, syncPendingEntries]);

  return (
    <Router>
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
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Index />
                    </Layout>
                  </ProtectedRoute>
                }
              />
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
    </Router>
  );
};

export default App;
