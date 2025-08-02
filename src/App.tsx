import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AdminRoute } from "@/components/admin/AdminRoute";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminRedirectGuard } from "@/components/admin/AdminRedirectGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { ErrorBoundary } from "@/components/error-boundary/ErrorBoundary";
import { PWAInstallPrompt } from "@/components/pwa/PWAInstallPrompt";
import { usePWA } from "@/hooks/usePWA";
import { useEffect } from "react";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Transacoes from "./pages/Transacoes";
import Lembretes from "./pages/Lembretes";
import Categorias from "./pages/Categorias";
import Relatorios from "./pages/Relatorios";
import Perfil from "./pages/Perfil";
import Plano from "./pages/Plano";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";
import ContasPagarReceber from "./pages/ContasPagarReceber";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <AdminRedirectGuard>
      {children}
    </AdminRedirectGuard>
  );
}

function AppRoutes() {
  const { canInstall } = usePWA();

  useEffect(() => {
    // Log PWA status
    console.log('PWA can install:', canInstall);
  }, [canInstall]);

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/landing" element={<Landing />} />
      
      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/transacoes" 
        element={
          <ProtectedRoute>
            <AppLayout>
              <Transacoes />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/lembretes" 
        element={
          <ProtectedRoute>
            <AppLayout>
              <Lembretes />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/categorias" 
        element={
          <ProtectedRoute>
            <AppLayout>
              <Categorias />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/relatorios" 
        element={
          <ProtectedRoute>
            <AppLayout>
              <Relatorios />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/perfil" 
        element={
          <ProtectedRoute>
            <AppLayout>
              <Perfil />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/plano" 
        element={
          <ProtectedRoute>
            <AppLayout>
              <Plano />
            </AppLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/contas/*" 
        element={
          <ProtectedRoute>
            <AppLayout>
              <ContasPagarReceber />
            </AppLayout>
          </ProtectedRoute>
        } 
      />

      {/* Admin Routes - Completamente invisíveis para usuários normais */}
      <Route 
        path="/admin-panel" 
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="security-logs" element={<div className="text-white">Security Logs - Em desenvolvimento</div>} />
        <Route path="analytics" element={<div className="text-white">Analytics - Em desenvolvimento</div>} />
        <Route path="database" element={<div className="text-white">Database - Em desenvolvimento</div>} />
        <Route path="settings" element={<div className="text-white">Settings - Em desenvolvimento</div>} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ErrorBoundary>
          <AuthProvider>
            <BrowserRouter>
              <AppRoutes />
              <PWAInstallPrompt />
              <Toaster />
              <Sonner />
            </BrowserRouter>
          </AuthProvider>
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
