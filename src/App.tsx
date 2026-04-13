import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Discover from "./pages/Discover";
import History from "./pages/History";
import Messages from "./pages/Messages";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import SafetySettings from "./pages/SafetySettings";
import Feedback from "./pages/Feedback";
import Notifications from "./pages/Notifications";
import Upgrade from "./pages/Upgrade";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import Onboarding from "./pages/Onboarding";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("is_profile_complete")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        setProfileComplete(data?.is_profile_complete ?? false);
      });
  }, [user]);

  if (loading || (user && profileComplete === null))
    return <div className="min-h-screen bg-background" />;
  if (!user) return <Navigate to="/auth" replace />;
  if (!profileComplete) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
};

const OnboardingRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("is_profile_complete")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        setProfileComplete(data?.is_profile_complete ?? false);
      });
  }, [user]);

  if (loading || (user && profileComplete === null))
    return <div className="min-h-screen bg-background" />;
  if (!user) return <Navigate to="/auth" replace />;
  if (profileComplete) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-background" />;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/onboarding" element={<OnboardingRoute><Onboarding /></OnboardingRoute>} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/" element={<ProtectedRoute><Discover /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
              <Route path="/chat/:connectionId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/safety" element={<ProtectedRoute><SafetySettings /></ProtectedRoute>} />
              <Route path="/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
              <Route path="/upgrade" element={<ProtectedRoute><Upgrade /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
