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
import { toast } from 'sonner'
import { Plus, Search, User, Phone, Mail, MapPin, Edit, Trash2, Eye, Upload, Camera } from 'lucide-react'

export default function ClientsPage({ user }) {
  const [clients, setClients] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
  const [viewMode, setViewMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [formData, setFormData] = useState({
    // Dados Pessoais
    name: '',
    cpf: '',
    rg: '',
    rg_expedition: '',
    birth_date: '',
    marital_status: '',
    profession: '',
    nationality: 'Brasileiro(a)',
    mother_name: '',
    // Para estrangeiros
    passport: '',
    rne: '',
    visa: '',
    // Contato
    email: '',
    phone_mobile: '',
    phone_home: '',
    phone_work: '',
    whatsapp: '',
    // Endereço
    cep: '',
    address: '',
    address_number: '',
    address_complement: '',
    neighborhood: '',
    city: '',
    state: '',
    // Outros
    photo_url: '',
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

  const handleCepLookup = async (cep) => {
    const cleanCep = cep.replace(/\D/g, '')
    if (cleanCep.length !== 8) return

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
      const data = await response.json()
      
      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          address: data.logradouro || '',
          neighborhood: data.bairro || '',
          city: data.localidade || '',
          state: data.uf || ''
        }))
        toast.success('Endereço encontrado!')
      } else {
        toast.error('CEP não encontrado')
      }
    } catch (error) {
      toast.error('Erro ao buscar CEP')
    }
  }

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result)
        setFormData(prev => ({ ...prev, photo_url: reader.result }))
      }
      reader.readAsDataURL(file)
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
      cpf: client.cpf || '',
      rg: client.rg || '',
      rg_expedition: client.rg_expedition || '',
      birth_date: client.birth_date || '',
      marital_status: client.marital_status || '',
      profession: client.profession || '',
      nationality: client.nationality || 'Brasileiro(a)',
      mother_name: client.mother_name || '',
      passport: client.passport || '',
      rne: client.rne || '',
      visa: client.visa || '',
      email: client.email || '',
      phone_mobile: client.phone_mobile || client.phone || '',
      phone_home: client.phone_home || '',
      phone_work: client.phone_work || '',
      whatsapp: client.whatsapp || '',
      cep: client.cep || '',
      address: client.address || '',
      address_number: client.address_number || '',
      address_complement: client.address_complement || '',
      neighborhood: client.neighborhood || '',
      city: client.city || '',
      state: client.state || '',
      photo_url: client.photo_url || '',
      notes: client.notes || ''
    })
    setPhotoPreview(client.photo_url || null)
    setViewMode(false)
    setIsDialogOpen(true)
  }

  const handleView = (client) => {
    handleEdit(client)
    setViewMode(true)
  }

  const resetForm = () => {
    setSelectedClient(null)
    setViewMode(false)
    setPhotoPreview(null)
    setFormData({
      name: '',
      cpf: '',
      rg: '',
      rg_expedition: '',
      birth_date: '',
      marital_status: '',
      profession: '',
      nationality: 'Brasileiro(a)',
      mother_name: '',
      passport: '',
      rne: '',
      visa: '',
      email: '',
      phone_mobile: '',
      phone_home: '',
      phone_work: '',
      whatsapp: '',
      cep: '',
      address: '',
      address_number: '',
      address_complement: '',
      neighborhood: '',
      city: '',
      state: '',
      photo_url: '',
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
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {viewMode ? 'Detalhes do Cliente' : selectedClient ? 'Editar Cliente' : 'Novo Cliente'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="personal">Dados Pessoais</TabsTrigger>
                  <TabsTrigger value="contact">Contato</TabsTrigger>
                  <TabsTrigger value="address">Endereço</TabsTrigger>
                  <TabsTrigger value="juridical">Dados Jurídicos</TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-4 mt-4">
                  {/* Photo Upload */}
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
                        {photoPreview ? (
                          <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <Camera className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      {!viewMode && (
                        <label className="absolute bottom-0 right-0 p-1 bg-blue-600 rounded-full cursor-pointer hover:bg-blue-700">
                          <Upload className="h-4 w-4 text-white" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handlePhotoUpload}
                          />
                        </label>
                      )}
                    </div>
                    <div className="flex-1">
                      <Label>Nome Completo *</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        disabled={viewMode}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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
                  </div>

                  <div className="grid grid-cols-3 gap-4">
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
                      <Label>Estado Civil</Label>
                      <Select
                        value={formData.marital_status}
                        onValueChange={(value) => setFormData({ ...formData, marital_status: value })}
                        disabled={viewMode}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                          <SelectItem value="casado">Casado(a)</SelectItem>
                          <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                          <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                          <SelectItem value="uniao_estavel">União Estável</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Profissão</Label>
                      <Input
                        value={formData.profession}
                        onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                        disabled={viewMode}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="contact" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
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
                      <Label>WhatsApp</Label>
                      <Input
                        value={formData.whatsapp}
                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                        placeholder="(00) 00000-0000"
                        disabled={viewMode}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Celular</Label>
                      <Input
                        value={formData.phone_mobile}
                        onChange={(e) => setFormData({ ...formData, phone_mobile: e.target.value })}
                        placeholder="(00) 00000-0000"
                        disabled={viewMode}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Telefone Residencial</Label>
                      <Input
                        value={formData.phone_home}
                        onChange={(e) => setFormData({ ...formData, phone_home: e.target.value })}
                        placeholder="(00) 0000-0000"
                        disabled={viewMode}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Telefone Comercial</Label>
                      <Input
                        value={formData.phone_work}
                        onChange={(e) => setFormData({ ...formData, phone_work: e.target.value })}
                        placeholder="(00) 0000-0000"
                        disabled={viewMode}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="address" className="space-y-4 mt-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>CEP</Label>
                      <div className="flex gap-2">
                        <Input
                          value={formData.cep}
                          onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                          placeholder="00000-000"
                          disabled={viewMode}
                        />
                        {!viewMode && (
                          <Button type="button" variant="outline" onClick={() => handleCepLookup(formData.cep)}>
                            Buscar
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>Logradouro</Label>
                      <Input
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        disabled={viewMode}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Número</Label>
                      <Input
                        value={formData.address_number}
                        onChange={(e) => setFormData({ ...formData, address_number: e.target.value })}
                        disabled={viewMode}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Complemento</Label>
                      <Input
                        value={formData.address_complement}
                        onChange={(e) => setFormData({ ...formData, address_complement: e.target.value })}
                        disabled={viewMode}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Bairro</Label>
                      <Input
                        value={formData.neighborhood}
                        onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                        disabled={viewMode}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Cidade</Label>
                      <Input
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        disabled={viewMode}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Estado</Label>
                      <Input
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        maxLength={2}
                        disabled={viewMode}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="juridical" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome da Mãe (para certidões)</Label>
                      <Input
                        value={formData.mother_name}
                        onChange={(e) => setFormData({ ...formData, mother_name: e.target.value })}
                        disabled={viewMode}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Nacionalidade</Label>
                      <Input
                        value={formData.nationality}
                        onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                        disabled={viewMode}
                      />
                    </div>
                  </div>

                  {formData.nationality && formData.nationality !== 'Brasileiro(a)' && (
                    <div className="grid grid-cols-3 gap-4 p-4 bg-yellow-50 rounded-lg">
                      <div className="col-span-3">
                        <p className="text-sm text-yellow-700 font-medium mb-2">Dados para Estrangeiros</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Passaporte</Label>
                        <Input
                          value={formData.passport}
                          onChange={(e) => setFormData({ ...formData, passport: e.target.value })}
                          disabled={viewMode}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>RNE</Label>
                        <Input
                          value={formData.rne}
                          onChange={(e) => setFormData({ ...formData, rne: e.target.value })}
                          disabled={viewMode}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Visto</Label>
                        <Input
                          value={formData.visa}
                          onChange={(e) => setFormData({ ...formData, visa: e.target.value })}
                          disabled={viewMode}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Observações sobre o cliente</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={5}
                      placeholder="Anotações livres sobre o cliente..."
                      disabled={viewMode}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              {!viewMode && (
                <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
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
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                        {client.photo_url ? (
                          <img src={client.photo_url} alt={client.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-blue-700 font-semibold">
                            {client.name?.charAt(0)?.toUpperCase() || 'C'}
                          </span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{client.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          {client.cpf && <span>CPF: {client.cpf}</span>}
                          {(client.phone_mobile || client.phone) && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {client.phone_mobile || client.phone}
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
