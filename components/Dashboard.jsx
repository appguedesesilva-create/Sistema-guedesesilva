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
  LogOut,
  Menu,
  X,
  ChevronRight,
  Sun,
  Moon
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

const LOGO_URL = 'https://scontent-lga3-2.xx.fbcdn.net/v/t39.30808-1/307700140_406083285043103_8268899551734355004_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=107&ccb=1-7&_nc_sid=2d3e12&_nc_ohc=ppHwvRrn6ccQ7kNvwHGM--j&_nc_oc=AdmEmiVqDD4lj0ynEkvdUs2o-lTGvyXWhinBnL9XdJHHgW7CmX5Fiiqv0Ebz8v4RrhELfdFq9Voz7prZzZjTdXWQ&_nc_zt=24&_nc_ht=scontent-lga3-2.xx&_nc_gid=HXas92DwTKM-m7o2RcwExw&oh=00_Afkq7tptgorTMePve8dowBWxL8BQGl5NbthHS39cFf_yMQ&oe=69426412'

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
  const [darkMode, setDarkMode] = useState(false)

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
    <div className={`min-h-screen flex ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
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
        bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 text-white
        sidebar-transition flex flex-col shadow-xl
      `}>
        {/* Logo */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-blue-700/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 flex items-center justify-center">
              <img 
                src={LOGO_URL}
                alt="Guedes & Silva"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%233b82f6" width="100" height="100" rx="50"/><text x="50" y="60" text-anchor="middle" fill="white" font-size="30" font-weight="bold">GS</text></svg>'
                }}
              />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-white text-lg">Guedes & Silva</h1>
                <p className="text-xs text-blue-200">Advocacia</p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex text-white hover:bg-blue-700/50"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <ChevronRight className={`h-4 w-4 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-white hover:bg-blue-700/50"
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
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                    transition-all duration-200
                    ${isActive 
                      ? 'bg-white text-blue-900 shadow-lg' 
                      : 'text-blue-100 hover:bg-blue-700/50 hover:text-white'
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-blue-600' : ''}`} />
                  {sidebarOpen && <span>{item.label}</span>}
                </button>
              )
            })}
          </nav>
        </ScrollArea>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-blue-700/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user?.user_metadata?.name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.user_metadata?.name || 'Advogado'}
                </p>
                <p className="text-xs text-blue-200 truncate">{user?.email}</p>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={`${sidebarOpen ? 'flex-1' : 'w-full'} text-white border-blue-500 hover:bg-blue-700/50`}
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {sidebarOpen && <span className="ml-2">{darkMode ? 'Claro' : 'Escuro'}</span>}
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className={`${sidebarOpen ? 'w-full' : 'w-10 p-0'} mt-2 text-red-300 hover:bg-red-500/20 hover:text-red-200`}
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
        <header className={`h-16 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30`}>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {menuItems.find(item => item.id === activePage)?.label || 'Dashboard'}
              </h2>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </Button>
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full">
              <div className="w-6 h-6 rounded-full overflow-hidden">
                <img src={LOGO_URL} alt="Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-white text-sm font-medium">Guedes & Silva</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className={`p-4 lg:p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          {renderPage()}
        </div>
      </main>
    </div>
  )
}
