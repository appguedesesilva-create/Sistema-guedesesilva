'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
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
  Moon,
  Settings,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

// Import page components
import WorkspacePage from './pages/WorkspacePage'
import ClientsPage from './pages/ClientsPage'
import ProcessesPage from './pages/ProcessesPage'
import ContactsPage from './pages/ContactsPage'
import FinancialPage from './pages/FinancialPage'
import DocumentsPage from './pages/DocumentsPage'
import PublicationsPage from './pages/PublicationsPage'
import AppointmentsPage from './pages/AppointmentsPage'
import SettingsPage from './pages/SettingsPage'

const LOGO_URL = '/logo.png'

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
  const [notifications, setNotifications] = useState([])
  const [notificationOpen, setNotificationOpen] = useState(false)

  // Carregar notificações/alertas
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const [tasksRes, paymentsRes] = await Promise.all([
          fetch('/api/tasks'),
          fetch('/api/payments')
        ])
        
        const tasks = tasksRes.ok ? await tasksRes.json() : []
        const payments = paymentsRes.ok ? await paymentsRes.json() : []
        
        const alerts = []
        const today = new Date()
        
        // Tarefas vencidas
        const overdueTasks = tasks.filter(t => !t.completed && t.due_date && new Date(t.due_date) < today)
        if (overdueTasks.length > 0) {
          alerts.push({
            id: 'overdue',
            type: 'warning',
            title: 'Tarefas Vencidas',
            message: `Você tem ${overdueTasks.length} tarefa(s) vencida(s)`,
            icon: AlertTriangle
          })
        }
        
        // Pagamentos pendentes
        const pendingPayments = payments.filter(p => p.status === 'pending')
        if (pendingPayments.length > 0) {
          alerts.push({
            id: 'payments',
            type: 'info',
            title: 'Pagamentos Pendentes',
            message: `${pendingPayments.length} pagamento(s) aguardando confirmação`,
            icon: DollarSign
          })
        }
        
        setNotifications(alerts)
      } catch (error) {
        console.error('Error fetching notifications:', error)
      }
    }
    
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 60000) // Atualizar a cada minuto
    return () => clearInterval(interval)
  }, [])

  // Persistir tema
  useEffect(() => {
    const savedTheme = localStorage.getItem('gs-theme')
    if (savedTheme === 'dark') {
      setDarkMode(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    if (!darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('gs-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('gs-theme', 'light')
    }
  }

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
      case 'settings':
        return <SettingsPage user={user} darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />
      default:
        return <WorkspacePage user={user} />
    }
  }

  return (
    <div className={`min-h-screen flex ${darkMode ? 'dark' : ''}`}>
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        ${sidebarOpen ? 'w-64' : 'w-20'}
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white
        sidebar-transition flex flex-col shadow-2xl
      `}>
        {/* Logo */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/10 flex items-center justify-center shadow-lg ring-2 ring-white/20">
              <img 
                src={LOGO_URL}
                alt="Guedes & Silva"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%231e293b" width="100" height="100" rx="20"/><text x="50" y="60" text-anchor="middle" fill="white" font-size="30" font-weight="bold">GS</text></svg>'
                }}
              />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-white text-lg tracking-tight">Guedes & Silva</h1>
                <p className="text-xs text-slate-400">Advocacia</p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex text-white hover:bg-slate-700/50"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <ChevronRight className={`h-4 w-4 transition-transform duration-300 ${sidebarOpen ? 'rotate-180' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-white hover:bg-slate-700/50"
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
                    transition-all duration-200 group
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25' 
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : ''}`} />
                  {sidebarOpen && <span>{item.label}</span>}
                </button>
              )
            })}
          </nav>
        </ScrollArea>

        {/* User Info & Actions */}
        <div className="p-4 border-t border-slate-700/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-semibold text-sm">
                {user?.user_metadata?.name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.user_metadata?.name || 'Advogado'}
                </p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={`${sidebarOpen ? 'flex-1' : 'w-full'} text-slate-300 hover:bg-slate-700/50 hover:text-white`}
              onClick={toggleDarkMode}
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {sidebarOpen && <span className="ml-2">{darkMode ? 'Claro' : 'Escuro'}</span>}
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className={`${sidebarOpen ? 'w-full' : 'w-10 p-0'} mt-2 text-slate-400 hover:bg-slate-700/50 hover:text-white`}
            onClick={() => {
              setActivePage('settings')
              setMobileMenuOpen(false)
            }}
          >
            <Settings className="h-4 w-4" />
            {sidebarOpen && <span className="ml-2">Configurações</span>}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`${sidebarOpen ? 'w-full' : 'w-10 p-0'} mt-2 text-red-400 hover:bg-red-500/20 hover:text-red-300`}
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            {sidebarOpen && <span className="ml-2">Sair</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 min-w-0 ${darkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
        {/* Top Bar */}
        <header className={`h-16 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border-b flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 shadow-sm`}>
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
              <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Botão de Notificações */}
            <Sheet open={notificationOpen} onOpenChange={setNotificationOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse ring-2 ring-white"></span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-blue-600" />
                    Notificações
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-3">
                  {notifications.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-3" />
                      <p className="text-gray-500">Nenhuma notificação</p>
                    </div>
                  ) : (
                    notifications.map((notif) => {
                      const Icon = notif.icon
                      return (
                        <div 
                          key={notif.id} 
                          className={`p-4 rounded-xl border ${
                            notif.type === 'warning' 
                              ? 'bg-amber-50 border-amber-200' 
                              : 'bg-blue-50 border-blue-200'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${
                              notif.type === 'warning' 
                                ? 'bg-amber-500 text-white' 
                                : 'bg-blue-500 text-white'
                            }`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{notif.title}</p>
                              <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo e Nome no Header */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-slate-800 to-slate-700 rounded-full shadow-lg">
              <div className="w-6 h-6 rounded-full overflow-hidden ring-2 ring-white/20">
                <img src={LOGO_URL} alt="Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-white text-sm font-medium">Guedes & Silva</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className={`p-4 lg:p-6 ${darkMode ? 'bg-slate-900' : 'bg-slate-50'} min-h-[calc(100vh-4rem)]`}>
          {renderPage()}
        </div>
      </main>
    </div>
  )
}
