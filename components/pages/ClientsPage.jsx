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
import { Plus, Search, User, Phone, Mail, MapPin, Edit, Trash2, Eye } from 'lucide-react'

export default function ClientsPage({ user }) {
  const [clients, setClients] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
  const [viewMode, setViewMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    rg: '',
    cpf: '',
    birth_date: '',
    rg_expedition: '',
    voter_id: '',
    gov_br_password: '',
    profession: '',
    gender: '',
    notes: ''
  })

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients')
      if (response.ok) {
        const data = await response.json()
        setClients(data)
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const url = selectedClient ? `/api/clients/${selectedClient.id}` : '/api/clients'
      const method = selectedClient ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          lawyer_id: user.id
        })
      })

      if (response.ok) {
        toast.success(selectedClient ? 'Cliente atualizado!' : 'Cliente cadastrado!')
        setIsDialogOpen(false)
        resetForm()
        fetchClients()
      } else {
        throw new Error('Failed to save client')
      }
    } catch (error) {
      toast.error('Erro ao salvar cliente')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return

    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Cliente excluído!')
        fetchClients()
      }
    } catch (error) {
      toast.error('Erro ao excluir cliente')
    }
  }

  const handleEdit = (client) => {
    setSelectedClient(client)
    setFormData({
      name: client.name || '',
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      rg: client.rg || '',
      cpf: client.cpf || '',
      birth_date: client.birth_date || '',
      rg_expedition: client.rg_expedition || '',
      voter_id: client.voter_id || '',
      gov_br_password: client.gov_br_password || '',
      profession: client.profession || '',
      gender: client.gender || '',
      notes: client.notes || ''
    })
    setViewMode(false)
    setIsDialogOpen(true)
  }

  const handleView = (client) => {
    setSelectedClient(client)
    setFormData({
      name: client.name || '',
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      rg: client.rg || '',
      cpf: client.cpf || '',
      birth_date: client.birth_date || '',
      rg_expedition: client.rg_expedition || '',
      voter_id: client.voter_id || '',
      gov_br_password: client.gov_br_password || '',
      profession: client.profession || '',
      gender: client.gender || '',
      notes: client.notes || ''
    })
    setViewMode(true)
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setSelectedClient(null)
    setViewMode(false)
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      rg: '',
      cpf: '',
      birth_date: '',
      rg_expedition: '',
      voter_id: '',
      gov_br_password: '',
      profession: '',
      gender: '',
      notes: ''
    })
  }

  const filteredClients = clients.filter(client =>
    client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.cpf?.includes(searchTerm) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nome, CPF ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {viewMode ? 'Detalhes do Cliente' : selectedClient ? 'Editar Cliente' : 'Novo Cliente'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome Completo *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={viewMode}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>CPF *</Label>
                  <Input
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                    disabled={viewMode}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>RG</Label>
                  <Input
                    value={formData.rg}
                    onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
                    disabled={viewMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Expedição RG</Label>
                  <Input
                    value={formData.rg_expedition}
                    onChange={(e) => setFormData({ ...formData, rg_expedition: e.target.value })}
                    disabled={viewMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data de Nascimento</Label>
                  <Input
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                    disabled={viewMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sexo</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData({ ...formData, gender: value })}
                    disabled={viewMode}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Masculino</SelectItem>
                      <SelectItem value="female">Feminino</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(00) 00000-0000"
                    disabled={viewMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={viewMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Profissão</Label>
                  <Input
                    value={formData.profession}
                    onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                    disabled={viewMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Título de Eleitor</Label>
                  <Input
                    value={formData.voter_id}
                    onChange={(e) => setFormData({ ...formData, voter_id: e.target.value })}
                    disabled={viewMode}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Endereço</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    disabled={viewMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Senha Gov.br</Label>
                  <Input
                    type="password"
                    value={formData.gov_br_password}
                    onChange={(e) => setFormData({ ...formData, gov_br_password: e.target.value })}
                    disabled={viewMode}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Observações</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    disabled={viewMode}
                  />
                </div>
              </div>
              {!viewMode && (
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {selectedClient ? 'Atualizar' : 'Cadastrar'}
                  </Button>
                </div>
              )}
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Clients List */}
      <Card>
        <CardHeader>
          <CardTitle>Clientes Cadastrados</CardTitle>
          <CardDescription>{filteredClients.length} clientes encontrados</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Carregando...</div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <User className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500">Nenhum cliente encontrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  className="p-4 rounded-lg border bg-white hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-700 font-semibold">
                          {client.name?.charAt(0)?.toUpperCase() || 'C'}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{client.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          {client.cpf && <span>CPF: {client.cpf}</span>}
                          {client.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {client.phone}
                            </span>
                          )}
                          {client.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {client.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleView(client)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(client)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(client.id)}>
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
