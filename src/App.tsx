import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./lib/auth";
import Navigation from "./components/Navigation";
import Index from "./pages/Index";
import SpotsPage from "./pages/SpotsPage";
import SpotDetailPage from "./pages/SpotDetailPage";
import PlanPage from "./pages/PlanPage";
import ProfilePage from "./pages/ProfilePage";
import OnboardingPage from "./pages/OnboardingPage";
import AdminPage from "./pages/AdminPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
            <Navigation />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/spots" element={<SpotsPage />} />
              <Route path="/spots/:id" element={<SpotDetailPage />} />
              <Route path="/plan" element={<PlanPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
