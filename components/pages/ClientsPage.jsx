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
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Plus, Search, User, Phone, Mail, Edit, Trash2, Eye, Upload, Camera, Building2, UserCircle, PlusCircle, MinusCircle, Banknote } from 'lucide-react'

// Máscaras de input
const formatCPF = (value) => {
  const numbers = value.replace(/\D/g, '').slice(0, 11)
  return numbers
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

const formatCNPJ = (value) => {
  const numbers = value.replace(/\D/g, '').slice(0, 14)
  return numbers
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
}

const formatRG = (value) => {
  const numbers = value.replace(/\D/g, '').slice(0, 9)
  return numbers
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1})$/, '$1-$2')
}

const formatPhone = (value) => {
  const numbers = value.replace(/\D/g, '').slice(0, 11)
  if (numbers.length <= 10) {
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
  }
  return numbers
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
}

const formatCEP = (value) => {
  const numbers = value.replace(/\D/g, '').slice(0, 8)
  return numbers.replace(/(\d{5})(\d)/, '$1-$2')
}

const formatProcessoCNJ = (value) => {
  const numbers = value.replace(/\D/g, '').slice(0, 20)
  // Formato: 0000000-00.0000.0.00.0000
  return numbers
    .replace(/(\d{7})(\d)/, '$1-$2')
    .replace(/(\d{7}-\d{2})(\d)/, '$1.$2')
    .replace(/(\d{7}-\d{2}\.\d{4})(\d)/, '$1.$2')
    .replace(/(\d{7}-\d{2}\.\d{4}\.\d)(\d)/, '$1.$2')
    .replace(/(\d{7}-\d{2}\.\d{4}\.\d\.\d{2})(\d)/, '$1.$2')
}

