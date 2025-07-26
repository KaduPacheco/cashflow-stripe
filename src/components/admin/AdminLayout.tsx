
import { Outlet } from 'react-router-dom'
import { AdminSidebar } from './AdminSidebar'
import { AdminHeader } from './AdminHeader'
import { useAdmin } from '@/hooks/useAdmin'
import { useEffect } from 'react'

export function AdminLayout() {
  const { logAdminAction } = useAdmin()

  useEffect(() => {
    logAdminAction('admin_panel_access', { timestamp: new Date().toISOString() })
  }, [logAdminAction])

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="flex h-screen">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <AdminHeader />
          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
