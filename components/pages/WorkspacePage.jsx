'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import {
  Plus,
  Users,
  FolderOpen,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Edit,
  Trash2,
  Archive,
  MoreHorizontal,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Scale,
  Briefcase,
  FileText,
  Bell
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, Area, AreaChart } from 'recharts'

const TASK_TYPES = [
  { value: 'judicial', label: 'Judicial' },
  { value: 'extrajudicial', label: 'Extrajudicial' },
  { value: 'administrative', label: 'Administrativa' },
  { value: 'other', label: 'Outras' }
]

const JUDICIAL_AREAS = [
  { value: 'previdenciario', label: 'Previdenciário' },
  { value: 'trabalhista', label: 'Trabalhista' },
  { value: 'saude', label: 'Saúde' },
  { value: 'familia', label: 'Família' },
  { value: 'criminal', label: 'Criminal' },
  { value: 'consumidor', label: 'Consumidor' },
  { value: 'empresarial', label: 'Empresarial' },
  { value: 'civel', label: 'Cível' },
  { value: 'tributario', label: 'Tributário' },
  { value: 'ambiental', label: 'Ambiental' },
  { value: 'eleitoral', label: 'Eleitoral' },
  { value: 'digital', label: 'Digital/Tecnológico' },
  { value: 'juizado', label: 'Juizado Especial' },
  { value: 'outro', label: 'Outro' }
]

