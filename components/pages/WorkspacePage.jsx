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
  Calendar
} from 'lucide-react'

export default function WorkspacePage({ user }) {
  const [tasks, setTasks] = useState([])
  const [clients, setClients] = useState([])
  const [processes, setProcesses] = useState([])
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
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    type: 'judicial',
    client_id: '',
    process_id: '',
    due_date: '',
    priority: 'medium'
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [tasksRes, clientsRes, processesRes, statsRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/clients'),
        fetch('/api/processes'),
        fetch('/api/stats')
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
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTask,
          lawyer_id: user.id
        })
      })

      if (response.ok) {
        toast.success('Tarefa criada com sucesso!')
        setIsDialogOpen(false)
        setNewTask({
          title: '',
          description: '',
          type: 'judicial',
          client_id: '',
          process_id: '',
          due_date: '',
          priority: 'medium'
        })
        fetchData()
      } else {
        throw new Error('Failed to create task')
      }
    } catch (error) {
      toast.error('Erro ao criar tarefa')
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

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total de Processos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProcesses}</p>
                <div className="flex gap-2 mt-1">
                  <span className="text-xs text-blue-600">Judiciais: {stats.judicialProcesses}</span>
                  <span className="text-xs text-orange-600">Adm: {stats.administrativeProcesses}</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FolderOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Clientes Cadastrados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalClients}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Valores em Contratos</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.contractValues)}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">A Receber</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.pendingValues)}</p>
                <p className="text-xs text-gray-500">Recebido: {formatCurrency(stats.receivedValues)}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
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
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Tarefa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Criar Nova Tarefa</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div className="space-y-2">
                  <Label>Título</Label>
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
                    placeholder="Descrição da tarefa"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select
                      value={newTask.type}
                      onValueChange={(value) => setNewTask({ ...newTask, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="judicial">Judicial</SelectItem>
                        <SelectItem value="extrajudicial">Extrajudicial</SelectItem>
                        <SelectItem value="administrative">Administrativa</SelectItem>
                        <SelectItem value="other">Outras</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                <div className="space-y-2">
                  <Label>Data de Vencimento</Label>
                  <Input
                    type="date"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Criar Tarefa</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Carregando...</div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500">Nenhuma tarefa cadastrada</p>
              <p className="text-sm text-gray-400">Clique em "Nova Tarefa" para começar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
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
                            {new Date(task.due_date).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                        {task.client_name && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {task.client_name}
                          </span>
                        )}
                      </div>
                    </div>
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
