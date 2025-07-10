
import { Suspense, lazy, useEffect } from 'react'
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { AppLayout } from "@/components/layout/AppLayout";
import { EnhancedLoadingSpinner } from "@/components/ui/enhanced-loading-spinner";
import { LazyWrapper } from "@/components/ui/lazy-wrapper";
import { PerformanceMonitor } from "@/components/dev/PerformanceMonitor";
import { initSentry, SentryLogger } from "@/lib/sentry";
import { setupGlobalErrorHandling } from "@/lib/errorInterceptor";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";

// Lazy loading das páginas principais com preloading estratégico
const Dashboard = lazy(() => 
  import("./pages/Dashboard").then(module => {
    // Preload related components
    import("./pages/Transacoes");
    return module;
  })
);

const Transacoes = lazy(() => import("./pages/Transacoes"));
const Lembretes = lazy(() => import("./pages/Lembretes"));
const Categorias = lazy(() => import("./pages/Categorias"));
const Relatorios = lazy(() => import("./pages/Relatorios"));
const Perfil = lazy(() => import("./pages/Perfil"));
const Plano = lazy(() => import("./pages/Plano"));
const ContasPagarReceber = lazy(() => import("./pages/ContasPagarReceber"));

// Inicializar Sentry na inicialização da aplicação
initSentry()
setupGlobalErrorHandling()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
    },
    mutations: {
      onError: (error) => {
        // Capturar erros de mutations no Sentry
        SentryLogger.captureError(
          error instanceof Error ? error : new Error(String(error)),
          { context: 'react_query_mutation' }
        )
      }
    }
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <EnhancedLoadingSpinner message="Verificando autenticação..." />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <AppLayout>
      <LazyWrapper>
        {children}
      </LazyWrapper>
    </AppLayout>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <EnhancedLoadingSpinner message="Inicializando aplicação..." />;
  }

  return (
    <Routes>
      <Route path="/landing" element={<Landing />} />
      <Route 
        path="/auth" 
        element={user ? <Navigate to="/dashboard" replace /> : <Auth />} 
      />
      <Route 
        path="/plano" 
        element={
          <LazyWrapper>
            <Plano />
          </LazyWrapper>
        } 
      />
      <Route 
        path="/" 
        element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/landing" replace />} 
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/transacoes"
        element={
          <ProtectedRoute>
            <Transacoes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/contas/*"
        element={
          <ProtectedRoute>
            <ContasPagarReceber />
          </ProtectedRoute>
        }
      />
      <Route
        path="/categorias"
        element={
          <ProtectedRoute>
            <Categorias />
          </ProtectedRoute>
        }
      />
      <Route
        path="/relatorios"
        element={
          <ProtectedRoute>
            <Relatorios />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lembretes"
        element={
          <ProtectedRoute>
            <Lembretes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/perfil"
        element={
          <ProtectedRoute>
            <Perfil />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => {
  useEffect(() => {
    // Log de inicialização da aplicação
    SentryLogger.captureEvent('Application initialized', 'info', {
      environment: import.meta.env.MODE,
      version: import.meta.env.VITE_APP_VERSION || '1.0.0'
    })
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="financeflow-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <AppRoutes />
              <PerformanceMonitor />
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App;
