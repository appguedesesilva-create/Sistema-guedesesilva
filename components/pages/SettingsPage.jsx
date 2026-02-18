'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { 
  Settings, 
  Moon, 
  Sun, 
  Download, 
  Upload, 
  Lock, 
  Mail, 
  User,
  Shield,
  Database,
  FileText,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react'

export default function SettingsPage({ user, darkMode, onToggleDarkMode }) {
  const [loading, setLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const [importLoading, setImportLoading] = useState(false)
  
  // Estados para alteração de senha
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  
  // Estados para alteração de email
  const [newEmail, setNewEmail] = useState('')
  const [emailPassword, setEmailPassword] = useState('')
  
  // Estatísticas do sistema
  const [stats, setStats] = useState({
    clients: 0,
    processes: 0,
    tasks: 0,
    contacts: 0,
    documents: 0,
    appointments: 0,
    payments: 0,
    expenses: 0
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const endpoints = ['clients', 'processes', 'tasks', 'contacts', 'documents', 'appointments', 'payments', 'expenses']
      const results = await Promise.all(
        endpoints.map(endpoint => 
          fetch(`/api/${endpoint}`).then(res => res.ok ? res.json() : [])
        )
      )
      
      setStats({
        clients: results[0]?.length || 0,
        processes: results[1]?.length || 0,
        tasks: results[2]?.length || 0,
        contacts: results[3]?.length || 0,
        documents: results[4]?.length || 0,
        appointments: results[5]?.length || 0,
        payments: results[6]?.length || 0,
        expenses: results[7]?.length || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  // ===== ALTERAR SENHA =====
  const handleChangePassword = async (e) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem')
      return
    }
    
    if (newPassword.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres')
      return
    }
    
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      if (error) throw error
      
      toast.success('Senha alterada com sucesso!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      toast.error(error.message || 'Erro ao alterar senha')
    } finally {
      setLoading(false)
    }
  }

  // ===== ALTERAR EMAIL =====
  const handleChangeEmail = async (e) => {
    e.preventDefault()
    
    if (!newEmail || !newEmail.includes('@')) {
      toast.error('Digite um email válido')
      return
    }
    
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      })
      
      if (error) throw error
      
      toast.success('Email de confirmação enviado para o novo endereço!')
      setNewEmail('')
      setEmailPassword('')
    } catch (error) {
      toast.error(error.message || 'Erro ao alterar email')
    } finally {
      setLoading(false)
    }
  }

  // ===== EXPORTAR DADOS (BACKUP) =====
  const handleExportData = async () => {
    setExportLoading(true)
    try {
      const endpoints = [
        { name: 'CLIENTES', endpoint: 'clients' },
        { name: 'PROCESSOS', endpoint: 'processes' },
        { name: 'TAREFAS', endpoint: 'tasks' },
        { name: 'CONTATOS', endpoint: 'contacts' },
        { name: 'DOCUMENTOS', endpoint: 'documents' },
        { name: 'ATENDIMENTOS', endpoint: 'appointments' },
        { name: 'PAGAMENTOS', endpoint: 'payments' },
        { name: 'DESPESAS', endpoint: 'expenses' }
      ]
      
      let backupContent = `╔════════════════════════════════════════════════════════════════════╗
║           BACKUP - GUEDES & SILVA ADVOCACIA                        ║
║           Data: ${new Date().toLocaleString('pt-BR')}                          
╚════════════════════════════════════════════════════════════════════╝

Usuário: ${user?.email}
Total de registros: ${Object.values(stats).reduce((a, b) => a + b, 0)}

`
      
      for (const { name, endpoint } of endpoints) {
        try {
          const response = await fetch(`/api/${endpoint}`)
          const data = response.ok ? await response.json() : []
          
          backupContent += `\n${'═'.repeat(70)}\n`
          backupContent += `█ ${name} (${data.length} registros)\n`
          backupContent += `${'═'.repeat(70)}\n\n`
          
          if (data.length === 0) {
            backupContent += `  Nenhum registro encontrado.\n`
          } else {
            data.forEach((item, index) => {
              backupContent += `──── Registro ${index + 1} ────\n`
              formatDataForExport(item, backupContent).split('\n').forEach(line => {
                backupContent += line + '\n'
              })
              backupContent += '\n'
            })
          }
        } catch (error) {
          backupContent += `\n[ERRO] Não foi possível exportar ${name}\n`
        }
      }
      
      backupContent += `\n${'═'.repeat(70)}\n`
      backupContent += `FIM DO BACKUP - ${new Date().toLocaleString('pt-BR')}\n`
      backupContent += `${'═'.repeat(70)}\n`
      
      // Criar e baixar arquivo
      const blob = new Blob([backupContent], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `backup_guedes_silva_${new Date().toISOString().split('T')[0]}.txt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast.success('Backup realizado com sucesso!')
    } catch (error) {
      toast.error('Erro ao exportar dados')
      console.error(error)
    } finally {
      setExportLoading(false)
    }
  }

  // Função auxiliar para formatar dados
  const formatDataForExport = (obj, prefix = '') => {
    let result = ''
    for (const [key, value] of Object.entries(obj)) {
      if (key === 'id' || key === 'lawyer_id' || key === '_id') continue
      
      const label = formatLabel(key)
      
      if (value === null || value === undefined || value === '') {
        continue
      } else if (Array.isArray(value)) {
        if (value.length > 0) {
          result += `  ${label}:\n`
          value.forEach((item, i) => {
            if (typeof item === 'object') {
              result += `    [${i + 1}] `
              const subItems = Object.entries(item)
                .filter(([k, v]) => v && k !== 'id')
                .map(([k, v]) => `${formatLabel(k)}: ${v}`)
                .join(', ')
              result += subItems + '\n'
            } else {
              result += `    - ${item}\n`
            }
          })
        }
      } else if (typeof value === 'object') {
        result += `  ${label}:\n`
        for (const [subKey, subValue] of Object.entries(value)) {
          if (subValue) {
            result += `    ${formatLabel(subKey)}: ${subValue}\n`
          }
        }
      } else {
        result += `  ${label}: ${value}\n`
      }
    }
    return result
  }

  const formatLabel = (key) => {
    const labels = {
      name: 'Nome',
      email: 'Email',
      phone: 'Telefone',
      phone_mobile: 'Celular',
      cpf: 'CPF',
      cnpj: 'CNPJ',
      rg: 'RG',
      address: 'Endereço',
      city: 'Cidade',
      state: 'Estado',
      cep: 'CEP',
      birth_date: 'Data de Nascimento',
      profession: 'Profissão',
      marital_status: 'Estado Civil',
      nationality: 'Nacionalidade',
      mother_name: 'Nome da Mãe',
      razao_social: 'Razão Social',
      nome_fantasia: 'Nome Fantasia',
      inscricao_estadual: 'Inscrição Estadual',
      natureza_juridica: 'Natureza Jurídica',
      socios: 'Sócios',
      bank_accounts: 'Contas Bancárias',
      number: 'Número',
      subject: 'Assunto',
      description: 'Descrição',
      notes: 'Observações',
      status: 'Status',
      type: 'Tipo',
      value: 'Valor',
      amount: 'Valor',
      date: 'Data',
      due_date: 'Data de Vencimento',
      created_at: 'Criado em',
      updated_at: 'Atualizado em',
      client_name: 'Cliente',
      client_id: 'ID do Cliente',
      process_id: 'ID do Processo',
      title: 'Título',
      content: 'Conteúdo',
      category: 'Categoria',
      priority: 'Prioridade',
      completed: 'Concluído',
      pis: 'PIS',
      nis: 'NIS',
      ctps: 'CTPS',
      voter_title: 'Título de Eleitor',
      govbr_password: 'Senha GOV.BR',
      person_type: 'Tipo de Pessoa',
      rg_issuer: 'Órgão Expedidor RG',
      rg_expedition_date: 'Data Expedição RG',
      neighborhood: 'Bairro',
      address_number: 'Número',
      address_complement: 'Complemento',
      whatsapp: 'WhatsApp'
    }
    return labels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  // ===== IMPORTAR DADOS =====
  const handleImportData = async (event) => {
    const file = event.target.files[0]
    if (!file) return
    
    setImportLoading(true)
    try {
      const text = await file.text()
      
      // Verificar se é um arquivo de backup válido
      if (!text.includes('BACKUP - GUEDES & SILVA')) {
        toast.error('Arquivo de backup inválido')
        return
      }
      
      // Por segurança, mostrar confirmação antes de importar
      toast.info('Funcionalidade de importação em desenvolvimento. Por segurança, a restauração completa requer supervisão técnica.')
      
    } catch (error) {
      toast.error('Erro ao ler arquivo')
      console.error(error)
    } finally {
      setImportLoading(false)
      event.target.value = ''
    }
  }

  // ===== EXPORTAR DADOS EM JSON (para restauração futura) =====
  const handleExportJSON = async () => {
    setExportLoading(true)
    try {
      const endpoints = ['clients', 'processes', 'tasks', 'contacts', 'documents', 'appointments', 'payments', 'expenses']
      
      const allData = {}
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`/api/${endpoint}`)
          allData[endpoint] = response.ok ? await response.json() : []
        } catch (error) {
          allData[endpoint] = []
        }
      }
      
      const backupData = {
        version: '1.0',
        date: new Date().toISOString(),
        user: user?.email,
        data: allData
      }
      
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `backup_guedes_silva_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast.success('Backup JSON realizado com sucesso!')
    } catch (error) {
      toast.error('Erro ao exportar dados')
    } finally {
      setExportLoading(false)
    }
  }

  // ===== IMPORTAR JSON =====
  const handleImportJSON = async (event) => {
    const file = event.target.files[0]
    if (!file) return
    
    setImportLoading(true)
    try {
      const text = await file.text()
      const backupData = JSON.parse(text)
      
      if (!backupData.version || !backupData.data) {
        toast.error('Arquivo de backup JSON inválido')
        return
      }
      
      // Confirmar importação
      const confirmImport = window.confirm(
        `Deseja restaurar o backup de ${new Date(backupData.date).toLocaleString('pt-BR')}?\n\n` +
        `Isso irá adicionar os dados do backup ao sistema.\n\n` +
        `Clientes: ${backupData.data.clients?.length || 0}\n` +
        `Processos: ${backupData.data.processes?.length || 0}\n` +
        `Tarefas: ${backupData.data.tasks?.length || 0}\n` +
        `Contatos: ${backupData.data.contacts?.length || 0}`
      )
      
      if (!confirmImport) {
        setImportLoading(false)
        return
      }
      
      // Importar cada tipo de dado
      let imported = 0
      let errors = 0
      
      for (const [endpoint, items] of Object.entries(backupData.data)) {
        if (!Array.isArray(items)) continue
        
        for (const item of items) {
          try {
            // Remover IDs antigos para criar novos registros
            const { id, _id, ...dataWithoutId } = item
            
            const response = await fetch(`/api/${endpoint}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...dataWithoutId,
                lawyer_id: user?.id
              })
            })
            
            if (response.ok) {
              imported++
            } else {
              errors++
            }
          } catch (error) {
            errors++
          }
        }
      }
      
      toast.success(`Importação concluída! ${imported} registros importados, ${errors} erros.`)
      fetchStats() // Atualizar estatísticas
      
    } catch (error) {
      toast.error('Erro ao importar dados: ' + error.message)
    } finally {
      setImportLoading(false)
      event.target.value = ''
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 text-white">
          <Settings className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Configurações</h1>
          <p className="text-sm text-gray-500">Gerencie sua conta e preferências do sistema</p>
        </div>
      </div>

      <Tabs defaultValue="appearance" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="appearance">Aparência</TabsTrigger>
          <TabsTrigger value="account">Conta</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
          <TabsTrigger value="about">Sobre</TabsTrigger>
        </TabsList>

        {/* ===== ABA APARÊNCIA ===== */}
        <TabsContent value="appearance" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                Tema do Sistema
              </CardTitle>
              <CardDescription>
                Escolha entre o modo claro ou escuro para melhor visualização
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-slate-800">
                <div className="flex items-center gap-3">
                  <Sun className="h-5 w-5 text-yellow-500" />
                  <span>Modo Claro</span>
                </div>
                <Switch
                  checked={darkMode}
                  onCheckedChange={onToggleDarkMode}
                />
                <div className="flex items-center gap-3">
                  <span>Modo Escuro</span>
                  <Moon className="h-5 w-5 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== ABA CONTA ===== */}
        <TabsContent value="account" className="space-y-4 mt-4">
          {/* Informações do usuário */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações da Conta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-slate-800">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {user?.user_metadata?.name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-lg">{user?.user_metadata?.name || 'Advogado'}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                  <p className="text-xs text-gray-400">OAB: {user?.user_metadata?.oab || 'Não informado'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alterar Senha */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Alterar Senha
              </CardTitle>
              <CardDescription>
                Atualize sua senha de acesso ao sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nova Senha</Label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Digite a nova senha"
                      minLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Confirmar Nova Senha</Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirme a nova senha"
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Lock className="h-4 w-4 mr-2" />}
                  Alterar Senha
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Alterar Email */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Alterar Email
              </CardTitle>
              <CardDescription>
                Atualize seu endereço de email. Um link de confirmação será enviado.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangeEmail} className="space-y-4">
                <div className="space-y-2">
                  <Label>Email Atual</Label>
                  <Input value={user?.email || ''} disabled className="bg-gray-100" />
                </div>
                <div className="space-y-2">
                  <Label>Novo Email</Label>
                  <Input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Digite o novo email"
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
                  Alterar Email
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== ABA BACKUP ===== */}
        <TabsContent value="backup" className="space-y-4 mt-4">
          {/* Estatísticas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Dados do Sistema
              </CardTitle>
              <CardDescription>
                Resumo de todos os registros cadastrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div className="p-3 rounded-lg bg-blue-50 text-center">
                  <p className="text-2xl font-bold text-blue-600">{stats.clients}</p>
                  <p className="text-xs text-gray-600">Clientes</p>
                </div>
                <div className="p-3 rounded-lg bg-green-50 text-center">
                  <p className="text-2xl font-bold text-green-600">{stats.processes}</p>
                  <p className="text-xs text-gray-600">Processos</p>
                </div>
                <div className="p-3 rounded-lg bg-purple-50 text-center">
                  <p className="text-2xl font-bold text-purple-600">{stats.tasks}</p>
                  <p className="text-xs text-gray-600">Tarefas</p>
                </div>
                <div className="p-3 rounded-lg bg-orange-50 text-center">
                  <p className="text-2xl font-bold text-orange-600">{stats.contacts}</p>
                  <p className="text-xs text-gray-600">Contatos</p>
                </div>
                <div className="p-3 rounded-lg bg-pink-50 text-center">
                  <p className="text-2xl font-bold text-pink-600">{stats.appointments}</p>
                  <p className="text-xs text-gray-600">Atendimentos</p>
                </div>
                <div className="p-3 rounded-lg bg-cyan-50 text-center">
                  <p className="text-2xl font-bold text-cyan-600">{stats.documents}</p>
                  <p className="text-xs text-gray-600">Documentos</p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-50 text-center">
                  <p className="text-2xl font-bold text-emerald-600">{stats.payments}</p>
                  <p className="text-xs text-gray-600">Pagamentos</p>
                </div>
                <div className="p-3 rounded-lg bg-red-50 text-center">
                  <p className="text-2xl font-bold text-red-600">{stats.expenses}</p>
                  <p className="text-xs text-gray-600">Despesas</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4 text-center">
                Total: <strong>{Object.values(stats).reduce((a, b) => a + b, 0)}</strong> registros
              </p>
            </CardContent>
          </Card>

          {/* Exportar Backup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-green-600" />
                Exportar Dados (Backup)
              </CardTitle>
              <CardDescription>
                Baixe uma cópia de todos os seus dados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Recomendamos fazer backup regularmente para proteger seus dados.
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={handleExportData} 
                  disabled={exportLoading}
                  className="h-auto py-4 flex-col gap-2"
                  variant="outline"
                >
                  {exportLoading ? (
                    <RefreshCw className="h-6 w-6 animate-spin" />
                  ) : (
                    <FileText className="h-6 w-6" />
                  )}
                  <span>Exportar TXT</span>
                  <span className="text-xs text-gray-500">Formato legível</span>
                </Button>
                
                <Button 
                  onClick={handleExportJSON} 
                  disabled={exportLoading}
                  className="h-auto py-4 flex-col gap-2"
                  variant="outline"
                >
                  {exportLoading ? (
                    <RefreshCw className="h-6 w-6 animate-spin" />
                  ) : (
                    <Database className="h-6 w-6" />
                  )}
                  <span>Exportar JSON</span>
                  <span className="text-xs text-gray-500">Para restauração</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Importar Backup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-blue-600" />
                Restaurar Dados (Importar)
              </CardTitle>
              <CardDescription>
                Restaure seus dados a partir de um arquivo de backup JSON
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  A importação irá adicionar os dados do backup ao sistema. Dados existentes não serão apagados.
                </AlertDescription>
              </Alert>
              
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                  id="import-json"
                />
                <label htmlFor="import-json">
                  <Button 
                    asChild
                    disabled={importLoading}
                    variant="outline"
                  >
                    <span>
                      {importLoading ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      Selecionar arquivo JSON
                    </span>
                  </Button>
                </label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== ABA SOBRE ===== */}
        <TabsContent value="about" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Sobre o Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <img 
                  src="/logo.png" 
                  alt="Logo" 
                  className="w-16 h-16 rounded-xl"
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%231e293b" width="100" height="100" rx="20"/><text x="50" y="60" text-anchor="middle" fill="white" font-size="30" font-weight="bold">GS</text></svg>'
                  }}
                />
                <div>
                  <h3 className="font-bold text-xl">Guedes & Silva Advocacia</h3>
                  <p className="text-sm text-gray-500">Sistema de Gestão Jurídica</p>
                </div>
              </div>
              
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800 space-y-2">
                <p className="text-sm"><strong>Versão:</strong> 1.0.0</p>
                <p className="text-sm"><strong>Desenvolvido por:</strong> Emergent AI</p>
                <p className="text-sm"><strong>Tecnologias:</strong> Next.js, React, Supabase, Tailwind CSS</p>
              </div>
              
              <p className="text-sm text-gray-500">
                Este sistema foi desenvolvido para auxiliar na gestão de escritórios de advocacia,
                oferecendo ferramentas para controle de clientes, processos, finanças e documentos.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
