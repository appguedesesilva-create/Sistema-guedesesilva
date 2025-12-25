'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { 
  Plus, FileText, Edit, Trash2, Copy, Download, Upload, 
  Eye, Printer, Search, FolderOpen, Star, Clock, User
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
  { tag: '#nome', description: 'Nome completo do cliente', field: 'name' },
  { tag: '#cpf', description: 'CPF do cliente', field: 'cpf' },
  { tag: '#rg', description: 'RG do cliente', field: 'rg' },
  { tag: '#endereco', description: 'Endereço completo', field: 'address' },
  { tag: '#telefone', description: 'Telefone do cliente', field: 'phone_mobile' },
  { tag: '#email', description: 'Email do cliente', field: 'email' },
  { tag: '#data_nascimento', description: 'Data de nascimento', field: 'birth_date' },
  { tag: '#profissao', description: 'Profissão', field: 'profession' },
  { tag: '#estado_civil', description: 'Estado civil', field: 'marital_status' },
  { tag: '#nome_mae', description: 'Nome da mãe', field: 'mother_name' },
  { tag: '#nacionalidade', description: 'Nacionalidade', field: 'nationality' },
  { tag: '#cep', description: 'CEP', field: 'cep' },
  { tag: '#cidade', description: 'Cidade', field: 'city' },
  { tag: '#estado', description: 'Estado (UF)', field: 'state' },
  { tag: '#bairro', description: 'Bairro', field: 'neighborhood' },
  { tag: '#data_hoje', description: 'Data atual', field: '_today' },
  { tag: '#data_extenso', description: 'Data por extenso', field: '_today_full' },
  { tag: '#advogado', description: 'Nome do advogado', field: '_lawyer_name' },
  { tag: '#oab', description: 'Número da OAB', field: '_lawyer_oab' }
]

