'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { 
  Plus, FileText, Edit, Trash2, Copy, Download, Upload, 
  Eye, Printer, Search, FolderOpen, Clock, FileDown, File, AlertCircle
} from 'lucide-react'

const TEMPLATE_CATEGORIES = [
  { value: 'contrato', label: 'Contrato' },
  { value: 'peticao', label: 'Petição' },
  { value: 'procuracao', label: 'Procuração' },
  { value: 'oficio', label: 'Ofício' },
  { value: 'declaracao', label: 'Declaração' },
  { value: 'notificacao', label: 'Notificação' },
  { value: 'parecer', label: 'Parecer' },
  { value: 'outros', label: 'Outros' }
]

const AVAILABLE_VARIABLES = [
  { tag: '{nome}', description: 'Nome completo do cliente' },
  { tag: '{cpf}', description: 'CPF do cliente' },
  { tag: '{rg}', description: 'RG do cliente' },
  { tag: '{endereco}', description: 'Endereço completo' },
  { tag: '{telefone}', description: 'Telefone do cliente' },
  { tag: '{email}', description: 'Email do cliente' },
  { tag: '{data_nascimento}', description: 'Data de nascimento' },
  { tag: '{profissao}', description: 'Profissão' },
  { tag: '{estado_civil}', description: 'Estado civil' },
  { tag: '{nome_mae}', description: 'Nome da mãe' },
  { tag: '{nacionalidade}', description: 'Nacionalidade' },
  { tag: '{cep}', description: 'CEP' },
  { tag: '{cidade}', description: 'Cidade' },
  { tag: '{estado}', description: 'Estado (UF)' },
  { tag: '{bairro}', description: 'Bairro' },
  { tag: '{data_hoje}', description: 'Data atual' },
  { tag: '{data_extenso}', description: 'Data por extenso' },
  { tag: '{advogado}', description: 'Nome do advogado' },
  { tag: '{oab}', description: 'Número da OAB' }
]

