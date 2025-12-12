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
import { Plus, Search, Phone, Mail, MapPin, Globe, Edit, Trash2, Building2, User, Landmark } from 'lucide-react'

export default function ContactsPage({ user }) {
  const [contacts, setContacts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    type: 'client',
    phone: '',
    email: '',
    address: '',
    whatsapp: '',
    website: '',
    notes: ''
  })

  useEffect(() => {
    fetchContacts()
  }, [])

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/contacts')
      if (response.ok) {
        const data = await response.json()
        setContacts(data)
      }
    } catch (error) {
      console.error('Error fetching contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const url = selectedContact ? `/api/contacts/${selectedContact.id}` : '/api/contacts'
      const method = selectedContact ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          lawyer_id: user.id
        })
      })

      if (response.ok) {
        toast.success(selectedContact ? 'Contato atualizado!' : 'Contato cadastrado!')
        setIsDialogOpen(false)
        resetForm()
        fetchContacts()
      }
    } catch (error) {
      toast.error('Erro ao salvar contato')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este contato?')) return

    try {
      const response = await fetch(`/api/contacts/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Contato excluído!')
        fetchContacts()
      }
    } catch (error) {
      toast.error('Erro ao excluir contato')
    }
  }

  const resetForm = () => {
    setSelectedContact(null)
    setFormData({
      name: '',
      type: 'client',
      phone: '',
      email: '',
      address: '',
      whatsapp: '',
      website: '',
      notes: ''
    })
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'client': return <User className="h-4 w-4" />
      case 'public_authority': return <Landmark className="h-4 w-4" />
      case 'public_agency': return <Building2 className="h-4 w-4" />
      case 'business': return <Building2 className="h-4 w-4" />
      default: return <User className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type) => {
    const labels = {
      'client': 'Cliente',
      'public_authority': 'Autoridade Pública',
      'public_agency': 'Órgão Público',
      'business': 'Empresário'
    }
    return labels[type] || type
  }

  const getTypeColor = (type) => {
    const colors = {
      'client': 'bg-blue-100 text-blue-700',
      'public_authority': 'bg-purple-100 text-purple-700',
      'public_agency': 'bg-orange-100 text-orange-700',
      'business': 'bg-green-100 text-green-700'
    }
    return colors[type] || 'bg-gray-100 text-gray-700'
  }

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          contact.phone?.includes(searchTerm)
    const matchesType = filterType === 'all' || contact.type === filterType
    return matchesSearch && matchesType
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar contatos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="client">Clientes</SelectItem>
              <SelectItem value="public_authority">Autoridades Públicas</SelectItem>
              <SelectItem value="public_agency">Órgãos Públicos</SelectItem>
              <SelectItem value="business">Empresários</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Contato
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {selectedContact ? 'Editar Contato' : 'Novo Contato'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">Cliente</SelectItem>
                      <SelectItem value="public_authority">Autoridade Pública</SelectItem>
                      <SelectItem value="public_agency">Órgão Público</SelectItem>
                      <SelectItem value="business">Empresário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp</Label>
                  <Input
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Endereço</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://"
                />
              </div>
              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">{selectedContact ? 'Atualizar' : 'Cadastrar'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Contacts List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Contatos</CardTitle>
          <CardDescription>{filteredContacts.length} contatos encontrados</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Carregando...</div>
          ) : filteredContacts.length === 0 ? (
            <div className="text-center py-8">
              <Phone className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-500">Nenhum contato encontrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredContacts.map((contact) => (
                <div key={contact.id} className="p-4 rounded-lg border bg-white">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        {getTypeIcon(contact.type)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{contact.name}</h4>
                        <Badge className={`${getTypeColor(contact.type)} text-xs`}>
                          {getTypeLabel(contact.type)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => {
                        setSelectedContact(contact)
                        setFormData(contact)
                        setIsDialogOpen(true)
                      }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(contact.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1 text-sm text-gray-500">
                    {contact.phone && (
                      <p className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        {contact.phone}
                      </p>
                    )}
                    {contact.email && (
                      <p className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        {contact.email}
                      </p>
                    )}
                    {contact.address && (
                      <p className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        {contact.address}
                      </p>
                    )}
                    {contact.website && (
                      <p className="flex items-center gap-2">
                        <Globe className="h-3 w-3" />
                        <a href={contact.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {contact.website}
                        </a>
                      </p>
                    )}
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
