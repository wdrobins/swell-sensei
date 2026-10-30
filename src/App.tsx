import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navigation from "./components/Navigation";
import ErrorBoundary from "./components/ErrorBoundary";
import Index from "./pages/Index";
import SpotsPage from "./pages/SpotsPage";
import SpotDetailPage from "./pages/SpotDetailPage";
import ProfilePage from "./pages/ProfilePage";
import OnboardingPage from "./pages/OnboardingPage";
import AuthPage from "./pages/AuthPage";
import PlanPage from "./pages/PlanPage";
import LogsPage from "./pages/LogsPage";
import AnalyticsPage from "./pages/AnalyticsPage";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const RootPage = () => {
  const navigate = useNavigate();
  const isPasswordRecovery = new URLSearchParams(window.location.hash.substring(1)).get('type') === 'recovery';

  useEffect(() => {
    if (isPasswordRecovery) {
      navigate('/auth', { replace: true });
    }
  }, [isPasswordRecovery, navigate]);

  return isPasswordRecovery ? null : <Index />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <ErrorBoundary>
          <Toaster />
          <Sonner />
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
              <Navigation />
              <Routes>
                <Route path="/" element={<RootPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/spots" element={<SpotsPage />} />
                <Route path="/spots/:id" element={<SpotDetailPage />} />
                
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
                <Route path="/plan" element={<ProtectedRoute><PlanPage /></ProtectedRoute>} />
                <Route path="/logs" element={<ProtectedRoute><LogsPage /></ProtectedRoute>} />
                <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </BrowserRouter>
        </ErrorBoundary>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
