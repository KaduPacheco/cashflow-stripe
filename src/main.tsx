import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { AuthProvider } from '@/hooks/useAuth'
import { AppLayout } from '@/components/layout/AppLayout'
import Dashboard from '@/pages/Dashboard'
import TransactionsPage from '@/pages/TransactionsPage'
import CategoriesPage from '@/pages/CategoriesPage'
import RemindersPage from '@/pages/RemindersPage'
import ProfilePage from '@/pages/ProfilePage'
import SubscriptionPage from '@/pages/SubscriptionPage'
import SecurityDashboardPage from '@/pages/SecurityDashboardPage'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout><Dashboard /></AppLayout>,
  },
  {
    path: "/transacoes",
    element: <AppLayout><TransactionsPage /></AppLayout>,
  },
  {
    path: "/categorias",
    element: <AppLayout><CategoriesPage /></AppLayout>,
  },
  {
    path: "/lembretes",
    element: <AppLayout><RemindersPage /></AppLayout>,
  },
  {
    path: "/perfil",
    element: <AppLayout><ProfilePage /></AppLayout>,
  },
  {
    path: "/assinatura",
    element: <AppLayout><SubscriptionPage /></AppLayout>,
  },
  {
    path: "/security",
    element: <AppLayout><SecurityDashboardPage /></AppLayout>,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
)
