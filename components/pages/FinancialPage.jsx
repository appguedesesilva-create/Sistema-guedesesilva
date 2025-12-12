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
import {
  Plus, DollarSign, TrendingUp, TrendingDown, Calendar,
  Edit, Trash2, ArrowUpCircle, ArrowDownCircle
} from 'lucide-react'

export default function FinancialPage({ user }) {
  const [contracts, setContracts] = useState([])
  const [payments, setPayments] = useState([])
  const [expenses, setExpenses] = useState([])
  const [clients, setClients] = useState([])
  const [processes, setProcesses] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState('contract')
  const [selectedItem, setSelectedItem] = useState(null)
  const [loading, setLoading] = useState(true)

  const [contractForm, setContractForm] = useState({
    client_id: '',
    process_id: '',
    total_value: '',
    installments: 1,
    description: '',
    status: 'active'
  })

  const [paymentForm, setPaymentForm] = useState({
    contract_id: '',
    amount: '',
    date: '',
    status: 'pending',
    description: ''
  })

  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    date: '',
    category: 'office',
    process_id: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [contractsRes, paymentsRes, expensesRes, clientsRes, processesRes] = await Promise.all([
        fetch('/api/contracts'),
        fetch('/api/payments'),
        fetch('/api/expenses'),
        fetch('/api/clients'),
        fetch('/api/processes')
      ])

      if (contractsRes.ok) setContracts(await contractsRes.json())
      if (paymentsRes.ok) setPayments(await paymentsRes.json())
      if (expensesRes.ok) setExpenses(await expensesRes.json())
      if (clientsRes.ok) setClients(await clientsRes.json())
      if (processesRes.ok) setProcesses(await processesRes.json())
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleContractSubmit = async (e) => {
    e.preventDefault()
    try {
      const url = selectedItem ? `/api/contracts/${selectedItem.id}` : '/api/contracts'
      const method = selectedItem ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...contractForm,
          total_value: parseFloat(contractForm.total_value),
          lawyer_id: user.id
        })
      })

      if (response.ok) {
        toast.success(selectedItem ? 'Contrato atualizado!' : 'Contrato cadastrado!')
        setIsDialogOpen(false)
        resetForms()
        fetchData()
      }
    } catch (error) {
      toast.error('Erro ao salvar contrato')
    }
  }

  const handlePaymentSubmit = async (e) => {
    e.preventDefault()
    try {
      const url = selectedItem ? `/api/payments/${selectedItem.id}` : '/api/payments'
      const method = selectedItem ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...paymentForm,
          amount: parseFloat(paymentForm.amount)
        })
      })

      if (response.ok) {
        toast.success(selectedItem ? 'Pagamento atualizado!' : 'Pagamento registrado!')
        setIsDialogOpen(false)
        resetForms()
        fetchData()
      }
    } catch (error) {
      toast.error('Erro ao salvar pagamento')
    }
  }

  const handleExpenseSubmit = async (e) => {
    e.preventDefault()
    try {
      const url = selectedItem ? `/api/expenses/${selectedItem.id}` : '/api/expenses'
      const method = selectedItem ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...expenseForm,
          amount: parseFloat(expenseForm.amount),
          lawyer_id: user.id
        })
      })

      if (response.ok) {
        toast.success(selectedItem ? 'Despesa atualizada!' : 'Despesa registrada!')
        setIsDialogOpen(false)
        resetForms()
        fetchData()
      }
    } catch (error) {
      toast.error('Erro ao salvar despesa')
    }
  }

  const handleDelete = async (id, type) => {
    if (!confirm('Tem certeza que deseja excluir?')) return
    try {
      const endpoint = type === 'contract' ? 'contracts' : type === 'payment' ? 'payments' : 'expenses'
      const response = await fetch(`/api/${endpoint}/${id}`, { method: 'DELETE' })
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
    setContractForm({ client_id: '', process_id: '', total_value: '', installments: 1, description: '', status: 'active' })
    setPaymentForm({ contract_id: '', amount: '', date: '', status: 'pending', description: '' })
    setExpenseForm({ description: '', amount: '', date: '', category: 'office', process_id: '' })
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0)
  }

  const totalContracts = contracts.reduce((sum, c) => sum + (c.total_value || 0), 0)
  const totalReceived = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.amount || 0), 0)
  const totalPending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + (p.amount || 0), 0)
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0)

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total em Contratos</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalContracts)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Valores Recebidos</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalReceived)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">A Receber</p>
                <p className="text-2xl font-bold text-yellow-600">{formatCurrency(totalPending)}</p>
              </div>
              <ArrowUpCircle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Despesas</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="contracts">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="contracts">Contratos</TabsTrigger>
            <TabsTrigger value="income">Entradas</TabsTrigger>
            <TabsTrigger value="expenses">Despesas</TabsTrigger>
            <TabsTrigger value="cashflow">Fluxo de Caixa</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setDialogType('contract'); setIsDialogOpen(true) }}>
              <Plus className="h-4 w-4 mr-2" /> Contrato
            </Button>
            <Button variant="outline" onClick={() => { setDialogType('payment'); setIsDialogOpen(true) }}>
              <ArrowUpCircle className="h-4 w-4 mr-2" /> Entrada
            </Button>
            <Button variant="outline" onClick={() => { setDialogType('expense'); setIsDialogOpen(true) }}>
              <ArrowDownCircle className="h-4 w-4 mr-2" /> Despesa
            </Button>
          </div>
        </div>

        <TabsContent value="contracts">
          <Card>
            <CardHeader>
              <CardTitle>Contratos</CardTitle>
              <CardDescription>{contracts.length} contratos cadastrados</CardDescription>
            </CardHeader>
            <CardContent>
              {contracts.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Nenhum contrato cadastrado</p>
              ) : (
                <div className="space-y-3">
                  {contracts.map((contract) => (
                    <div key={contract.id} className="p-4 rounded-lg border bg-white">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{contract.description || 'Contrato'}</h4>
                          <p className="text-sm text-gray-500">Cliente: {contract.client_name || 'Não vinculado'}</p>
                          <p className="text-sm text-gray-500">Parcelas: {contract.installments}x</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-blue-600">{formatCurrency(contract.total_value)}</p>
                          <Badge className={contract.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                            {contract.status === 'active' ? 'Ativo' : 'Finalizado'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-2">
                        <Button variant="ghost" size="sm" onClick={() => {
                          setSelectedItem(contract)
                          setContractForm(contract)
                          setDialogType('contract')
                          setIsDialogOpen(true)
                        }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(contract.id, 'contract')}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="income">
          <Card>
            <CardHeader>
              <CardTitle>Entradas</CardTitle>
              <CardDescription>Pagamentos recebidos</CardDescription>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Nenhuma entrada registrada</p>
              ) : (
                <div className="space-y-3">
                  {payments.map((payment) => (
                    <div key={payment.id} className="p-4 rounded-lg border bg-white flex justify-between items-center">
                      <div>
                        <p className="font-medium">{payment.description || 'Pagamento'}</p>
                        <p className="text-sm text-gray-500">{payment.date ? new Date(payment.date).toLocaleDateString('pt-BR') : ''}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={payment.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                          {payment.status === 'paid' ? 'Pago' : 'Pendente'}
                        </Badge>
                        <p className="font-bold text-green-600">{formatCurrency(payment.amount)}</p>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(payment.id, 'payment')}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <Card>
            <CardHeader>
              <CardTitle>Despesas</CardTitle>
              <CardDescription>Despesas do escritório</CardDescription>
            </CardHeader>
            <CardContent>
              {expenses.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Nenhuma despesa registrada</p>
              ) : (
                <div className="space-y-3">
                  {expenses.map((expense) => (
                    <div key={expense.id} className="p-4 rounded-lg border bg-white flex justify-between items-center">
                      <div>
                        <p className="font-medium">{expense.description}</p>
                        <p className="text-sm text-gray-500">
                          {expense.category === 'office' ? 'Escritório' : expense.category === 'service' ? 'Serviço' : 'Outros'}
                          {expense.date && ` - ${new Date(expense.date).toLocaleDateString('pt-BR')}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-bold text-red-600">-{formatCurrency(expense.amount)}</p>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(expense.id, 'expense')}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cashflow">
          <Card>
            <CardHeader>
              <CardTitle>Fluxo de Caixa</CardTitle>
              <CardDescription>Resumo financeiro</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-800">Entradas</h4>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(totalReceived)}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <h4 className="font-medium text-red-800">Saídas</h4>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800">Saldo</h4>
                  <p className={`text-2xl font-bold ${totalReceived - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(totalReceived - totalExpenses)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForms() }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogType === 'contract' ? (selectedItem ? 'Editar Contrato' : 'Novo Contrato') :
               dialogType === 'payment' ? (selectedItem ? 'Editar Entrada' : 'Nova Entrada') :
               (selectedItem ? 'Editar Despesa' : 'Nova Despesa')}
            </DialogTitle>
          </DialogHeader>

          {dialogType === 'contract' && (
            <form onSubmit={handleContractSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input value={contractForm.description} onChange={(e) => setContractForm({ ...contractForm, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cliente</Label>
                  <Select value={contractForm.client_id} onValueChange={(value) => setContractForm({ ...contractForm, client_id: value })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Processo</Label>
                  <Select value={contractForm.process_id} onValueChange={(value) => setContractForm({ ...contractForm, process_id: value })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {processes.map((p) => <SelectItem key={p.id} value={p.id}>{p.number}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor Total (R$)</Label>
                  <Input type="number" step="0.01" value={contractForm.total_value} onChange={(e) => setContractForm({ ...contractForm, total_value: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Parcelas</Label>
                  <Input type="number" min="1" value={contractForm.installments} onChange={(e) => setContractForm({ ...contractForm, installments: parseInt(e.target.value) })} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button type="submit">{selectedItem ? 'Atualizar' : 'Cadastrar'}</Button>
              </div>
            </form>
          )}

          {dialogType === 'payment' && (
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input value={paymentForm.description} onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor (R$)</Label>
                  <Input type="number" step="0.01" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input type="date" value={paymentForm.date} onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={paymentForm.status} onValueChange={(value) => setPaymentForm({ ...paymentForm, status: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="paid">Pago</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button type="submit">{selectedItem ? 'Atualizar' : 'Registrar'}</Button>
              </div>
            </form>
          )}

          {dialogType === 'expense' && (
            <form onSubmit={handleExpenseSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Descrição *</Label>
                <Input value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor (R$) *</Label>
                  <Input type="number" step="0.01" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input type="date" value={expenseForm.date} onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={expenseForm.category} onValueChange={(value) => setExpenseForm({ ...expenseForm, category: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="office">Escritório</SelectItem>
                    <SelectItem value="service">Custo de Serviço</SelectItem>
                    <SelectItem value="other">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button type="submit">{selectedItem ? 'Atualizar' : 'Registrar'}</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
