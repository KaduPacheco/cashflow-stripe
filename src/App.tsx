
import { useEffect } from 'react'
import { integrateSecurityMonitoring } from '@/lib/integrateSecurity'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import { Toaster } from '@/components/ui/toaster'
import { AppLayout } from '@/components/layout/AppLayout'
import Dashboard from '@/pages/Dashboard'
import Transacoes from '@/pages/Transacoes'
import Categorias from '@/pages/Categorias'
import Lembretes from '@/pages/Lembretes'
import Perfil from '@/pages/Perfil'
import Plano from '@/pages/Plano'
import SecurityDashboardPage from '@/pages/SecurityDashboardPage'
import ContasPagarReceber from '@/pages/ContasPagarReceber'
import Relatorios from '@/pages/Relatorios'

function App() {
  useEffect(() => {
    // Inicializar monitoramento de segurança
    integrateSecurityMonitoring()
  }, [])

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/transacoes" element={<AppLayout><Transacoes /></AppLayout>} />
          <Route path="/categorias" element={<AppLayout><Categorias /></AppLayout>} />
          <Route path="/lembretes" element={<AppLayout><Lembretes /></AppLayout>} />
          <Route path="/perfil" element={<AppLayout><Perfil /></AppLayout>} />
          <Route path="/plano" element={<AppLayout><Plano /></AppLayout>} />
          <Route path="/security" element={<AppLayout><SecurityDashboardPage /></AppLayout>} />
          <Route path="/contas" element={<AppLayout><ContasPagarReceber /></AppLayout>} />
          <Route path="/relatorios" element={<AppLayout><Relatorios /></AppLayout>} />
        </Routes>
      </Router>
      <Toaster />
    </AuthProvider>
  )
}

export default App
