import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import FloatingRadio from "@/components/FloatingRadio";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Questionnaire from "./pages/Questionnaire";
import Jobs from "./pages/Jobs";
import RoutesPage from "./pages/Routes";
import Premium from "./pages/Premium";
import Support from "./pages/Support";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import RecruiterJobs from "./pages/RecruiterJobs";
import RecruiterApplications from "./pages/RecruiterApplications";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient();

function ProtectedRoute({ children, allowedTypes }: { children: React.ReactNode; allowedTypes?: string[] }) {
  const { user, profile, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Carregando...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (allowedTypes && profile && !allowedTypes.includes(profile.user_type)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppContent() {
  const { user } = useAuth();
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/profile" element={<ProtectedRoute allowedTypes={["candidate"]}><Profile /></ProtectedRoute>} />
        <Route path="/questionnaire" element={<ProtectedRoute allowedTypes={["candidate"]}><Questionnaire /></ProtectedRoute>} />
        <Route path="/jobs" element={<ProtectedRoute allowedTypes={["candidate"]}><Jobs /></ProtectedRoute>} />
        <Route path="/routes" element={<ProtectedRoute allowedTypes={["candidate"]}><RoutesPage /></ProtectedRoute>} />
        <Route path="/premium" element={<ProtectedRoute allowedTypes={["candidate"]}><Premium /></ProtectedRoute>} />
        <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
        <Route path="/recruiter/dashboard" element={<ProtectedRoute allowedTypes={["recruiter"]}><RecruiterDashboard /></ProtectedRoute>} />
        <Route path="/recruiter/jobs" element={<ProtectedRoute allowedTypes={["recruiter"]}><RecruiterJobs /></ProtectedRoute>} />
        <Route path="/recruiter/applications" element={<ProtectedRoute allowedTypes={["recruiter"]}><RecruiterApplications /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute allowedTypes={["admin"]}><Admin /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
      {user && <FloatingRadio />}
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
