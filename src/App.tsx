
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Journal from "@/pages/Journal";
import Dashboard from "@/pages/Dashboard";
import Exercises from "@/pages/Exercises";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import AuthScreen from "@/components/AuthScreen";
import { useState } from "react";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Show loading state if auth state is still being determined
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>;
  }
  
  // Redirect to auth page if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const [onboardingComplete, setOnboardingComplete] = useState(
    localStorage.getItem("onboardingComplete") === "true"
  );

  const handleOnboardingComplete = () => {
    localStorage.setItem("onboardingComplete", "true");
    setOnboardingComplete(true);
  };

  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <Layout>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/journal"
              element={
                <ProtectedRoute>
                  {onboardingComplete ? (
                    <Journal />
                  ) : (
                    <AuthScreen onComplete={handleOnboardingComplete} />
                  )}
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  {onboardingComplete ? (
                    <Dashboard />
                  ) : (
                    <AuthScreen onComplete={handleOnboardingComplete} />
                  )}
                </ProtectedRoute>
              }
            />
            <Route
              path="/exercises"
              element={
                <ProtectedRoute>
                  {onboardingComplete ? (
                    <Exercises />
                  ) : (
                    <AuthScreen onComplete={handleOnboardingComplete} />
                  )}
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  {onboardingComplete ? (
                    <Settings />
                  ) : (
                    <AuthScreen onComplete={handleOnboardingComplete} />
                  )}
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </Layout>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <AppRoutes />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
