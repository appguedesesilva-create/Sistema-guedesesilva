'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Plus, Search, FolderOpen, Edit, Trash2, Eye, Scale, FileText, Briefcase } from 'lucide-react'

export default function ProcessesPage({ user }) {
  const [processes, setProcesses] = useState([])
  const [services, setServices] = useState([])
  const [clients, setClients] = useState([])
  const [lawyers, setLawyers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('judicial')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [formType, setFormType] = useState('judicial')
  
  const [processForm, setProcessForm] = useState({
    type: 'judicial',
    number: '',
    client_id: '',
    phase: '',
    subject: '',
    details: '',
    lawyer_id: '',
    court: '',
    judge: ''
  })

  const [serviceForm, setServiceForm] = useState({
    nature: '',
    details: '',
    client_id: '',
    lawyer_id: '',
    status: 'pending'
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [processesRes, servicesRes, clientsRes, lawyersRes] = await Promise.all([
        fetch('/api/processes'),
        fetch('/api/services'),
        fetch('/api/clients'),
        fetch('/api/lawyers')
      ])

      if (processesRes.ok) setProcesses(await processesRes.json())
      if (servicesRes.ok) setServices(await servicesRes.json())
      if (clientsRes.ok) setClients(await clientsRes.json())
      if (lawyersRes.ok) setLawyers(await lawyersRes.json())
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProcessSubmit = async (e) => {
    e.preventDefault()
    try {
      const url = selectedItem ? `/api/processes/${selectedItem.id}` : '/api/processes'
      const method = selectedItem ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...processForm,
          lawyer_id: processForm.lawyer_id || user.id
        })
      })

      if (response.ok) {
        toast.success(selectedItem ? 'Processo atualizado!' : 'Processo cadastrado!')
        setIsDialogOpen(false)
        resetForms()
        fetchData()
      }
    } catch (error) {
      toast.error('Erro ao salvar processo')
    }
  }

  const handleServiceSubmit = async (e) => {
    e.preventDefault()
    try {
      const url = selectedItem ? `/api/services/${selectedItem.id}` : '/api/services'
      const method = selectedItem ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...serviceForm,
          lawyer_id: serviceForm.lawyer_id || user.id
        })
      })

      if (response.ok) {
        toast.success(selectedItem ? 'Serviço atualizado!' : 'Serviço cadastrado!')
        setIsDialogOpen(false)
        resetForms()
        fetchData()
      }
    } catch (error) {
      toast.error('Erro ao salvar serviço')
    }
  }

  const handleDelete = async (id, type) => {
    if (!confirm('Tem certeza que deseja excluir?')) return

    try {
      const endpoint = type === 'service' ? 'services' : 'processes'
      const response = await fetch(`/api/${endpoint}/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Excluído com sucesso!')
        fetchData()
      }
    } catch (error) {
      toast.error('Erro ao excluir')
    }
  }

  const resetForms = () => {
    setSelectedItem(null)
    setProcessForm({
      type: 'judicial',
      number: '',
      client_id: '',
      phase: '',
      subject: '',
      details: '',
      lawyer_id: '',
      court: '',
      judge: ''
    })
    setServiceForm({
      nature: '',
      details: '',
      client_id: '',
      lawyer_id: '',
      status: 'pending'
    })
  }

  const openNewDialog = (type) => {
    resetForms()
    setFormType(type)
    setProcessForm(prev => ({ ...prev, type }))
    setIsDialogOpen(true)
  }

  const filteredProcesses = processes.filter(p => 
    p.type === activeTab &&
    (p.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     p.subject?.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const filteredServices = services.filter(s =>
    s.nature?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getPhaseColor = (phase) => {
    const colors = {
      'initial': 'bg-blue-100 text-blue-700',
      'in_progress': 'bg-yellow-100 text-yellow-700',
      'judgment': 'bg-purple-100 text-purple-700',
      'appeal': 'bg-orange-100 text-orange-700',
      'closed': 'bg-gray-100 text-gray-700',
      'won': 'bg-green-100 text-green-700',
      'lost': 'bg-red-100 text-red-700'
    }
    return colors[phase] || 'bg-gray-100 text-gray-700'
  }

  const getPhaseLabel = (phase) => {
    const labels = {
      'initial': 'Inicial',
      'in_progress': 'Em Andamento',
      'judgment': 'Julgamento',
      'appeal': 'Recurso',
      'closed': 'Arquivado',
      'won': 'Ganho',
      'lost': 'Perdido'
    }
    return labels[phase] || phase
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por número ou assunto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={() => openNewDialog('judicial')} variant="outline">
            <Scale className="h-4 w-4 mr-2" />
            Processo Judicial
          </Button>
          <Button onClick={() => openNewDialog('administrative')} variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Processo Administrativo
          </Button>
          <Button onClick={() => { setFormType('service'); setIsDialogOpen(true) }}>
            <Briefcase className="h-4 w-4 mr-2" />
            Serviço
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="judicial">Processos Judiciais</TabsTrigger>
          <TabsTrigger value="administrative">Processos Administrativos</TabsTrigger>
          <TabsTrigger value="services">Serviços</TabsTrigger>
        </TabsList>

        <TabsContent value="judicial" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Processos Judiciais</CardTitle>
              <CardDescription>{filteredProcesses.length} processos encontrados</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-gray-500">Carregando...</div>
              ) : filteredProcesses.length === 0 ? (
                <div className="text-center py-8">
                  <Scale className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-gray-500">Nenhum processo judicial encontrado</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredProcesses.map((process) => (
                    <ProcessCard
                      key={process.id}
                      process={process}
                      onEdit={() => {
                        setSelectedItem(process)
                        setProcessForm(process)
                        setFormType('judicial')
                        setIsDialogOpen(true)
                      }}
                      onDelete={() => handleDelete(process.id, 'process')}
                      getPhaseColor={getPhaseColor}
                      getPhaseLabel={getPhaseLabel}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="administrative" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Processos Administrativos</CardTitle>
              <CardDescription>{processes.filter(p => p.type === 'administrative').length} processos encontrados</CardDescription>
            </CardHeader>
            <CardContent>
              {processes.filter(p => p.type === 'administrative').length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-gray-500">Nenhum processo administrativo encontrado</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {processes.filter(p => p.type === 'administrative').map((process) => (
                    <ProcessCard
                      key={process.id}
                      process={process}
                      onEdit={() => {
                        setSelectedItem(process)
                        setProcessForm(process)
                        setFormType('administrative')
                        setIsDialogOpen(true)
                      }}
                      onDelete={() => handleDelete(process.id, 'process')}
                      getPhaseColor={getPhaseColor}
                      getPhaseLabel={getPhaseLabel}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Serviços Extrajudiciais</CardTitle>
              <CardDescription>{filteredServices.length} serviços encontrados</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredServices.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-gray-500">Nenhum serviço encontrado</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredServices.map((service) => (
                    <div key={service.id} className="p-4 rounded-lg border bg-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{service.nature}</h4>
                          <p className="text-sm text-gray-500">{service.details}</p>
                          {service.client_name && (
                            <p className="text-xs text-gray-400 mt-1">Cliente: {service.client_name}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={service.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                            {service.status === 'completed' ? 'Concluído' : 'Pendente'}
                          </Badge>
                          <Button variant="ghost" size="icon" onClick={() => {
                            setSelectedItem(service)
                            setServiceForm(service)
                            setFormType('service')
                            setIsDialogOpen(true)
                          }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(service.id, 'service')}>
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
        </TabsContent>
      </Tabs>

      {/* Dialog for Process/Service */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open)
        if (!open) resetForms()
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {formType === 'service' 
                ? (selectedItem ? 'Editar Serviço' : 'Novo Serviço')
                : (selectedItem ? 'Editar Processo' : `Novo Processo ${formType === 'judicial' ? 'Judicial' : 'Administrativo'}`)}
            </DialogTitle>
          </DialogHeader>

          {formType === 'service' ? (
            <form onSubmit={handleServiceSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Natureza do Serviço *</Label>
                <Input
                  value={serviceForm.nature}
                  onChange={(e) => setServiceForm({ ...serviceForm, nature: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Detalhes</Label>
                <Textarea
                  value={serviceForm.details}
                  onChange={(e) => setServiceForm({ ...serviceForm, details: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cliente</Label>
                  <Select
                    value={serviceForm.client_id}
                    onValueChange={(value) => setServiceForm({ ...serviceForm, client_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
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
                  <Label>Status</Label>
                  <Select
                    value={serviceForm.status}
                    onValueChange={(value) => setServiceForm({ ...serviceForm, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">{selectedItem ? 'Atualizar' : 'Cadastrar'}</Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleProcessSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Número do Processo *</Label>
                  <Input
                    value={processForm.number}
                    onChange={(e) => setProcessForm({ ...processForm, number: e.target.value })}
                    placeholder="0000000-00.0000.0.00.0000"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cliente</Label>
                  <Select
                    value={processForm.client_id}
                    onValueChange={(value) => setProcessForm({ ...processForm, client_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
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
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fase Processual</Label>
                  <Select
                    value={processForm.phase}
                    onValueChange={(value) => setProcessForm({ ...processForm, phase: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="initial">Inicial</SelectItem>
                      <SelectItem value="in_progress">Em Andamento</SelectItem>
                      <SelectItem value="judgment">Julgamento</SelectItem>
                      <SelectItem value="appeal">Recurso</SelectItem>
                      <SelectItem value="closed">Arquivado</SelectItem>
                      <SelectItem value="won">Ganho</SelectItem>
                      <SelectItem value="lost">Perdido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Vara/Tribunal</Label>
                  <Input
                    value={processForm.court}
                    onChange={(e) => setProcessForm({ ...processForm, court: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Objeto da Ação</Label>
                <Input
                  value={processForm.subject}
                  onChange={(e) => setProcessForm({ ...processForm, subject: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Detalhes do Caso</Label>
                <Textarea
                  value={processForm.details}
                  onChange={(e) => setProcessForm({ ...processForm, details: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">{selectedItem ? 'Atualizar' : 'Cadastrar'}</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ProcessCard({ process, onEdit, onDelete, getPhaseColor, getPhaseLabel }) {
  return (
    <div className="p-4 rounded-lg border bg-white">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-900">{process.number}</h4>
            {process.phase && (
              <Badge className={getPhaseColor(process.phase)}>
                {getPhaseLabel(process.phase)}
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">{process.subject}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
            {process.client_name && <span>Cliente: {process.client_name}</span>}
            {process.court && <span>Vara: {process.court}</span>}
            {process.updated_at && (
              <span>Atualizado: {new Date(process.updated_at).toLocaleDateString('pt-BR')}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>
    </div>
  )
}
