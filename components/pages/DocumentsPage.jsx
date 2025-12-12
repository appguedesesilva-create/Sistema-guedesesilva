'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Plus, FileText, Edit, Trash2, Copy, Download } from 'lucide-react'

export default function DocumentsPage({ user }) {
  const [documents, setDocuments] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'contract'
  })

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents')
      if (response.ok) {
        const data = await response.json()
        setDocuments(data)
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const url = selectedDocument ? `/api/documents/${selectedDocument.id}` : '/api/documents'
      const method = selectedDocument ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          lawyer_id: user.id
        })
      })

      if (response.ok) {
        toast.success(selectedDocument ? 'Documento atualizado!' : 'Documento criado!')
        setIsDialogOpen(false)
        resetForm()
        fetchDocuments()
      }
    } catch (error) {
      toast.error('Erro ao salvar documento')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este documento?')) return
    try {
      const response = await fetch(`/api/documents/${id}`, { method: 'DELETE' })
      if (response.ok) {
        toast.success('Documento excluído!')
        fetchDocuments()
      }
    } catch (error) {
      toast.error('Erro ao excluir documento')
    }
  }

  const handleCopy = (content) => {
    navigator.clipboard.writeText(content)
    toast.success('Conteúdo copiado!')
  }

  const resetForm = () => {
    setSelectedDocument(null)
    setFormData({ title: '', content: '', type: 'contract' })
  }

  const placeholders = [
    { tag: '#nome', description: 'Nome do cliente' },
    { tag: '#cpf', description: 'CPF do cliente' },
    { tag: '#rg', description: 'RG do cliente' },
    { tag: '#endereco', description: 'Endereço do cliente' },
    { tag: '#telefone', description: 'Telefone do cliente' },
    { tag: '#email', description: 'Email do cliente' },
    { tag: '#processo', description: 'Número do processo' },
    { tag: '#data', description: 'Data atual' },
    { tag: '#advogado', description: 'Nome do advogado' },
    { tag: '#oab', description: 'Número da OAB' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Modelos de Documentos</h2>
          <p className="text-sm text-gray-500">Crie modelos de procurações, contratos e outros documentos</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm() }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Modelo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedDocument ? 'Editar Documento' : 'Novo Modelo de Documento'}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-3 gap-6">
              <form onSubmit={handleSubmit} className="col-span-2 space-y-4">
                <div className="space-y-2">
                  <Label>Título do Modelo *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Procuração Ad Judicia"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Conteúdo do Documento *</Label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Digite o conteúdo do documento. Use as tags para substituição automática..."
                    rows={15}
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                  <Button type="submit">{selectedDocument ? 'Atualizar' : 'Criar'}</Button>
                </div>
              </form>
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Tags Disponíveis</CardTitle>
                    <CardDescription className="text-xs">Clique para inserir</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {placeholders.map((p) => (
                      <button
                        key={p.tag}
                        type="button"
                        className="w-full text-left p-2 rounded hover:bg-gray-100 text-sm"
                        onClick={() => setFormData({ ...formData, content: formData.content + p.tag })}
                      >
                        <span className="font-mono text-blue-600">{p.tag}</span>
                        <span className="text-gray-500 ml-2">- {p.description}</span>
                      </button>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Documents List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="col-span-full text-center text-gray-500 py-8">Carregando...</p>
        ) : documents.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-500">Nenhum modelo cadastrado</p>
              <p className="text-sm text-gray-400">Crie modelos de documentos para gerar automaticamente</p>
            </CardContent>
          </Card>
        ) : (
          documents.map((doc) => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  {doc.title}
                </CardTitle>
                <CardDescription className="text-xs">
                  Criado em {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                  {doc.content?.substring(0, 150)}...
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleCopy(doc.content)}>
                    <Copy className="h-3 w-3 mr-1" /> Copiar
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {
                    setSelectedDocument(doc)
                    setFormData(doc)
                    setIsDialogOpen(true)
                  }}>
                    <Edit className="h-3 w-3 mr-1" /> Editar
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(doc.id)}>
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
