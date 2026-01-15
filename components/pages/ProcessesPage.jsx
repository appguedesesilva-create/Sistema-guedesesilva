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
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { Plus, Search, FolderOpen, Edit, Trash2, Eye, Scale, FileText, Briefcase, Building2 } from 'lucide-react'

// Tipos de Processo Judicial
const JUDICIAL_TYPES = [
  { value: 'civel', label: 'Cível', subtypes: ['Família', 'Contratos', 'Propriedade', 'Consumidor', 'Danos Morais/Materiais', 'Sucessões'] },
  { value: 'criminal', label: 'Criminal', subtypes: ['Roubo', 'Homicídio', 'Estelionato', 'Tráfico', 'Contravenções'] },
  { value: 'trabalhista', label: 'Trabalhista', subtypes: ['Rescisão', 'Horas Extras', 'Assédio', 'Acidente de Trabalho', 'Reconhecimento de Vínculo'] },
  { value: 'previdenciario', label: 'Previdenciário', subtypes: ['Aposentadoria', 'Auxílio-Doença', 'Pensão por Morte', 'Revisão', 'INSS'] },
  { value: 'tributario', label: 'Tributário', subtypes: ['Impostos', 'Execução Fiscal', 'Restituição', 'Dívida Ativa'] },
  { value: 'administrativo', label: 'Administrativo', subtypes: ['Servidor Público', 'Licitações', 'Improbidade', 'Concurso Público'] },
  { value: 'empresarial', label: 'Empresarial', subtypes: ['Falência', 'Recuperação Judicial', 'Contratos Societários', 'Marcas e Patentes'] },
  { value: 'ambiental', label: 'Ambiental', subtypes: ['Crimes Ambientais', 'Licenciamento', 'APPs'] },
  { value: 'eleitoral', label: 'Eleitoral', subtypes: ['Registro de Candidatura', 'Prestação de Contas', 'Impugnação de Mandato'] },
  { value: 'saude', label: 'Saúde', subtypes: ['Planos de Saúde', 'SUS', 'Tratamento Médico', 'Fornecimento de Medicamentos'] },
  { value: 'digital', label: 'Digital/Tecnológico', subtypes: ['Crimes Cibernéticos', 'LGPD', 'Propriedade Intelectual Digital'] },
  { value: 'juizado', label: 'Juizado Especial', subtypes: ['Cível até 40 SM', 'Criminal de Menor Potencial Ofensivo'] }
]

const JUDICIAL_PHASES = [
  { value: 'inicial', label: 'Inicial' },
  { value: 'instrucao', label: 'Instrução' },
  { value: 'sentenca', label: 'Sentença' },
  { value: 'recurso', label: 'Recurso' },
  { value: 'execucao', label: 'Execução' }
]

// Tipos de Processo Administrativo
const ADMIN_TYPES = [
  { value: 'concessao', label: 'Concessão/Licença' },
  { value: 'registro', label: 'Registro/Certificação' },
  { value: 'fiscalizacao', label: 'Fiscalização/Autuação' },
  { value: 'aposentadoria', label: 'Aposentadoria/Benefício (INSS)' },
  { value: 'pad', label: 'Disciplinar (PAD)' },
  { value: 'licitacao', label: 'Licitação' },
  { value: 'recurso_admin', label: 'Recurso Administrativo' },
  { value: 'desapropriacao', label: 'Desapropriação' },
  { value: 'tombamento', label: 'Tombamento' },
  { value: 'outros', label: 'Outros' }
]

const ADMIN_STATUS = [
  { value: 'protocolado', label: 'Protocolado' },
  { value: 'em_analise', label: 'Em Análise' },
  { value: 'decisao', label: 'Decisão' },
  { value: 'recurso', label: 'Recurso' },
  { value: 'encerrado', label: 'Encerrado' }
]

