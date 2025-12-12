'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  Contact,
  DollarSign,
  FileText,
  Bell,
  MessageSquare,
  ListTodo,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Scale
} from 'lucide-react'

// Import page components
import WorkspacePage from './pages/WorkspacePage'
import ClientsPage from './pages/ClientsPage'
import ProcessesPage from './pages/ProcessesPage'
import ContactsPage from './pages/ContactsPage'
import FinancialPage from './pages/FinancialPage'
import DocumentsPage from './pages/DocumentsPage'
import PublicationsPage from './pages/PublicationsPage'
import AppointmentsPage from './pages/AppointmentsPage'

const menuItems = [
  { id: 'workspace', label: 'Área de Trabalho', icon: LayoutDashboard },
  { id: 'clients', label: 'Clientes', icon: Users },
  { id: 'processes', label: 'Processos e Serviços', icon: FolderOpen },
  { id: 'contacts', label: 'Contatos', icon: Contact },
  { id: 'financial', label: 'Financeiro', icon: DollarSign },
  { id: 'documents', label: 'Documentos', icon: FileText },
  { id: 'publications', label: 'Publicações', icon: Bell },
  { id: 'appointments', label: 'Atendimentos', icon: MessageSquare },
]

export default function Dashboard({ user, onLogout }) {
  const [activePage, setActivePage] = useState('workspace')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      toast.success('Logout realizado com sucesso')
      onLogout()
    } catch (error) {
      toast.error('Erro ao fazer logout')
    }
  }

  const renderPage = () => {
    switch (activePage) {
      case 'workspace':
        return <WorkspacePage user={user} />
      case 'clients':
        return <ClientsPage user={user} />
      case 'processes':
        return <ProcessesPage user={user} />
      case 'contacts':
        return <ContactsPage user={user} />
      case 'financial':
        return <FinancialPage user={user} />
      case 'documents':
        return <DocumentsPage user={user} />
      case 'publications':
        return <PublicationsPage user={user} />
      case 'appointments':
        return <AppointmentsPage user={user} />
      default:
        return <WorkspacePage user={user} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        ${sidebarOpen ? 'w-64' : 'w-20'}
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        bg-white border-r border-gray-200 sidebar-transition flex flex-col
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <img 
              src="https://scontent-lga3-2.xx.fbcdn.net/v/t39.30808-1/307700140_406083285043103_8268899551734355004_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=107&ccb=1-7&_nc_sid=2d3e12&_nc_ohc=ppHwvRrn6ccQ7kNvwHGM--j&_nc_oc=AdmEmiVqDD4lj0ynEkvdUs2o-lTGvyXWhinBnL9XdJHHgW7CmX5Fiiqv0Ebz8v4RrhELfdFq9Voz7prZzZjTdXWQ&_nc_zt=24&_nc_ht=scontent-lga3-2.xx&_nc_gid=HXas92DwTKM-m7o2RcwExw&oh=00_Afkq7tptgorTMePve8dowBWxL8BQGl5NbthHS39cFf_yMQ&oe=69426412" 
              alt="Guedes & Silva"
              className="w-10 h-10 rounded-full object-cover"
              onError={(e) => {
                e.target.onerror = null
                e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%233b82f6"><rect width="24" height="24" rx="12"/><text x="12" y="16" text-anchor="middle" fill="white" font-size="10">GS</text></svg>'
              }}
            />
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-gray-900 text-sm">Guedes & Silva</h1>
                <p className="text-xs text-gray-500">Advocacia</p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <ChevronRight className={`h-4 w-4 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="px-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = activePage === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePage(item.id)
                    setMobileMenuOpen(false)
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                    transition-colors
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                  {sidebarOpen && <span>{item.label}</span>}
                </button>
              )
            })}
          </nav>
        </ScrollArea>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-700 font-semibold text-sm">
                {user?.user_metadata?.name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.user_metadata?.name || 'Advogado'}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            className={`${sidebarOpen ? 'w-full' : 'w-10 p-0'} text-red-600 border-red-200 hover:bg-red-50`}
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            {sidebarOpen && <span className="ml-2">Sair</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-semibold text-gray-900">
              {menuItems.find(item => item.id === activePage)?.label || 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-6">
          {renderPage()}
        </div>
      </main>
    </div>
  )
}
