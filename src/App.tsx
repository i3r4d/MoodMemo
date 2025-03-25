
import React from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate 
} from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { PremiumProvider } from '@/contexts/PremiumProvider';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Home from '@/pages/Home';
import Dashboard from '@/pages/Dashboard';
import Journal from '@/pages/Journal';
import JournalEntry from '@/pages/JournalEntry';
import Settings from '@/pages/Settings';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Exercises from '@/pages/Exercises';
import ExerciseDetail from '@/pages/ExerciseDetail';
import Insights from '@/pages/Insights';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <PremiumProvider>
            <div className="min-h-screen bg-background">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<Layout><Home /></Layout>} />
                <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
                <Route path="/journal" element={<Layout><Journal /></Layout>} />
                <Route path="/journal/new" element={<Layout><JournalEntry /></Layout>} />
                <Route path="/journal/:id" element={<Layout><JournalEntry /></Layout>} />
                <Route path="/settings" element={<Layout><Settings /></Layout>} />
                <Route path="/exercises" element={<Layout><Exercises /></Layout>} />
                <Route path="/exercises/:id" element={<Layout><ExerciseDetail /></Layout>} />
                <Route path="/insights" element={<Layout><Insights /></Layout>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <Toaster />
            </div>
          </PremiumProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