// Categorias de Serviços Extrajudiciais
const SERVICE_CATEGORIES = [
  {
    category: 'Consultoria e Documentos',
    services: ['Consulta jurídica', 'Parecer jurídico', 'Análise de contratos', 'Revisão de documentos', 'Due diligence', 'Compliance e LGPD', 'Assessoria contínua']
  },
  {
    category: 'Contratos e Acordos',
    services: ['Elaboração de contrato', 'Revisão/adequação contratual', 'Negociação extrajudicial', 'Acordo entre partes', 'Mediação de conflitos', 'Dissolução societária amigável', 'Pacto antenupcial']
  },
  {
    category: 'Registros e Regularizações',
    services: ['Registro de marca/patente', 'Abertura/fechamento de empresa', 'Alteração societária', 'Regularização imobiliária', 'Registro de imóvel', 'Usucapião extrajudicial', 'Legalização de documentos']
  },
  {
    category: 'Cartorial e Notarial',
    services: ['Reconhecimento de firma', 'Autenticação de documentos', 'Procurações', 'Testamentos', 'Inventário extrajudicial', 'Divórcio extrajudicial', 'Pacto de convivência']
  },
  {
    category: 'Administrativo Público',
    services: ['Acompanhamento administrativo', 'Pedidos de informação (LAI)', 'Recursos administrativos', 'Licitações e contratos públicos', 'Regularização ambiental', 'Alvarás e licenças', 'Defesa em autuações']
  },
  {
    category: 'Família e Sucessões',
    services: ['Planejamento sucessório', 'Acordo de guarda/pensão', 'Reconhecimento de paternidade', 'Curatela', 'Declaração de ausência', 'Regularização de união estável', 'Acordo pré-nupcial']
  },
  {
    category: 'Trabalhista e Previdenciário',
    services: ['Contrato de trabalho', 'Regulamento interno', 'Acordo de demissão', 'Revisão de benefícios INSS', 'Acompanhamento INSS', 'Planejamento previdenciário', 'Consulta CNIS']
  },
  {
    category: 'Cobrança e Crédito',
    services: ['Notificação extrajudicial', 'Acordo de pagamento', 'Recuperação de crédito', 'Renegociação de dívidas', 'Carta de precatório', 'Protesto de títulos', 'Acordo financeiro']
  },
  {
    category: 'Digital e Tecnologia',
    services: ['Termos de uso/política de privacidade', 'Contrato de software', 'Proteção de dados (LGPD)', 'Due diligence digital', 'Contrato de influenciador', 'Terms of Service (ToS)']
  },
  {
    category: 'Outros',
    services: ['Outros serviços extrajudiciais']
  }
]

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
  
  // Formulário Processo Judicial
  const [judicialForm, setJudicialForm] = useState({
    number: '',
    is_office_origin: false,
    process_type: '',
    process_subtype: '',
    client_id: '',
    phase: 'inicial',
    subject: '',
    details: '',
    court: '',
    lawyer_id: ''
  })

  // Formulário Processo Administrativo
  const [adminForm, setAdminForm] = useState({
    number: '',
    admin_type: '',
    organ: '',
    organ_entity: '',
    unit_location: '',
    phase: '',
    has_appeal: false,
    subject: '',
    details: '',
    filing_organ: '',
    opening_date: '',
    deadline: '',
    status: 'protocolado',
    client_id: '',
    lawyer_id: ''
  })

  // Formulário Serviço Extrajudicial
  const [serviceForm, setServiceForm] = useState({
    objective: '',
    category: '',
    service_type: '',
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

  const handleJudicialSubmit = async (e) => {
    e.preventDefault()
    try {
      const url = selectedItem ? `/api/processes/${selectedItem.id}` : '/api/processes'
      const method = selectedItem ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...judicialForm,
          type: 'judicial',
          lawyer_id: judicialForm.lawyer_id || user.id
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

  const handleAdminSubmit = async (e) => {
    e.preventDefault()
    try {
      const url = selectedItem ? `/api/processes/${selectedItem.id}` : '/api/processes'
      const method = selectedItem ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...adminForm,
          type: 'administrative',
          lawyer_id: adminForm.lawyer_id || user.id
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
    setJudicialForm({
      number: '', is_office_origin: false, process_type: '', process_subtype: '',
      client_id: '', phase: 'inicial', subject: '', details: '', court: '', lawyer_id: ''
    })
    setAdminForm({
      number: '', admin_type: '', organ: '', organ_entity: '', unit_location: '',
      phase: '', has_appeal: false, subject: '', details: '', filing_organ: '',
      opening_date: '', deadline: '', status: 'protocolado', client_id: '', lawyer_id: ''
    })
    setServiceForm({
      objective: '', category: '', service_type: '', details: '',
      client_id: '', lawyer_id: '', status: 'pending'
    })
  }

  const openNewDialog = (type) => {
    resetForms()
    setFormType(type)
    setIsDialogOpen(true)
  }

  const getPhaseColor = (phase) => {
    const colors = {
      'inicial': 'bg-blue-100 text-blue-700',
      'instrucao': 'bg-yellow-100 text-yellow-700',
      'sentenca': 'bg-purple-100 text-purple-700',
      'recurso': 'bg-orange-100 text-orange-700',
      'execucao': 'bg-green-100 text-green-700'
    }
    return colors[phase] || 'bg-gray-100 text-gray-700'
  }

  const filteredJudicial = processes.filter(p => 
    p.type === 'judicial' &&
    (p.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     p.subject?.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const filteredAdmin = processes.filter(p => 
    p.type === 'administrative' &&
    (p.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     p.subject?.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const filteredServices = services.filter(s =>
    s.objective?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.service_type?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Contagem de processos por tipo e ano
  const getProcessStats = () => {
    const currentYear = new Date().getFullYear()
    const stats = {}
    
    // Inicializar estatísticas para os últimos 5 anos
    for (let year = currentYear; year >= currentYear - 4; year--) {
      stats[year] = {}
      JUDICIAL_TYPES.forEach(type => {
        stats[year][type.value] = 0
      })
    }
    
    // Anos anteriores agrupados
    stats['anteriores'] = {}
    JUDICIAL_TYPES.forEach(type => {
      stats['anteriores'][type.value] = 0
    })
    
    // Contar processos judiciais
    processes.filter(p => p.type === 'judicial').forEach(p => {
      const processYear = p.created_at ? new Date(p.created_at).getFullYear() : currentYear
      const processType = p.process_type || 'outros'
      
      if (processYear >= currentYear - 4) {
        if (stats[processYear] && stats[processYear][processType] !== undefined) {
          stats[processYear][processType]++
        }
      } else {
        if (stats['anteriores'][processType] !== undefined) {
          stats['anteriores'][processType]++
        }
      }
    })
    
    return stats
  }

  const processStats = getProcessStats()
  const currentYear = new Date().getFullYear()
  const years = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3, currentYear - 4, 'anteriores']

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
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => openNewDialog('judicial')} className="bg-blue-600 hover:bg-blue-700">
            <Scale className="h-4 w-4 mr-2" />
            Processo Judicial
          </Button>
          <Button onClick={() => openNewDialog('administrative')} variant="outline">
            <Building2 className="h-4 w-4 mr-2" />
            Processo Administrativo
          </Button>
          <Button onClick={() => openNewDialog('service')} variant="outline">
            <Briefcase className="h-4 w-4 mr-2" />
            Serviço Extrajudicial
          </Button>
        </div>
      </div>

      {/* Quadro de Contagem de Processos por Tipo e Ano */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Scale className="h-5 w-5 text-blue-600" />
            Processos Judiciais por Tipo e Ano
          </CardTitle>
          <CardDescription>Distribuição de processos cadastrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-2 font-medium text-gray-700">Tipo de Processo</th>
                  {years.map(year => (
                    <th key={year} className="text-center p-2 font-medium text-gray-700 min-w-[70px]">
                      {year === 'anteriores' ? 'Anteriores' : year}
                    </th>
                  ))}
                  <th className="text-center p-2 font-medium text-gray-700 bg-blue-50">Total</th>
                </tr>
              </thead>
              <tbody>
                {JUDICIAL_TYPES.map((type, index) => {
                  const total = years.reduce((sum, year) => sum + (processStats[year]?.[type.value] || 0), 0)
                  return (
                    <tr key={type.value} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-2 font-medium text-gray-800">{type.label}</td>
                      {years.map(year => (
                        <td key={year} className="text-center p-2">
                          <span className={processStats[year]?.[type.value] > 0 ? 'font-semibold text-blue-600' : 'text-gray-400'}>
                            {processStats[year]?.[type.value] || 0}
                          </span>
                        </td>
                      ))}
                      <td className="text-center p-2 bg-blue-50 font-bold text-blue-700">{total}</td>
                    </tr>
                  )
                })}
                <tr className="border-t-2 bg-gray-100 font-bold">
                  <td className="p-2 text-gray-800">TOTAL</td>
                  {years.map(year => {
                    const yearTotal = JUDICIAL_TYPES.reduce((sum, type) => sum + (processStats[year]?.[type.value] || 0), 0)
                    return (
                      <td key={year} className="text-center p-2 text-blue-700">{yearTotal}</td>
                    )
                  })}
                  <td className="text-center p-2 bg-blue-100 text-blue-800">
                    {filteredJudicial.length}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Processos Judiciais</p>
                <p className="text-3xl font-bold">{filteredJudicial.length}</p>
              </div>
              <Scale className="h-10 w-10 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Processos Administrativos</p>
                <p className="text-3xl font-bold">{filteredAdmin.length}</p>
              </div>
              <Building2 className="h-10 w-10 text-orange-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Serviços Extrajudiciais</p>
                <p className="text-3xl font-bold">{filteredServices.length}</p>
              </div>
              <Briefcase className="h-10 w-10 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white shadow">
          <TabsTrigger value="judicial" className="data-[state=active]:bg-blue-100">
            <Scale className="h-4 w-4 mr-2" />
            Judiciais ({filteredJudicial.length})
          </TabsTrigger>
          <TabsTrigger value="administrative" className="data-[state=active]:bg-orange-100">
            <Building2 className="h-4 w-4 mr-2" />
            Administrativos ({filteredAdmin.length})
          </TabsTrigger>
          <TabsTrigger value="services" className="data-[state=active]:bg-purple-100">
            <Briefcase className="h-4 w-4 mr-2" />
            Serviços ({filteredServices.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="judicial" className="mt-4">
          <Card>
            <CardContent className="p-6">
              {filteredJudicial.length === 0 ? (
                <div className="text-center py-12">
                  <Scale className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">Nenhum processo judicial encontrado</p>
                  <Button className="mt-4" onClick={() => openNewDialog('judicial')}>
                    <Plus className="h-4 w-4 mr-2" /> Cadastrar Processo
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredJudicial.map((process) => (
                    <div key={process.id} className="p-4 rounded-xl border bg-white hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-gray-900">{process.number}</h4>
                            {process.is_office_origin && (
                              <Badge className="bg-green-100 text-green-700">Originário</Badge>
                            )}
                            <Badge className={getPhaseColor(process.phase)}>
                              {JUDICIAL_PHASES.find(p => p.value === process.phase)?.label || process.phase}
                            </Badge>
                            {process.process_type && (
                              <Badge variant="outline">
                                {JUDICIAL_TYPES.find(t => t.value === process.process_type)?.label}
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-600 mt-1">{process.subject}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                            {process.client_name && <span>Cliente: {process.client_name}</span>}
                            {process.court && <span>Vara: {process.court}</span>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(process.id, 'process')}>
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

        <TabsContent value="administrative" className="mt-4">
          <Card>
            <CardContent className="p-6">
              {filteredAdmin.length === 0 ? (
                <div className="text-center py-12">
                  <Building2 className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">Nenhum processo administrativo encontrado</p>
                  <Button className="mt-4" onClick={() => openNewDialog('administrative')}>
                    <Plus className="h-4 w-4 mr-2" /> Cadastrar Processo
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAdmin.map((process) => (
                    <div key={process.id} className="p-4 rounded-xl border bg-white hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-gray-900">{process.number || 'Sem número'}</h4>
                            <Badge className="bg-orange-100 text-orange-700">
                              {ADMIN_TYPES.find(t => t.value === process.admin_type)?.label || process.admin_type}
                            </Badge>
                            <Badge variant="outline">
                              {ADMIN_STATUS.find(s => s.value === process.status)?.label || process.status}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mt-1">{process.subject}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                            {process.organ_entity && <span>Órgão: {process.organ_entity}</span>}
                            {process.deadline && <span>Prazo: {new Date(process.deadline).toLocaleDateString('pt-BR')}</span>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(process.id, 'process')}>
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

        <TabsContent value="services" className="mt-4">
          <Card>
            <CardContent className="p-6">
              {filteredServices.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">Nenhum serviço extrajudicial encontrado</p>
                  <Button className="mt-4" onClick={() => openNewDialog('service')}>
                    <Plus className="h-4 w-4 mr-2" /> Cadastrar Serviço
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredServices.map((service) => (
                    <div key={service.id} className="p-4 rounded-xl border bg-white hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-gray-900">{service.objective || service.service_type}</h4>
                            {service.category && (
                              <Badge className="bg-purple-100 text-purple-700">{service.category}</Badge>
                            )}
                            <Badge className={service.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                              {service.status === 'completed' ? 'Concluído' : 'Pendente'}
                            </Badge>
                          </div>
                          {service.details && <p className="text-gray-600 mt-1">{service.details}</p>}
                          {service.client_name && (
                            <p className="text-sm text-gray-400 mt-1">Cliente: {service.client_name}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon">
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

      {/* Dialog para Cadastro */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open)
        if (!open) resetForms()
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {formType === 'judicial' ? 'Novo Processo Judicial' :
               formType === 'administrative' ? 'Novo Processo Administrativo' :
               'Novo Serviço Extrajudicial'}
            </DialogTitle>
          </DialogHeader>

          {/* Formulário Judicial */}
          {formType === 'judicial' && (
            <form onSubmit={handleJudicialSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Número do Processo *</Label>
                  <Input
                    value={judicialForm.number}
                    onChange={(e) => setJudicialForm({ ...judicialForm, number: e.target.value })}
                    placeholder="0000000-00.0000.0.00.0000"
                    required
                  />
                </div>
                <div className="space-y-2 flex items-end">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="office_origin"
                      checked={judicialForm.is_office_origin}
                      onCheckedChange={(checked) => setJudicialForm({ ...judicialForm, is_office_origin: checked })}
                    />
                    <Label htmlFor="office_origin">Processo originário do escritório</Label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Processo *</Label>
                  <Select
                    value={judicialForm.process_type}
                    onValueChange={(value) => setJudicialForm({ ...judicialForm, process_type: value, process_subtype: '' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {JUDICIAL_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {judicialForm.process_type && (
                  <div className="space-y-2">
                    <Label>Subtipo</Label>
                    <Select
                      value={judicialForm.process_subtype}
                      onValueChange={(value) => setJudicialForm({ ...judicialForm, process_subtype: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o subtipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {JUDICIAL_TYPES.find(t => t.value === judicialForm.process_type)?.subtypes.map(sub => (
                          <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cliente</Label>
                  <Select
                    value={judicialForm.client_id}
                    onValueChange={(value) => setJudicialForm({ ...judicialForm, client_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Fase Processual</Label>
                  <Select
                    value={judicialForm.phase}
                    onValueChange={(value) => setJudicialForm({ ...judicialForm, phase: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {JUDICIAL_PHASES.map(phase => (
                        <SelectItem key={phase.value} value={phase.value}>{phase.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Objeto da Ação</Label>
                <Input
                  value={judicialForm.subject}
                  onChange={(e) => setJudicialForm({ ...judicialForm, subject: e.target.value })}
                  placeholder="Ex: Ação de cobrança de alimentos"
                />
              </div>

              <div className="space-y-2">
                <Label>Vara/Tribunal</Label>
                <Input
                  value={judicialForm.court}
                  onChange={(e) => setJudicialForm({ ...judicialForm, court: e.target.value })}
                  placeholder="Ex: 1ª Vara de Família de Recife"
                />
              </div>

              <div className="space-y-2">
                <Label>Detalhes do Caso</Label>
                <Textarea
                  value={judicialForm.details}
                  onChange={(e) => setJudicialForm({ ...judicialForm, details: e.target.value })}
                  rows={5}
                  placeholder="Descreva os detalhes do caso..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button type="submit">Cadastrar Processo</Button>
              </div>
            </form>
          )}

          {/* Formulário Administrativo */}
          {formType === 'administrative' && (
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Número do Processo (opcional)</Label>
                  <Input
                    value={adminForm.number}
                    onChange={(e) => setAdminForm({ ...adminForm, number: e.target.value })}
                    placeholder="Número do processo"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo *</Label>
                  <Select
                    value={adminForm.admin_type}
                    onValueChange={(value) => setAdminForm({ ...adminForm, admin_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {ADMIN_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Órgão/Entidade</Label>
                  <Input
                    value={adminForm.organ_entity}
                    onChange={(e) => setAdminForm({ ...adminForm, organ_entity: e.target.value })}
                    placeholder="Ex: INSS, DETRAN, Prefeitura"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unidade/Local</Label>
                  <Input
                    value={adminForm.unit_location}
                    onChange={(e) => setAdminForm({ ...adminForm, unit_location: e.target.value })}
                    placeholder="Ex: Regional do INSS Centro"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Data de Abertura</Label>
                  <Input
                    type="date"
                    value={adminForm.opening_date}
                    onChange={(e) => setAdminForm({ ...adminForm, opening_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Prazo Final</Label>
                  <Input
                    type="date"
                    value={adminForm.deadline}
                    onChange={(e) => setAdminForm({ ...adminForm, deadline: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={adminForm.status}
                    onValueChange={(value) => setAdminForm({ ...adminForm, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ADMIN_STATUS.map(status => (
                        <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Assunto/Objeto</Label>
                <Input
                  value={adminForm.subject}
                  onChange={(e) => setAdminForm({ ...adminForm, subject: e.target.value })}
                  placeholder="Assunto do processo"
                />
              </div>

              <div className="space-y-2">
                <Label>Detalhes do Caso</Label>
                <Textarea
                  value={adminForm.details}
                  onChange={(e) => setAdminForm({ ...adminForm, details: e.target.value })}
                  rows={5}
                  placeholder="Descreva os detalhes..."
                />
              </div>

              <div className="space-y-2">
                <Label>Cliente</Label>
                <Select
                  value={adminForm.client_id}
                  onValueChange={(value) => setAdminForm({ ...adminForm, client_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button type="submit">Cadastrar Processo</Button>
              </div>
            </form>
          )}

          {/* Formulário Serviço */}
          {formType === 'service' && (
            <form onSubmit={handleServiceSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Objetivo do Serviço *</Label>
                <Input
                  value={serviceForm.objective}
                  onChange={(e) => setServiceForm({ ...serviceForm, objective: e.target.value })}
                  placeholder="Descreva o objetivo do serviço"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoria *</Label>
                  <Select
                    value={serviceForm.category}
                    onValueChange={(value) => setServiceForm({ ...serviceForm, category: value, service_type: '' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_CATEGORIES.map(cat => (
                        <SelectItem key={cat.category} value={cat.category}>{cat.category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {serviceForm.category && (
                  <div className="space-y-2">
                    <Label>Tipo de Serviço *</Label>
                    <Select
                      value={serviceForm.service_type}
                      onValueChange={(value) => setServiceForm({ ...serviceForm, service_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o serviço" />
                      </SelectTrigger>
                      <SelectContent>
                        {SERVICE_CATEGORIES.find(c => c.category === serviceForm.category)?.services.map(serv => (
                          <SelectItem key={serv} value={serv}>{serv}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Cliente</Label>
                <Select
                  value={serviceForm.client_id}
                  onValueChange={(value) => setServiceForm({ ...serviceForm, client_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Detalhes</Label>
                <Textarea
                  value={serviceForm.details}
                  onChange={(e) => setServiceForm({ ...serviceForm, details: e.target.value })}
                  rows={5}
                  placeholder="Detalhes do serviço..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button type="submit">Cadastrar Serviço</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