export default function ClientsPage({ user }) {
  const [clients, setClients] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
  const [viewMode, setViewMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [isPessoaJuridica, setIsPessoaJuridica] = useState(false)

  // Estado inicial do formulário
  const getInitialFormData = () => ({
    // Tipo
    person_type: 'PF',
    
    // ===== PESSOA FÍSICA =====
    name: '',
    cpf: '',
    rg: '',
    rg_expedition_date: '',
    rg_issuer: '',
    birth_date: '',
    mother_name: '',
    ctps: '',
    voter_title: '',
    pis: '',
    nis: '',
    profession: '',
    govbr_password: '',
    nationality: 'Brasileiro(a)',
    marital_status: '',
    
    // ===== PESSOA JURÍDICA =====
    razao_social: '',
    nome_fantasia: '',
    cnpj: '',
    inscricao_estadual: '',
    natureza_juridica: '',
    socios: [{ nome: '', cpf: '' }],
    
    // ===== CONTATO =====
    email: '',
    phone_mobile: '',
    phone_home: '',
    phone_work: '',
    whatsapp: '',
    
    // ===== ENDEREÇO =====
    cep: '',
    address: '',
    address_number: '',
    address_complement: '',
    neighborhood: '',
    city: '',
    state: '',
    
    // ===== DADOS BANCÁRIOS =====
    bank_accounts: [{ banco: '', agencia: '', tipo: '', operacao: '', conta: '', pix: '' }],
    
    // ===== OUTROS =====
    photo_url: '',
    notes: ''
  })

  const [formData, setFormData] = useState(getInitialFormData())

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

  // Handlers para campos com máscaras
  const handleMaskedInput = (field, value, formatter) => {
    setFormData(prev => ({ ...prev, [field]: formatter(value) }))
  }

  // Handlers para sócios
  const addSocio = () => {
    setFormData(prev => ({
      ...prev,
      socios: [...prev.socios, { nome: '', cpf: '' }]
    }))
  }

  const removeSocio = (index) => {
    setFormData(prev => ({
      ...prev,
      socios: prev.socios.filter((_, i) => i !== index)
    }))
  }

  const updateSocio = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      socios: prev.socios.map((s, i) => 
        i === index ? { ...s, [field]: field === 'cpf' ? formatCPF(value) : value } : s
      )
    }))
  }

  // Handlers para contas bancárias
  const addBankAccount = () => {
    setFormData(prev => ({
      ...prev,
      bank_accounts: [...prev.bank_accounts, { banco: '', agencia: '', tipo: '', operacao: '', conta: '', pix: '' }]
    }))
  }

  const removeBankAccount = (index) => {
    setFormData(prev => ({
      ...prev,
      bank_accounts: prev.bank_accounts.filter((_, i) => i !== index)
    }))
  }

  const updateBankAccount = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      bank_accounts: prev.bank_accounts.map((acc, i) => 
        i === index ? { ...acc, [field]: value } : acc
      )
    }))
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
          person_type: isPessoaJuridica ? 'PJ' : 'PF',
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
    setIsPessoaJuridica(client.person_type === 'PJ')
    setFormData({
      ...getInitialFormData(),
      ...client,
      socios: client.socios?.length ? client.socios : [{ nome: '', cpf: '' }],
      bank_accounts: client.bank_accounts?.length ? client.bank_accounts : [{ banco: '', agencia: '', tipo: '', operacao: '', conta: '', pix: '' }]
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
    setIsPessoaJuridica(false)
    setFormData(getInitialFormData())
  }

  const handlePersonTypeChange = (checked) => {
    setIsPessoaJuridica(checked)
  }

  const filteredClients = clients.filter(client => {
    const searchLower = searchTerm.toLowerCase()
    return (
      client.name?.toLowerCase().includes(searchLower) ||
      client.razao_social?.toLowerCase().includes(searchLower) ||
      client.cpf?.includes(searchTerm) ||
      client.cnpj?.includes(searchTerm) ||
      client.email?.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nome, CPF, CNPJ ou email..."
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

            {/* Switch PF/PJ */}
            <div className="flex items-center justify-center gap-4 p-4 bg-gray-50 rounded-lg mb-4">
              <div className={`flex items-center gap-2 ${!isPessoaJuridica ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                <UserCircle className="h-5 w-5" />
                <span>Pessoa Física</span>
              </div>
              <Switch
                checked={isPessoaJuridica}
                onCheckedChange={handlePersonTypeChange}
                disabled={viewMode}
              />
              <div className={`flex items-center gap-2 ${isPessoaJuridica ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                <Building2 className="h-5 w-5" />
                <span>Pessoa Jurídica</span>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="personal">Dados {isPessoaJuridica ? 'Empresa' : 'Pessoais'}</TabsTrigger>
                  <TabsTrigger value="contact">Contato</TabsTrigger>
                  <TabsTrigger value="address">Endereço</TabsTrigger>
                  <TabsTrigger value="bank">Dados Bancários</TabsTrigger>
                  <TabsTrigger value="notes">Observações</TabsTrigger>
                </TabsList>

                {/* ===== ABA DADOS PESSOAIS / EMPRESA ===== */}
                <TabsContent value="personal" className="space-y-4 mt-4">
                  {!isPessoaJuridica ? (
                    // PESSOA FÍSICA
                    <>
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

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>CPF</Label>
                          <Input
                            value={formData.cpf}
                            onChange={(e) => handleMaskedInput('cpf', e.target.value, formatCPF)}
                            placeholder="000.000.000-00"
                            disabled={viewMode}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>RG</Label>
                          <Input
                            value={formData.rg}
                            onChange={(e) => handleMaskedInput('rg', e.target.value, formatRG)}
                            placeholder="00.000.000-0"
                            disabled={viewMode}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Órgão Expedidor</Label>
                          <Input
                            value={formData.rg_issuer}
                            onChange={(e) => setFormData({ ...formData, rg_issuer: e.target.value })}
                            placeholder="SSP/PE"
                            disabled={viewMode}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Data Expedição RG</Label>
                          <Input
                            type="date"
                            value={formData.rg_expedition_date}
                            onChange={(e) => setFormData({ ...formData, rg_expedition_date: e.target.value })}
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
                          <Label>Nome da Mãe</Label>
                          <Input
                            value={formData.mother_name}
                            onChange={(e) => setFormData({ ...formData, mother_name: e.target.value })}
                            disabled={viewMode}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label>CTPS</Label>
                          <Input
                            value={formData.ctps}
                            onChange={(e) => setFormData({ ...formData, ctps: e.target.value })}
                            disabled={viewMode}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Título de Eleitor</Label>
                          <Input
                            value={formData.voter_title}
                            onChange={(e) => setFormData({ ...formData, voter_title: e.target.value })}
                            disabled={viewMode}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>PIS</Label>
                          <Input
                            value={formData.pis}
                            onChange={(e) => setFormData({ ...formData, pis: e.target.value })}
                            disabled={viewMode}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>NIS</Label>
                          <Input
                            value={formData.nis}
                            onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                            disabled={viewMode}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Profissão</Label>
                          <Input
                            value={formData.profession}
                            onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
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
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Senha GOV.BR</Label>
                          <Input
                            type="password"
                            value={formData.govbr_password}
                            onChange={(e) => setFormData({ ...formData, govbr_password: e.target.value })}
                            placeholder="Senha de acesso ao GOV.BR"
                            disabled={viewMode}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    // PESSOA JURÍDICA
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Razão Social *</Label>
                          <Input
                            value={formData.razao_social}
                            onChange={(e) => setFormData({ ...formData, razao_social: e.target.value })}
                            disabled={viewMode}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Nome Fantasia</Label>
                          <Input
                            value={formData.nome_fantasia}
                            onChange={(e) => setFormData({ ...formData, nome_fantasia: e.target.value })}
                            disabled={viewMode}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>CNPJ *</Label>
                          <Input
                            value={formData.cnpj}
                            onChange={(e) => handleMaskedInput('cnpj', e.target.value, formatCNPJ)}
                            placeholder="00.000.000/0000-00"
                            disabled={viewMode}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Inscrição Estadual</Label>
                          <Input
                            value={formData.inscricao_estadual}
                            onChange={(e) => setFormData({ ...formData, inscricao_estadual: e.target.value })}
                            disabled={viewMode}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Natureza Jurídica</Label>
                          <Select
                            value={formData.natureza_juridica}
                            onValueChange={(value) => setFormData({ ...formData, natureza_juridica: value })}
                            disabled={viewMode}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mei">MEI</SelectItem>
                              <SelectItem value="ei">Empresário Individual</SelectItem>
                              <SelectItem value="eireli">EIRELI</SelectItem>
                              <SelectItem value="ltda">Sociedade Limitada</SelectItem>
                              <SelectItem value="sa">Sociedade Anônima</SelectItem>
                              <SelectItem value="ss">Sociedade Simples</SelectItem>
                              <SelectItem value="associacao">Associação</SelectItem>
                              <SelectItem value="fundacao">Fundação</SelectItem>
                              <SelectItem value="cooperativa">Cooperativa</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Sócios */}
                      <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <Label className="text-base font-medium">Sócios</Label>
                          {!viewMode && (
                            <Button type="button" variant="outline" size="sm" onClick={addSocio}>
                              <PlusCircle className="h-4 w-4 mr-1" />
                              Adicionar Sócio
                            </Button>
                          )}
                        </div>
                        {formData.socios.map((socio, index) => (
                          <div key={index} className="grid grid-cols-12 gap-3 items-end">
                            <div className="col-span-6 space-y-1">
                              <Label className="text-sm">Nome do Sócio</Label>
                              <Input
                                value={socio.nome}
                                onChange={(e) => updateSocio(index, 'nome', e.target.value)}
                                placeholder="Nome completo"
                                disabled={viewMode}
                              />
                            </div>
                            <div className="col-span-4 space-y-1">
                              <Label className="text-sm">CPF do Sócio</Label>
                              <Input
                                value={socio.cpf}
                                onChange={(e) => updateSocio(index, 'cpf', e.target.value)}
                                placeholder="000.000.000-00"
                                disabled={viewMode}
                              />
                            </div>
                            <div className="col-span-2">
                              {!viewMode && formData.socios.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeSocio(index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <MinusCircle className="h-5 w-5" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </TabsContent>

                {/* ===== ABA CONTATO ===== */}
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
                        onChange={(e) => handleMaskedInput('whatsapp', e.target.value, formatPhone)}
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
                        onChange={(e) => handleMaskedInput('phone_mobile', e.target.value, formatPhone)}
                        placeholder="(00) 00000-0000"
                        disabled={viewMode}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Telefone Residencial</Label>
                      <Input
                        value={formData.phone_home}
                        onChange={(e) => handleMaskedInput('phone_home', e.target.value, formatPhone)}
                        placeholder="(00) 0000-0000"
                        disabled={viewMode}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Telefone Comercial</Label>
                      <Input
                        value={formData.phone_work}
                        onChange={(e) => handleMaskedInput('phone_work', e.target.value, formatPhone)}
                        placeholder="(00) 0000-0000"
                        disabled={viewMode}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* ===== ABA ENDEREÇO ===== */}
                <TabsContent value="address" className="space-y-4 mt-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>CEP</Label>
                      <div className="flex gap-2">
                        <Input
                          value={formData.cep}
                          onChange={(e) => handleMaskedInput('cep', e.target.value, formatCEP)}
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
                      <Select
                        value={formData.state}
                        onValueChange={(value) => setFormData({ ...formData, state: value })}
                        disabled={viewMode}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="UF" />
                        </SelectTrigger>
                        <SelectContent>
                          {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => (
                            <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                {/* ===== ABA DADOS BANCÁRIOS ===== */}
                <TabsContent value="bank" className="space-y-4 mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Banknote className="h-5 w-5 text-green-600" />
                      <Label className="text-base font-medium">Contas Bancárias</Label>
                    </div>
                    {!viewMode && (
                      <Button type="button" variant="outline" size="sm" onClick={addBankAccount}>
                        <PlusCircle className="h-4 w-4 mr-1" />
                        Adicionar Conta
                      </Button>
                    )}
                  </div>

                  {formData.bank_accounts.map((account, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-4 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Conta {index + 1}</span>
                        {!viewMode && formData.bank_accounts.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeBankAccount(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <MinusCircle className="h-4 w-4 mr-1" />
                            Remover
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Banco</Label>
                          <Select
                            value={account.banco}
                            onValueChange={(value) => updateBankAccount(index, 'banco', value)}
                            disabled={viewMode}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="001">001 - Banco do Brasil</SelectItem>
                              <SelectItem value="033">033 - Santander</SelectItem>
                              <SelectItem value="104">104 - Caixa Econômica</SelectItem>
                              <SelectItem value="237">237 - Bradesco</SelectItem>
                              <SelectItem value="341">341 - Itaú</SelectItem>
                              <SelectItem value="260">260 - Nubank</SelectItem>
                              <SelectItem value="077">077 - Inter</SelectItem>
                              <SelectItem value="336">336 - C6 Bank</SelectItem>
                              <SelectItem value="756">756 - Sicoob</SelectItem>
                              <SelectItem value="748">748 - Sicredi</SelectItem>
                              <SelectItem value="outro">Outro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Agência</Label>
                          <Input
                            value={account.agencia}
                            onChange={(e) => updateBankAccount(index, 'agencia', e.target.value)}
                            placeholder="0000"
                            disabled={viewMode}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Conta</Label>
                          <Input
                            value={account.conta}
                            onChange={(e) => updateBankAccount(index, 'conta', e.target.value)}
                            placeholder="00000-0"
                            disabled={viewMode}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Tipo</Label>
                          <Select
                            value={account.tipo}
                            onValueChange={(value) => updateBankAccount(index, 'tipo', value)}
                            disabled={viewMode}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="corrente">Conta Corrente</SelectItem>
                              <SelectItem value="poupanca">Poupança</SelectItem>
                              <SelectItem value="salario">Conta Salário</SelectItem>
                              <SelectItem value="pagamento">Conta Pagamento</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Operação</Label>
                          <Input
                            value={account.operacao}
                            onChange={(e) => updateBankAccount(index, 'operacao', e.target.value)}
                            placeholder="001"
                            disabled={viewMode}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Chave PIX</Label>
                          <Input
                            value={account.pix}
                            onChange={(e) => updateBankAccount(index, 'pix', e.target.value)}
                            placeholder="CPF, Email, Telefone ou Aleatória"
                            disabled={viewMode}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                {/* ===== ABA OBSERVAÇÕES ===== */}
                <TabsContent value="notes" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Observações sobre o cliente</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={8}
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
                          <img src={client.photo_url} alt={client.name || client.razao_social} className="w-full h-full object-cover" />
                        ) : client.person_type === 'PJ' ? (
                          <Building2 className="h-6 w-6 text-blue-700" />
                        ) : (
                          <span className="text-blue-700 font-semibold">
                            {(client.name || client.razao_social)?.charAt(0)?.toUpperCase() || 'C'}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900">
                            {client.person_type === 'PJ' ? client.razao_social : client.name}
                          </h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${client.person_type === 'PJ' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                            {client.person_type === 'PJ' ? 'PJ' : 'PF'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          {client.person_type === 'PJ' ? (
                            client.cnpj && <span>CNPJ: {client.cnpj}</span>
                          ) : (
                            client.cpf && <span>CPF: {client.cpf}</span>
                          )}
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