export default function WorkspacePage({ user }) {
  const [tasks, setTasks] = useState([])
  const [clients, setClients] = useState([])
  const [processes, setProcesses] = useState([])
  const [lawyers, setLawyers] = useState([])
  const [stats, setStats] = useState({
    totalProcesses: 0,
    judicialProcesses: 0,
    administrativeProcesses: 0,
    extraJudicialServices: 0,
    totalClients: 0,
    contractValues: 0,
    receivedValues: 0,
    pendingValues: 0
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [showArchived, setShowArchived] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    type: 'judicial',
    judicial_area: '',
    client_id: '',
    process_id: '',
    due_date: '',
    priority: 'medium',
    responsible_id: '',
    responsible_name: ''
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [tasksRes, clientsRes, processesRes, statsRes, lawyersRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/clients'),
        fetch('/api/processes'),
        fetch('/api/stats'),
        fetch('/api/lawyers')
      ])

      if (tasksRes.ok) {
        const data = await tasksRes.json()
        setTasks(data)
      }
      if (clientsRes.ok) {
        const data = await clientsRes.json()
        setClients(data)
      }
      if (processesRes.ok) {
        const data = await processesRes.json()
        setProcesses(data)
      }
      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data)
      }
      if (lawyersRes.ok) {
        const data = await lawyersRes.json()
        setLawyers(data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()
    try {
      const url = editingTask ? `/api/tasks/${editingTask.id}` : '/api/tasks'
      const method = editingTask ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTask,
          lawyer_id: user.id
        })
      })

      if (response.ok) {
        toast.success(editingTask ? 'Tarefa atualizada!' : 'Tarefa criada com sucesso!')
        setIsDialogOpen(false)
        resetForm()
        fetchData()
      } else {
        throw new Error('Failed to save task')
      }
    } catch (error) {
      toast.error('Erro ao salvar tarefa')
    }
  }

  const resetForm = () => {
    setEditingTask(null)
    setNewTask({
      title: '',
      description: '',
      type: 'judicial',
      judicial_area: '',
      client_id: '',
      process_id: '',
      due_date: '',
      priority: 'medium',
      responsible_id: '',
      responsible_name: ''
    })
  }

  const handleEditTask = (task) => {
    setEditingTask(task)
    setNewTask({
      title: task.title || '',
      description: task.description || '',
      type: task.type || 'judicial',
      judicial_area: task.judicial_area || '',
      client_id: task.client_id || '',
      process_id: task.process_id || '',
      due_date: task.due_date || '',
      priority: task.priority || 'medium',
      responsible_id: task.responsible_id || '',
      responsible_name: task.responsible_name || ''
    })
    setIsDialogOpen(true)
  }

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        toast.success('Tarefa excluída!')
        fetchData()
      }
    } catch (error) {
      toast.error('Erro ao excluir tarefa')
    }
  }

  const handleArchiveTask = async (taskId) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived: true })
      })
      if (response.ok) {
        toast.success('Tarefa arquivada!')
        fetchData()
      }
    } catch (error) {
      toast.error('Erro ao arquivar tarefa')
    }
  }

  const toggleTaskComplete = async (taskId, completed) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed })
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      toast.error('Erro ao atualizar tarefa')
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      case 'low': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'judicial': return 'bg-blue-100 text-blue-700'
      case 'extrajudicial': return 'bg-purple-100 text-purple-700'
      case 'administrative': return 'bg-orange-100 text-orange-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0)
  }

  const filteredTasks = tasks.filter(task => showArchived ? task.archived : !task.archived)

  // Dados para gráficos
  const processChartData = [
    { name: 'Judiciais', value: stats.judicialProcesses, color: '#3b82f6' },
    { name: 'Administrativos', value: stats.administrativeProcesses, color: '#f97316' },
    { name: 'Extrajudiciais', value: stats.extraJudicialServices, color: '#8b5cf6' }
  ]

  const financialChartData = [
    { name: 'Jan', entradas: 4500, saidas: 1200 },
    { name: 'Fev', entradas: 3800, saidas: 1100 },
    { name: 'Mar', entradas: 5200, saidas: 1500 },
    { name: 'Abr', entradas: 4100, saidas: 900 },
    { name: 'Mai', entradas: 6300, saidas: 1800 },
    { name: 'Jun', entradas: 5800, saidas: 1400 }
  ]

  // Tarefas vencendo/vencidas
  const today = new Date()
  const overdueTasks = tasks.filter(t => !t.completed && t.due_date && new Date(t.due_date) < today)
  const upcomingTasks = tasks.filter(t => !t.completed && t.due_date && new Date(t.due_date) >= today && new Date(t.due_date) <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000))

  return (
    <div className="space-y-6">
      {/* Stats Cards - Design Moderno */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total de Processos */}
        <Card className="overflow-hidden border-0 shadow-lg">
          <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total de Processos</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalProcesses}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="flex items-center text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                    <Scale className="h-3 w-3 mr-1" />
                    {stats.judicialProcesses} Judiciais
                  </span>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                <FolderOpen className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clientes */}
        <Card className="overflow-hidden border-0 shadow-lg">
          <div className="h-1 bg-gradient-to-r from-emerald-500 to-emerald-600"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Clientes Cadastrados</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalClients}</p>
                <div className="flex items-center mt-2 text-emerald-600 text-sm">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>Ativos</span>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg">
                <Users className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Valores em Contratos */}
        <Card className="overflow-hidden border-0 shadow-lg">
          <div className="h-1 bg-gradient-to-r from-purple-500 to-purple-600"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Valores em Contratos</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(stats.contractValues)}</p>
                <div className="flex items-center mt-2 text-green-600 text-sm">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span>Recebido: {formatCurrency(stats.receivedValues)}</span>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg">
                <DollarSign className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* A Receber */}
        <Card className="overflow-hidden border-0 shadow-lg">
          <div className="h-1 bg-gradient-to-r from-amber-500 to-amber-600"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">A Receber</p>
                <p className="text-3xl font-bold text-amber-600 mt-1">{formatCurrency(stats.pendingValues)}</p>
                <div className="flex items-center mt-2 text-gray-500 text-sm">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Pendentes</span>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl shadow-lg">
                <Clock className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Gráficos e Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Processos */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Distribuição de Processos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={processChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {processChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {processChartData.map((item, index) => (
                <div key={index} className="flex items-center gap-1 text-xs">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Gráfico Financeiro */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Fluxo Financeiro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={financialChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <Tooltip />
                  <Area type="monotone" dataKey="entradas" stackId="1" stroke="#10b981" fill="#10b98133" />
                  <Area type="monotone" dataKey="saidas" stackId="2" stroke="#ef4444" fill="#ef444433" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Painel de Alertas */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Bell className="h-4 w-4 text-amber-500" />
              Alertas e Prazos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {overdueTasks.length > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium text-sm">{overdueTasks.length} tarefa(s) vencida(s)</span>
                </div>
                <ul className="mt-2 space-y-1">
                  {overdueTasks.slice(0, 3).map((task, i) => (
                    <li key={i} className="text-xs text-red-600 truncate">• {task.title}</li>
                  ))}
                </ul>
              </div>
            )}
            {upcomingTasks.length > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2 text-amber-700">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium text-sm">{upcomingTasks.length} tarefa(s) esta semana</span>
                </div>
                <ul className="mt-2 space-y-1">
                  {upcomingTasks.slice(0, 3).map((task, i) => (
                    <li key={i} className="text-xs text-amber-600 truncate">• {task.title}</li>
                  ))}
                </ul>
              </div>
            )}
            {overdueTasks.length === 0 && upcomingTasks.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                <CheckCircle2 className="h-8 w-8 mx-auto text-green-500 mb-2" />
                <p className="text-sm">Nenhum prazo urgente</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tasks Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Tarefas</CardTitle>
            <CardDescription>Gerencie suas tarefas e atividades</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowArchived(!showArchived)}>
              <Archive className="h-4 w-4 mr-2" />
              {showArchived ? 'Ver Ativas' : 'Ver Arquivadas'}
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open)
              if (!open) resetForm()
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Tarefa
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingTask ? 'Editar Tarefa' : 'Criar Nova Tarefa'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateTask} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Título *</Label>
                    <Input
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      placeholder="Título da tarefa"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Textarea
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      placeholder="Descrição detalhada da tarefa"
                      rows={4}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tipo *</Label>
                      <Select
                        value={newTask.type}
                        onValueChange={(value) => setNewTask({ ...newTask, type: value, judicial_area: '' })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TASK_TYPES.map(type => (
                            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {newTask.type === 'judicial' && (
                      <div className="space-y-2">
                        <Label>Área Judicial</Label>
                        <Select
                          value={newTask.judicial_area}
                          onValueChange={(value) => setNewTask({ ...newTask, judicial_area: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a área" />
                          </SelectTrigger>
                          <SelectContent>
                            {JUDICIAL_AREAS.map(area => (
                              <SelectItem key={area.value} value={area.value}>{area.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Prioridade</Label>
                      <Select
                        value={newTask.priority}
                        onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Baixa</SelectItem>
                          <SelectItem value="medium">Média</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Prazo de Cumprimento</Label>
                      <Input
                        type="datetime-local"
                        value={newTask.due_date}
                        onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Responsável</Label>
                      <Select
                        value={newTask.responsible_id}
                        onValueChange={(value) => {
                          const lawyer = lawyers.find(l => l.id === value)
                          setNewTask({ 
                            ...newTask, 
                            responsible_id: value,
                            responsible_name: lawyer?.name || ''
                          })
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o responsável" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhum</SelectItem>
                          {lawyers.map((lawyer) => (
                            <SelectItem key={lawyer.id} value={lawyer.id}>
                              {lawyer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Ou digite o nome</Label>
                      <Input
                        value={newTask.responsible_name}
                        onChange={(e) => setNewTask({ ...newTask, responsible_name: e.target.value })}
                        placeholder="Nome do responsável"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Cliente (opcional)</Label>
                      <Select
                        value={newTask.client_id}
                        onValueChange={(value) => setNewTask({ ...newTask, client_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhum</SelectItem>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Processo (opcional)</Label>
                      <Select
                        value={newTask.process_id}
                        onValueChange={(value) => setNewTask({ ...newTask, process_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhum</SelectItem>
                          {processes.map((process) => (
                            <SelectItem key={process.id} value={process.id}>
                              {process.number || process.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => {
                      setIsDialogOpen(false)
                      resetForm()
                    }}>
                      Cancelar
                    </Button>
                    <Button type="submit">{editingTask ? 'Salvar Alterações' : 'Criar Tarefa'}</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Carregando...</div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500">{showArchived ? 'Nenhuma tarefa arquivada' : 'Nenhuma tarefa cadastrada'}</p>
              <p className="text-sm text-gray-400">Clique em "Nova Tarefa" para começar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-4 rounded-lg border ${task.completed ? 'bg-gray-50 opacity-60' : 'bg-white'}`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => toggleTaskComplete(task.id, task.completed)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className={`font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                          {task.title}
                        </h4>
                        <Badge className={getTypeColor(task.type)}>
                          {task.type === 'judicial' ? 'Judicial' :
                           task.type === 'extrajudicial' ? 'Extrajudicial' :
                           task.type === 'administrative' ? 'Administrativa' : 'Outras'}
                        </Badge>
                        {task.judicial_area && (
                          <Badge variant="outline">
                            {JUDICIAL_AREAS.find(a => a.value === task.judicial_area)?.label || task.judicial_area}
                          </Badge>
                        )}
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority === 'high' ? 'Alta' :
                           task.priority === 'medium' ? 'Média' : 'Baixa'}
                        </Badge>
                      </div>
                      {task.description && (
                        <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        {task.due_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(task.due_date).toLocaleString('pt-BR')}
                          </span>
                        )}
                        {task.client_name && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {task.client_name}
                          </span>
                        )}
                        {task.responsible_name && (
                          <span className="flex items-center gap-1 text-blue-600">
                            Responsável: {task.responsible_name}
                          </span>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditTask(task)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleArchiveTask(task.id)}>
                          <Archive className="h-4 w-4 mr-2" />
                          Arquivar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteTask(task.id)} className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