export default function DocumentsPage({ user }) {
  const [templates, setTemplates] = useState([])
  const [clients, setClients] = useState([])
  const [generatedDocs, setGeneratedDocs] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('templates')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isGenerateOpen, setIsGenerateOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [previewContent, setPreviewContent] = useState('')
  const fileInputRef = useRef(null)
  
  const [templateForm, setTemplateForm] = useState({
    title: '',
    category: '',
    content: ''
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

    const allowedTypes = ['.txt', '.doc', '.docx', '.pdf']
    const ext = '.' + file.name.split('.').pop().toLowerCase()
    
    if (!allowedTypes.includes(ext)) {
      toast.error('Formato não suportado. Use: .txt, .doc, .docx ou .pdf')
      return
    }

    // Para arquivos .txt, ler o conteúdo
    if (ext === '.txt') {
      const reader = new FileReader()
      reader.onload = (e) => {
        setTemplateForm(prev => ({
          ...prev,
          content: e.target.result,
          title: prev.title || file.name.replace('.txt', '')
        }))
        toast.success('Arquivo carregado!')
      }
      reader.readAsText(file)
    } else {
      // Para outros formatos, apenas registrar o nome
      setTemplateForm(prev => ({
        ...prev,
        title: prev.title || file.name.replace(/\.[^/.]+$/, ''),
        content: `[Arquivo: ${file.name}]\n\nO conteúdo deste arquivo precisa ser convertido para texto.\nCole o conteúdo do documento abaixo:`
      }))
      toast.info('Para .doc/.docx/.pdf, cole o conteúdo do documento no campo de texto.')
    }
  }

  const handleTemplateSubmit = async (e) => {
    e.preventDefault()
    try {
      const url = selectedTemplate ? `/api/documents/${selectedTemplate.id}` : '/api/documents'
      const method = selectedTemplate ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...templateForm,
          lawyer_id: user.id
        })
      })

      if (response.ok) {
        toast.success(selectedTemplate ? 'Template atualizado!' : 'Template criado!')
        setIsDialogOpen(false)
        resetForm()
        fetchData()
      }
    } catch (error) {
      toast.error('Erro ao salvar template')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este template?')) return
    try {
      const response = await fetch(`/api/documents/${id}`, { method: 'DELETE' })
      if (response.ok) {
        toast.success('Template excluído!')
        fetchData()
      }
    } catch (error) {
      toast.error('Erro ao excluir template')
    }
  }

  const generateDocument = async () => {
    const template = templates.find(t => t.id === generateForm.template_id)
    const client = clients.find(c => c.id === generateForm.client_id)

    if (!template || !client) {
      toast.error('Selecione um template e um cliente')
      return
    }

    // Substituir variáveis
    let content = template.content

    // Dados do cliente
    content = content.replace(/#nome/g, client.name || '')
    content = content.replace(/#cpf/g, client.cpf || '')
    content = content.replace(/#rg/g, client.rg || '')
    content = content.replace(/#endereco/g, 
      [client.address, client.address_number, client.neighborhood, client.city, client.state].filter(Boolean).join(', ') || '')
    content = content.replace(/#telefone/g, client.phone_mobile || client.phone || '')
    content = content.replace(/#email/g, client.email || '')
    content = content.replace(/#data_nascimento/g, client.birth_date ? new Date(client.birth_date).toLocaleDateString('pt-BR') : '')
    content = content.replace(/#profissao/g, client.profession || '')
    content = content.replace(/#estado_civil/g, client.marital_status || '')
    content = content.replace(/#nome_mae/g, client.mother_name || '')
    content = content.replace(/#nacionalidade/g, client.nationality || '')
    content = content.replace(/#cep/g, client.cep || '')
    content = content.replace(/#cidade/g, client.city || '')
    content = content.replace(/#estado/g, client.state || '')
    content = content.replace(/#bairro/g, client.neighborhood || '')

    // Dados dinâmicos
    const today = new Date()
    content = content.replace(/#data_hoje/g, today.toLocaleDateString('pt-BR'))
    content = content.replace(/#data_extenso/g, today.toLocaleDateString('pt-BR', { 
      day: 'numeric', month: 'long', year: 'numeric' 
    }))
    content = content.replace(/#advogado/g, user?.user_metadata?.name || 'Advogado')
    content = content.replace(/#oab/g, user?.user_metadata?.oab || '')

    setPreviewContent(content)

    // Salvar documento gerado
    try {
      await fetch('/api/generated-docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_id: template.id,
          template_title: template.title,
          client_id: client.id,
          client_name: client.name,
          content: content,
          lawyer_id: user.id
        })
      })
      fetchData()
      toast.success('Documento gerado com sucesso!')
    } catch (error) {
      console.error('Error saving document:', error)
    }
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>Documento - Guedes & Silva</title>
          <style>
            body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; padding: 2cm; }
            pre { white-space: pre-wrap; font-family: inherit; }
          </style>
        </head>
        <body>
          <pre>${previewContent}</pre>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  const handleDownload = (format) => {
    const blob = new Blob([previewContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `documento_${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Download iniciado!')
  }

  const resetForm = () => {
    setSelectedTemplate(null)
    setTemplateForm({ title: '', category: '', content: '' })
  }

  const insertVariable = (tag) => {
    setTemplateForm(prev => ({
      ...prev,
      content: prev.content + tag
    }))
  }

  const filteredTemplates = templates.filter(t =>
    t.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex gap-6 h-[calc(100vh-180px)]">
      {/* Sidebar - Templates */}
      <div className="w-80 flex-shrink-0">
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Modelos</CardTitle>
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
                className="pl-9 h-9"
              />
            </div>
          </CardHeader>
          <ScrollArea className="flex-1">
            <div className="px-4 pb-4 space-y-2">
              {filteredTemplates.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                  <p className="text-sm">Nenhum modelo encontrado</p>
                </div>
              ) : (
                filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                      selectedTemplate?.id === template.id ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{template.title}</h4>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {TEMPLATE_CATEGORIES.find(c => c.value === template.category)?.label || template.category}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => {
                          e.stopPropagation()
                          setSelectedTemplate(template)
                          setTemplateForm(template)
                          setIsDialogOpen(true)
                        }}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(template.id)
                        }}>
                          <Trash2 className="h-3 w-3 text-red-500" />
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
      <div className="flex-1 flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="w-fit">
            <TabsTrigger value="templates">
              <FileText className="h-4 w-4 mr-2" />
              Visualizar
            </TabsTrigger>
            <TabsTrigger value="generate">
              <FolderOpen className="h-4 w-4 mr-2" />
              Gerar Documento
            </TabsTrigger>
            <TabsTrigger value="history">
              <Clock className="h-4 w-4 mr-2" />
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="flex-1 mt-4">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>
                  {selectedTemplate ? selectedTemplate.title : 'Selecione um modelo'}
                </CardTitle>
                {selectedTemplate && (
                  <CardDescription>
                    Categoria: {TEMPLATE_CATEGORIES.find(c => c.value === selectedTemplate.category)?.label}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {selectedTemplate ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg border max-h-[400px] overflow-y-auto">
                      <pre className="whitespace-pre-wrap font-mono text-sm">{selectedTemplate.content}</pre>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => {
                        navigator.clipboard.writeText(selectedTemplate.content)
                        toast.success('Copiado!')
                      }}>
                        <Copy className="h-4 w-4 mr-2" /> Copiar
                      </Button>
                      <Button onClick={() => {
                        setGenerateForm({ ...generateForm, template_id: selectedTemplate.id })
                        setActiveTab('generate')
                      }}>
                        Usar este modelo
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 text-gray-500">
                    <FileText className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                    <p>Selecione um modelo na lista à esquerda</p>
                    <p className="text-sm">ou crie um novo clicando no botão +</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="generate" className="flex-1 mt-4">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Gerar Documento Personalizado</CardTitle>
                <CardDescription>Selecione um modelo e um cliente para gerar o documento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Modelo</Label>
                      <Select
                        value={generateForm.template_id}
                        onValueChange={(value) => setGenerateForm({ ...generateForm, template_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o modelo" />
                        </SelectTrigger>
                        <SelectContent>
                          {templates.map(t => (
                            <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Cliente</Label>
                      <Select
                        value={generateForm.client_id}
                        onValueChange={(value) => setGenerateForm({ ...generateForm, client_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.name} - {c.cpf}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={generateDocument} className="w-full" disabled={!generateForm.template_id || !generateForm.client_id}>
                      Gerar Documento
                    </Button>
                  </div>

                  {previewContent && (
                    <div className="space-y-4">
                      <Label>Preview</Label>
                      <div className="p-4 bg-white border rounded-lg max-h-[300px] overflow-y-auto">
                        <pre className="whitespace-pre-wrap font-mono text-sm">{previewContent}</pre>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => handleDownload('txt')}>
                          <Download className="h-4 w-4 mr-2" /> Download TXT
                        </Button>
                        <Button variant="outline" onClick={handlePrint}>
                          <Printer className="h-4 w-4 mr-2" /> Imprimir
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="flex-1 mt-4">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Histórico de Documentos Gerados</CardTitle>
              </CardHeader>
              <CardContent>
                {generatedDocs.length === 0 ? (
                  <div className="text-center py-16 text-gray-500">
                    <Clock className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                    <p>Nenhum documento gerado ainda</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {generatedDocs.map((doc) => (
                      <div key={doc.id} className="p-4 rounded-lg border flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{doc.template_title}</h4>
                          <p className="text-sm text-gray-500">
                            Cliente: {doc.client_name} • {new Date(doc.created_at).toLocaleString('pt-BR')}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => {
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

      {/* Dialog para criar/editar template */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open)
        if (!open) resetForm()
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTemplate ? 'Editar Modelo' : 'Novo Modelo de Documento'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-6">
            <form onSubmit={handleTemplateSubmit} className="col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome do Modelo *</Label>
                  <Input
                    value={templateForm.title}
                    onChange={(e) => setTemplateForm({ ...templateForm, title: e.target.value })}
                    placeholder="Ex: Procuração Ad Judicia"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Categoria *</Label>
                  <Select
                    value={templateForm.category}
                    onValueChange={(value) => setTemplateForm({ ...templateForm, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {TEMPLATE_CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Conteúdo do Documento *</Label>
                  <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2" /> Upload
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.doc,.docx,.pdf"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
                <Textarea
                  value={templateForm.content}
                  onChange={(e) => setTemplateForm({ ...templateForm, content: e.target.value })}
                  placeholder="Digite ou cole o conteúdo do documento. Use as variáveis da lista ao lado para substituição automática..."
                  rows={15}
                  className="font-mono text-sm"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button type="submit">{selectedTemplate ? 'Atualizar' : 'Criar'}</Button>
              </div>
            </form>

            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Variáveis Disponíveis</CardTitle>
                  <CardDescription className="text-xs">Clique para inserir no documento</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-1">
                      {AVAILABLE_VARIABLES.map((v) => (
                        <button
                          key={v.tag}
                          type="button"
                          className="w-full text-left p-2 rounded hover:bg-blue-50 text-sm transition-colors"
                          onClick={() => insertVariable(v.tag)}
                        >
                          <span className="font-mono text-blue-600 font-medium">{v.tag}</span>
                          <span className="text-gray-500 ml-2 text-xs">- {v.description}</span>
                        </button>
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