export default function DocumentsPage({ user }) {
  const [templates, setTemplates] = useState([])
  const [clients, setClients] = useState([])
  const [generatedDocs, setGeneratedDocs] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('templates')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [previewContent, setPreviewContent] = useState('')
  const [generating, setGenerating] = useState(false)
  const fileInputRef = useRef(null)
  
  const [templateForm, setTemplateForm] = useState({
    title: '',
    category: '',
    content: '',
    file_data: null,
    file_name: ''
  })

  const [generateForm, setGenerateForm] = useState({
    template_id: '',
    client_id: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [templatesRes, clientsRes, docsRes] = await Promise.all([
        fetch('/api/documents'),
        fetch('/api/clients'),
        fetch('/api/generated-docs')
      ])

      if (templatesRes.ok) setTemplates(await templatesRes.json())
      if (clientsRes.ok) setClients(await clientsRes.json())
      if (docsRes.ok) {
        const docs = await docsRes.json()
        setGeneratedDocs(Array.isArray(docs) ? docs : [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const ext = file.name.split('.').pop().toLowerCase()
    
    if (ext === 'docx' || ext === 'doc') {
      const reader = new FileReader()
      reader.onload = async (event) => {
        const base64Data = event.target.result
        
        setTemplateForm(prev => ({
          ...prev,
          title: prev.title || file.name.replace(/\.[^/.]+$/, ''),
          file_data: base64Data,
          file_name: file.name,
          content: `Arquivo carregado: ${file.name}\n\nUse as variáveis {nome}, {cpf}, etc. no seu documento Word.\nA formatação original será preservada na exportação.`
        }))
        toast.success('Arquivo .docx carregado!')
      }
      reader.readAsDataURL(file)
    } else {
      toast.error('Use apenas arquivos .docx')
    }
  }

  const handleTemplateSubmit = async (e) => {
    e.preventDefault()
    
    if (!templateForm.title || !templateForm.category) {
      toast.error('Preencha nome e categoria')
      return
    }

    try {
      const url = selectedTemplate ? `/api/documents/${selectedTemplate.id}` : '/api/documents'
      const method = selectedTemplate ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...templateForm,
          lawyer_id: user?.id
        })
      })

      if (response.ok) {
        toast.success(selectedTemplate ? 'Modelo atualizado!' : 'Modelo criado!')
        setIsDialogOpen(false)
        resetForm()
        fetchData()
      } else {
        throw new Error('Erro ao salvar')
      }
    } catch (error) {
      toast.error('Erro ao salvar modelo')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja EXCLUIR este modelo?')) return
    
    try {
      const response = await fetch(`/api/documents/${id}`, { 
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        toast.success('Modelo excluído!')
        setSelectedTemplate(null)
        fetchData()
      } else {
        throw new Error('Falha ao excluir')
      }
    } catch (error) {
      toast.error('Erro ao excluir modelo')
      console.error(error)
    }
  }

  const generateDocument = async () => {
    const template = templates.find(t => t.id === generateForm.template_id)
    const client = clients.find(c => c.id === generateForm.client_id)

    if (!template || !client) {
      toast.error('Selecione um modelo e um cliente')
      return
    }

    // Preview com substituições
    let content = template.content || ''
    const today = new Date()
    
    const replacements = {
      '{nome}': client.name || '',
      '{cpf}': client.cpf || '',
      '{rg}': client.rg || '',
      '{endereco}': [client.address, client.address_number, client.neighborhood, client.city, client.state].filter(Boolean).join(', '),
      '{telefone}': client.phone_mobile || client.phone || '',
      '{email}': client.email || '',
      '{data_nascimento}': client.birth_date ? new Date(client.birth_date).toLocaleDateString('pt-BR') : '',
      '{profissao}': client.profession || '',
      '{estado_civil}': client.marital_status || '',
      '{nome_mae}': client.mother_name || '',
      '{nacionalidade}': client.nationality || '',
      '{cep}': client.cep || '',
      '{cidade}': client.city || '',
      '{estado}': client.state || '',
      '{bairro}': client.neighborhood || '',
      '{data_hoje}': today.toLocaleDateString('pt-BR'),
      '{data_extenso}': today.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }),
      '{advogado}': user?.user_metadata?.name || 'Advogado',
      '{oab}': user?.user_metadata?.oab || ''
    }

    for (const [key, value] of Object.entries(replacements)) {
      content = content.split(key).join(value)
    }

    setPreviewContent(content)
    toast.success('Documento preparado! Use os botões para exportar.')
  }

  const handleDownloadDocx = async () => {
    const template = templates.find(t => t.id === generateForm.template_id)
    const client = clients.find(c => c.id === generateForm.client_id)
    
    if (!template?.file_data) {
      toast.error('Este modelo não possui arquivo .docx original')
      return
    }

    if (!client) {
      toast.error('Selecione um cliente')
      return
    }

    setGenerating(true)
    
    try {
      const response = await fetch('/api/documents/generate-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_data: template.file_data,
          client: client,
          lawyer_name: user?.user_metadata?.name || 'Advogado',
          lawyer_oab: user?.user_metadata?.oab || ''
        })
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${template.title}_${client.name}.docx`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success('Download DOCX iniciado!')
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao gerar')
      }
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Erro ao gerar DOCX: ' + error.message)
    } finally {
      setGenerating(false)
    }
  }

  const handleDownloadPdf = () => {
    if (!previewContent) {
      toast.error('Gere o documento primeiro')
      return
    }
    
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Documento</title>
          <style>
            @page { margin: 2cm; }
            body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; }
            pre { white-space: pre-wrap; word-wrap: break-word; font-family: inherit; margin: 0; }
          </style>
        </head>
        <body>
          <pre>${previewContent}</pre>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  const resetForm = () => {
    setSelectedTemplate(null)
    setTemplateForm({ title: '', category: '', content: '', file_data: null, file_name: '' })
  }

  const filteredTemplates = templates.filter(t =>
    t.title?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex gap-6 h-[calc(100vh-180px)]">
      {/* Sidebar - Templates */}
      <div className="w-80 flex-shrink-0">
        <Card className="h-full flex flex-col border-gray-200 dark:border-gray-700 dark:bg-gray-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg dark:text-white">Modelos</CardTitle>
              <Button size="sm" onClick={() => { resetForm(); setIsDialogOpen(true) }}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar modelos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>
          </CardHeader>
          <ScrollArea className="flex-1">
            <div className="px-4 pb-4 space-y-2">
              {filteredTemplates.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <FileText className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600 mb-2" />
                  <p className="text-sm">Nenhum modelo encontrado</p>
                </div>
              ) : (
                filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                      selectedTemplate?.id === template.id 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' 
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 dark:bg-gray-700/50'
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 mt-0.5">
                        {template.file_name ? (
                          <File className="h-4 w-4 text-blue-600" />
                        ) : (
                          <FileText className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-gray-900 dark:text-white break-words">
                          {template.title}
                        </h4>
                        <Badge variant="outline" className="mt-1 text-xs dark:text-gray-300 dark:border-gray-500">
                          {TEMPLATE_CATEGORIES.find(c => c.value === template.category)?.label || template.category}
                        </Badge>
                        {template.file_name && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 break-words">
                            {template.file_name}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400" 
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedTemplate(template)
                            setTemplateForm({
                              title: template.title,
                              category: template.category,
                              content: template.content,
                              file_data: template.file_data,
                              file_name: template.file_name
                            })
                            setIsDialogOpen(true)
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30" 
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(template.id)
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </Card>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="w-fit dark:bg-gray-800">
            <TabsTrigger value="templates" className="dark:text-gray-300 dark:data-[state=active]:text-white">
              <FileText className="h-4 w-4 mr-2" />
              Visualizar
            </TabsTrigger>
            <TabsTrigger value="generate" className="dark:text-gray-300 dark:data-[state=active]:text-white">
              <FolderOpen className="h-4 w-4 mr-2" />
              Gerar Documento
            </TabsTrigger>
            <TabsTrigger value="history" className="dark:text-gray-300 dark:data-[state=active]:text-white">
              <Clock className="h-4 w-4 mr-2" />
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="flex-1 mt-4">
            <Card className="h-full dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white break-words">
                  {selectedTemplate ? selectedTemplate.title : 'Selecione um modelo'}
                </CardTitle>
                {selectedTemplate && (
                  <CardDescription className="flex flex-wrap items-center gap-2 dark:text-gray-400">
                    Categoria: {TEMPLATE_CATEGORIES.find(c => c.value === selectedTemplate.category)?.label}
                    {selectedTemplate.file_name && (
                      <Badge variant="secondary" className="dark:bg-gray-700 dark:text-gray-300">
                        <File className="h-3 w-3 mr-1" />
                        {selectedTemplate.file_name}
                      </Badge>
                    )}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {selectedTemplate ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border dark:border-gray-600 max-h-[400px] overflow-y-auto">
                      <pre className="whitespace-pre-wrap font-mono text-sm dark:text-gray-200">{selectedTemplate.content}</pre>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Button variant="outline" className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700" onClick={() => {
                        navigator.clipboard.writeText(selectedTemplate.content)
                        toast.success('Copiado!')
                      }}>
                        <Copy className="h-4 w-4 mr-2" /> Copiar Texto
                      </Button>
                      {selectedTemplate.file_data && (
                        <Button variant="outline" className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700" onClick={() => {
                          const link = document.createElement('a')
                          link.href = selectedTemplate.file_data
                          link.download = selectedTemplate.file_name
                          link.click()
                        }}>
                          <FileDown className="h-4 w-4 mr-2" /> Baixar Original
                        </Button>
                      )}
                      <Button onClick={() => {
                        setGenerateForm({ ...generateForm, template_id: selectedTemplate.id })
                        setActiveTab('generate')
                      }}>
                        Usar este modelo
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                    <FileText className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
                    <p>Selecione um modelo na lista à esquerda</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="generate" className="flex-1 mt-4">
            <Card className="h-full dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Gerar Documento Personalizado</CardTitle>
                <CardDescription className="dark:text-gray-400">Selecione um modelo e um cliente para gerar o documento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="dark:text-gray-300">Modelo</Label>
                      <Select
                        value={generateForm.template_id}
                        onValueChange={(value) => setGenerateForm({ ...generateForm, template_id: value })}
                      >
                        <SelectTrigger className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                          <SelectValue placeholder="Selecione o modelo" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                          {templates.map(t => (
                            <SelectItem key={t.id} value={t.id} className="dark:text-white dark:hover:bg-gray-600">
                              <div className="flex items-center gap-2">
                                {t.file_name ? <File className="h-3 w-3 text-blue-500" /> : <FileText className="h-3 w-3" />}
                                <span className="truncate max-w-[200px]">{t.title}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="dark:text-gray-300">Cliente</Label>
                      <Select
                        value={generateForm.client_id}
                        onValueChange={(value) => setGenerateForm({ ...generateForm, client_id: value })}
                      >
                        <SelectTrigger className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                          <SelectValue placeholder="Selecione o cliente" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                          {clients.map(c => (
                            <SelectItem key={c.id} value={c.id} className="dark:text-white dark:hover:bg-gray-600">
                              {c.name} - {c.cpf}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={generateDocument} className="w-full" disabled={!generateForm.template_id || !generateForm.client_id}>
                      Preparar Documento
                    </Button>
                    
                    {previewContent && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-300 font-medium mb-2">Exportar documento:</p>
                        <div className="flex gap-2 flex-wrap">
                          <Button variant="outline" size="sm" onClick={handleDownloadDocx} disabled={generating}>
                            <FileDown className="h-4 w-4 mr-1" /> DOCX
                          </Button>
                          <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
                            <Download className="h-4 w-4 mr-1" /> PDF
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => window.print()}>
                            <Printer className="h-4 w-4 mr-1" /> Imprimir
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="dark:text-gray-300">Preview</Label>
                    <div className="p-4 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-lg h-[350px] overflow-y-auto">
                      {previewContent ? (
                        <pre className="whitespace-pre-wrap font-mono text-sm dark:text-gray-200">{previewContent}</pre>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
                          <Eye className="h-12 w-12 mb-2" />
                          <p className="text-sm">Selecione modelo e cliente para visualizar</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="flex-1 mt-4">
            <Card className="h-full dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Histórico de Documentos Gerados</CardTitle>
              </CardHeader>
              <CardContent>
                {generatedDocs.length === 0 ? (
                  <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                    <Clock className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
                    <p>Nenhum documento gerado ainda</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {generatedDocs.map((doc) => (
                      <div key={doc.id} className="p-4 rounded-lg border dark:border-gray-600 dark:bg-gray-700/50 flex items-center justify-between">
                        <div>
                          <h4 className="font-medium dark:text-white">{doc.template_title}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Cliente: {doc.client_name} • {new Date(doc.created_at).toLocaleString('pt-BR')}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300" onClick={() => {
                          setPreviewContent(doc.content)
                          setActiveTab('generate')
                        }}>
                          <Eye className="h-4 w-4 mr-2" /> Ver
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm() }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">{selectedTemplate ? 'Editar Modelo' : 'Novo Modelo de Documento'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <form onSubmit={handleTemplateSubmit} className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="dark:text-gray-300">Nome do Modelo *</Label>
                  <Input
                    value={templateForm.title}
                    onChange={(e) => setTemplateForm({ ...templateForm, title: e.target.value })}
                    placeholder="Ex: Procuração Ad Judicia"
                    className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="dark:text-gray-300">Categoria *</Label>
                  <Select
                    value={templateForm.category}
                    onValueChange={(value) => setTemplateForm({ ...templateForm, category: value })}
                  >
                    <SelectTrigger className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                      {TEMPLATE_CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value} className="dark:text-white">{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-blue-800 dark:text-blue-300">Upload de Documento (.docx)</Label>
                  <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2" /> Selecionar Arquivo
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".docx"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
                {templateForm.file_name && (
                  <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                    <File className="h-4 w-4" />
                    <span>{templateForm.file_name}</span>
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Carregado</Badge>
                  </div>
                )}
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                  Use variáveis como {'{nome}'}, {'{cpf}'} no seu documento Word para substituição automática.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="dark:text-gray-300">Descrição/Notas</Label>
                <Textarea
                  value={templateForm.content}
                  onChange={(e) => setTemplateForm({ ...templateForm, content: e.target.value })}
                  placeholder="Descrição do modelo..."
                  rows={8}
                  className="font-mono text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="dark:border-gray-600 dark:text-gray-300">
                  Cancelar
                </Button>
                <Button type="submit">{selectedTemplate ? 'Atualizar' : 'Criar'}</Button>
              </div>
            </form>

            <div>
              <Card className="dark:bg-gray-700 dark:border-gray-600">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm dark:text-white">Variáveis Disponíveis</CardTitle>
                  <CardDescription className="text-xs dark:text-gray-400">Use no seu documento Word</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[350px]">
                    <div className="space-y-1">
                      {AVAILABLE_VARIABLES.map((v) => (
                        <div key={v.tag} className="p-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 text-sm">
                          <span className="font-mono text-blue-600 dark:text-blue-400 font-medium">{v.tag}</span>
                          <span className="text-gray-500 dark:text-gray-400 ml-2 text-xs">- {v.description}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
