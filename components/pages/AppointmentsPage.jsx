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
import { toast } from 'sonner'
import { Plus, Search, MessageSquare, User, Calendar, Edit, Trash2, Clock } from 'lucide-react'

export default function AppointmentsPage({ user }) {
  const [appointments, setAppointments] = useState([])
  const [clients, setClients] = useState([])
  const [processes, setProcesses] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    client_id: '',
    process_id: '',
    subject: '',
    notes: '',
    date: '',
    status: 'scheduled'
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [appointmentsRes, clientsRes, processesRes] = await Promise.all([
        fetch('/api/appointments'),
        fetch('/api/clients'),
        fetch('/api/processes')
      ])

      if (appointmentsRes.ok) setAppointments(await appointmentsRes.json())
      if (clientsRes.ok) setClients(await clientsRes.json())
      if (processesRes.ok) setProcesses(await processesRes.json())
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const url = selectedAppointment ? `/api/appointments/${selectedAppointment.id}` : '/api/appointments'
      const method = selectedAppointment ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          lawyer_id: user.id
        })
      })

      if (response.ok) {
        toast.success(selectedAppointment ? 'Atendimento atualizado!' : 'Atendimento registrado!')
        setIsDialogOpen(false)
        resetForm()
        fetchData()
      }
    } catch (error) {
      toast.error('Erro ao salvar atendimento')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este atendimento?')) return
    try {
      const response = await fetch(`/api/appointments/${id}`, { method: 'DELETE' })
      if (response.ok) {
        toast.success('Atendimento excluído!')
        fetchData()
      }
    } catch (error) {
      toast.error('Erro ao excluir atendimento')
    }
  }

  const resetForm = () => {
    setSelectedAppointment(null)
    setFormData({
      client_id: '',
      process_id: '',
      subject: '',
      notes: '',
      date: '',
      status: 'scheduled'
    })
  }

  const getStatusColor = (status) => {
    const colors = {
      'scheduled': 'bg-blue-100 text-blue-700',
      'completed': 'bg-green-100 text-green-700',
      'cancelled': 'bg-red-100 text-red-700'
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const getStatusLabel = (status) => {
    const labels = {
      'scheduled': 'Agendado',
      'completed': 'Concluído',
      'cancelled': 'Cancelado'
    }
    return labels[status] || status
  }

  const filteredAppointments = appointments.filter(apt =>
    apt.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.client_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar atendimentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm() }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Atendimento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{selectedAppointment ? 'Editar Atendimento' : 'Novo Atendimento'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Cliente *</Label>
                <Select
                  value={formData.client_id}
                  onValueChange={(value) => setFormData({ ...formData, client_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
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
                  value={formData.process_id}
                  onValueChange={(value) => setFormData({ ...formData, process_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Vincular a processo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {processes.map((process) => (
                      <SelectItem key={process.id} value={process.id}>
                        {process.number} - {process.subject?.substring(0, 30)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data/Hora</Label>
                  <Input
                    type="datetime-local"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Agendado</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Assunto *</Label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Assunto do atendimento"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Demanda / Observações</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Registre a demanda do cliente..."
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button type="submit">{selectedAppointment ? 'Atualizar' : 'Registrar'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Appointments List */}
      <Card>
        <CardHeader>
          <CardTitle>Atendimentos</CardTitle>
          <CardDescription>{filteredAppointments.length} atendimentos registrados</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-gray-500 py-8">Carregando...</p>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-500">Nenhum atendimento encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map((apt) => (
                <div key={apt.id} className="p-4 rounded-lg border bg-white">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getStatusColor(apt.status)}>
                          {getStatusLabel(apt.status)}
                        </Badge>
                        {apt.date && (
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(apt.date).toLocaleString('pt-BR')}
                          </span>
                        )}
                      </div>
                      <h4 className="font-medium text-gray-900">{apt.subject}</h4>
                      {apt.client_name && (
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <User className="h-3 w-3" />
                          {apt.client_name}
                        </p>
                      )}
                      {apt.notes && (
                        <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                          {apt.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => {
                        setSelectedAppointment(apt)
                        setFormData({
                          client_id: apt.client_id || '',
                          process_id: apt.process_id || '',
                          subject: apt.subject || '',
                          notes: apt.notes || '',
                          date: apt.date || '',
                          status: apt.status || 'scheduled'
                        })
                        setIsDialogOpen(true)
                      }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(apt.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
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
