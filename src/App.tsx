import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { BusinessProvider } from "@/contexts/BusinessContext";
import LoadingScreen from "./components/LoadingScreen";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Billing from "./pages/Billing";
import Products from "./pages/Products";
import Stock from "./pages/Stock";
import Kitchen from "./pages/Kitchen";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Layout from "./components/Layout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Role-based route component
const RoleBasedRedirect = () => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;
  
  // Role-based default redirect
  switch (user.role) {
    case 'cashier':
      return <Navigate to="/billing" replace />;
    case 'chef':
    case 'stock':
      return <Navigate to="/stock" replace />;
    case 'admin':
    default:
      return <Navigate to="/dashboard" replace />;
  }
};

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Public route wrapper (redirect if already authenticated)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? <>{children}</> : <RoleBasedRedirect />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BusinessProvider>
        <LoadingScreen />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />
              <Route path="/" element={<RoleBasedRedirect />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="billing" element={<Billing />} />
                <Route path="products" element={<Products />} />
                <Route path="stock" element={<Stock />} />
                <Route path="kitchen" element={<Kitchen />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<Settings />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </BusinessProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
