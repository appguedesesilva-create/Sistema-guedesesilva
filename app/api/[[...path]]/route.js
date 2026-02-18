import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'

// Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Helper function to handle CORS
function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

// Route handler function
async function handleRoute(request, { params }) {
  const { path = [] } = await params
  const route = `/${path.join('/')}`
  const method = request.method

  try {
    // Root endpoint
    if ((route === '/' || route === '/root') && method === 'GET') {
      return handleCORS(NextResponse.json({ message: "Guedes & Silva API - Supabase" }))
    }

    // ==================== LAWYERS ====================
    if (route === '/lawyers' && method === 'GET') {
      const { data, error } = await supabase.from('lawyers').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return handleCORS(NextResponse.json(data || []))
    }

    if (route === '/lawyers' && method === 'POST') {
      const body = await request.json()
      const newLawyer = {
        id: uuidv4(),
        ...body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      const { data, error } = await supabase.from('lawyers').insert([newLawyer]).select()
      if (error) throw error
      return handleCORS(NextResponse.json(data[0], { status: 201 }))
    }

    // ==================== CLIENTS ====================
    if (route === '/clients' && method === 'GET') {
      const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return handleCORS(NextResponse.json(data || []))
    }

    if (route === '/clients' && method === 'POST') {
      const body = await request.json()
      const newClient = {
        id: uuidv4(),
        ...body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      const { data, error } = await supabase.from('clients').insert([newClient]).select()
      if (error) throw error
      return handleCORS(NextResponse.json(data[0], { status: 201 }))
    }

    if (route.startsWith('/clients/') && method === 'GET') {
      const id = path[1]
      const { data, error } = await supabase.from('clients').select('*').eq('id', id).single()
      if (error) throw error
      return handleCORS(NextResponse.json(data))
    }

    if (route.startsWith('/clients/') && method === 'PUT') {
      const id = path[1]
      const body = await request.json()
      const { data, error } = await supabase
        .from('clients')
        .update({ ...body, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
      if (error) throw error
      return handleCORS(NextResponse.json(data[0]))
    }

    if (route.startsWith('/clients/') && method === 'DELETE') {
      const id = path[1]
      const { error } = await supabase.from('clients').delete().eq('id', id)
      if (error) throw error
      return handleCORS(NextResponse.json({ success: true }))
    }

    // ==================== PROCESSES ====================
    if (route === '/processes' && method === 'GET') {
      const { data, error } = await supabase.from('processes').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return handleCORS(NextResponse.json(data || []))
    }

    if (route === '/processes' && method === 'POST') {
      const body = await request.json()
      const newProcess = {
        id: uuidv4(),
        ...body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      const { data, error } = await supabase.from('processes').insert([newProcess]).select()
      if (error) throw error
      return handleCORS(NextResponse.json(data[0], { status: 201 }))
    }

    if (route.startsWith('/processes/') && method === 'GET') {
      const id = path[1]
      const { data, error } = await supabase.from('processes').select('*').eq('id', id).single()
      if (error) throw error
      return handleCORS(NextResponse.json(data))
    }

    if (route.startsWith('/processes/') && method === 'PUT') {
      const id = path[1]
      const body = await request.json()
      const { data, error } = await supabase
        .from('processes')
        .update({ ...body, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
      if (error) throw error
      return handleCORS(NextResponse.json(data[0]))
    }

    if (route.startsWith('/processes/') && method === 'DELETE') {
      const id = path[1]
      const { error } = await supabase.from('processes').delete().eq('id', id)
      if (error) throw error
      return handleCORS(NextResponse.json({ success: true }))
    }

    // ==================== TASKS ====================
    if (route === '/tasks' && method === 'GET') {
      const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return handleCORS(NextResponse.json(data || []))
    }

    if (route === '/tasks' && method === 'POST') {
      const body = await request.json()
      const newTask = {
        id: uuidv4(),
        ...body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      const { data, error } = await supabase.from('tasks').insert([newTask]).select()
      if (error) throw error
      return handleCORS(NextResponse.json(data[0], { status: 201 }))
    }

    if (route.startsWith('/tasks/') && method === 'GET') {
      const id = path[1]
      const { data, error } = await supabase.from('tasks').select('*').eq('id', id).single()
      if (error) throw error
      return handleCORS(NextResponse.json(data))
    }

    if (route.startsWith('/tasks/') && method === 'PUT') {
      const id = path[1]
      const body = await request.json()
      const { data, error } = await supabase
        .from('tasks')
        .update({ ...body, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
      if (error) throw error
      return handleCORS(NextResponse.json(data[0]))
    }

    if (route.startsWith('/tasks/') && method === 'DELETE') {
      const id = path[1]
      const { error } = await supabase.from('tasks').delete().eq('id', id)
      if (error) throw error
      return handleCORS(NextResponse.json({ success: true }))
    }

    // ==================== CONTACTS ====================
    if (route === '/contacts' && method === 'GET') {
      const { data, error } = await supabase.from('contacts').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return handleCORS(NextResponse.json(data || []))
    }

    if (route === '/contacts' && method === 'POST') {
      const body = await request.json()
      const newContact = {
        id: uuidv4(),
        ...body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      const { data, error } = await supabase.from('contacts').insert([newContact]).select()
      if (error) throw error
      return handleCORS(NextResponse.json(data[0], { status: 201 }))
    }

    if (route.startsWith('/contacts/') && method === 'PUT') {
      const id = path[1]
      const body = await request.json()
      const { data, error } = await supabase
        .from('contacts')
        .update({ ...body, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
      if (error) throw error
      return handleCORS(NextResponse.json(data[0]))
    }

    if (route.startsWith('/contacts/') && method === 'DELETE') {
      const id = path[1]
      const { error } = await supabase.from('contacts').delete().eq('id', id)
      if (error) throw error
      return handleCORS(NextResponse.json({ success: true }))
    }

    // ==================== DOCUMENTS ====================
    if (route === '/documents' && method === 'GET') {
      const { data, error } = await supabase.from('documents').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return handleCORS(NextResponse.json(data || []))
    }

    if (route === '/documents' && method === 'POST') {
      const body = await request.json()
      const newDocument = {
        id: uuidv4(),
        ...body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      const { data, error } = await supabase.from('documents').insert([newDocument]).select()
      if (error) throw error
      return handleCORS(NextResponse.json(data[0], { status: 201 }))
    }

    if (route.startsWith('/documents/') && method === 'GET') {
      const id = path[1]
      const { data, error } = await supabase.from('documents').select('*').eq('id', id).single()
      if (error) throw error
      return handleCORS(NextResponse.json(data))
    }

    if (route.startsWith('/documents/') && method === 'PUT') {
      const id = path[1]
      const body = await request.json()
      const { data, error } = await supabase
        .from('documents')
        .update({ ...body, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
      if (error) throw error
      return handleCORS(NextResponse.json(data[0]))
    }

    if (route.startsWith('/documents/') && method === 'DELETE') {
      const id = path[1]
      const { error } = await supabase.from('documents').delete().eq('id', id)
      if (error) throw error
      return handleCORS(NextResponse.json({ success: true }))
    }

    // ==================== APPOINTMENTS ====================
    if (route === '/appointments' && method === 'GET') {
      const { data, error } = await supabase.from('appointments').select('*').order('date', { ascending: false })
      if (error) throw error
      return handleCORS(NextResponse.json(data || []))
    }

    if (route === '/appointments' && method === 'POST') {
      const body = await request.json()
      const newAppointment = {
        id: uuidv4(),
        ...body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      const { data, error } = await supabase.from('appointments').insert([newAppointment]).select()
      if (error) throw error
      return handleCORS(NextResponse.json(data[0], { status: 201 }))
    }

    if (route.startsWith('/appointments/') && method === 'PUT') {
      const id = path[1]
      const body = await request.json()
      const { data, error } = await supabase
        .from('appointments')
        .update({ ...body, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
      if (error) throw error
      return handleCORS(NextResponse.json(data[0]))
    }

    if (route.startsWith('/appointments/') && method === 'DELETE') {
      const id = path[1]
      const { error } = await supabase.from('appointments').delete().eq('id', id)
      if (error) throw error
      return handleCORS(NextResponse.json({ success: true }))
    }

    // ==================== CONTRACTS ====================
    if (route === '/contracts' && method === 'GET') {
      const { data, error } = await supabase.from('contracts').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return handleCORS(NextResponse.json(data || []))
    }

    if (route === '/contracts' && method === 'POST') {
      const body = await request.json()
      const newContract = {
        id: uuidv4(),
        ...body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      const { data, error } = await supabase.from('contracts').insert([newContract]).select()
      if (error) throw error
      return handleCORS(NextResponse.json(data[0], { status: 201 }))
    }

    if (route.startsWith('/contracts/') && method === 'PUT') {
      const id = path[1]
      const body = await request.json()
      const { data, error } = await supabase
        .from('contracts')
        .update({ ...body, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
      if (error) throw error
      return handleCORS(NextResponse.json(data[0]))
    }

    if (route.startsWith('/contracts/') && method === 'DELETE') {
      const id = path[1]
      const { error } = await supabase.from('contracts').delete().eq('id', id)
      if (error) throw error
      return handleCORS(NextResponse.json({ success: true }))
    }

    // ==================== PAYMENTS ====================
    if (route === '/payments' && method === 'GET') {
      const { data, error } = await supabase.from('payments').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return handleCORS(NextResponse.json(data || []))
    }

    if (route === '/payments' && method === 'POST') {
      const body = await request.json()
      const newPayment = {
        id: uuidv4(),
        ...body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      const { data, error } = await supabase.from('payments').insert([newPayment]).select()
      if (error) throw error
      return handleCORS(NextResponse.json(data[0], { status: 201 }))
    }

    if (route.startsWith('/payments/') && method === 'PUT') {
      const id = path[1]
      const body = await request.json()
      const { data, error } = await supabase
        .from('payments')
        .update({ ...body, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
      if (error) throw error
      return handleCORS(NextResponse.json(data[0]))
    }

    if (route.startsWith('/payments/') && method === 'DELETE') {
      const id = path[1]
      const { error } = await supabase.from('payments').delete().eq('id', id)
      if (error) throw error
      return handleCORS(NextResponse.json({ success: true }))
    }

    // ==================== EXPENSES ====================
    if (route === '/expenses' && method === 'GET') {
      const { data, error } = await supabase.from('expenses').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return handleCORS(NextResponse.json(data || []))
    }

    if (route === '/expenses' && method === 'POST') {
      const body = await request.json()
      const newExpense = {
        id: uuidv4(),
        ...body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      const { data, error } = await supabase.from('expenses').insert([newExpense]).select()
      if (error) throw error
      return handleCORS(NextResponse.json(data[0], { status: 201 }))
    }

    if (route.startsWith('/expenses/') && method === 'PUT') {
      const id = path[1]
      const body = await request.json()
      const { data, error } = await supabase
        .from('expenses')
        .update({ ...body, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
      if (error) throw error
      return handleCORS(NextResponse.json(data[0]))
    }

    if (route.startsWith('/expenses/') && method === 'DELETE') {
      const id = path[1]
      const { error } = await supabase.from('expenses').delete().eq('id', id)
      if (error) throw error
      return handleCORS(NextResponse.json({ success: true }))
    }

    // ==================== PUBLICATIONS ====================
    if (route === '/publications' && method === 'GET') {
      const { data, error } = await supabase.from('publications').select('*').order('publication_date', { ascending: false })
      if (error) throw error
      return handleCORS(NextResponse.json(data || []))
    }

    if (route === '/publications' && method === 'POST') {
      const body = await request.json()
      const newPublication = {
        id: uuidv4(),
        ...body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      const { data, error } = await supabase.from('publications').insert([newPublication]).select()
      if (error) throw error
      return handleCORS(NextResponse.json(data[0], { status: 201 }))
    }

    // ==================== STATS ====================
    if (route === '/stats' && method === 'GET') {
      const [
        { count: processesCount },
        { count: clientsCount },
        { count: contractsCount },
        { data: payments }
      ] = await Promise.all([
        supabase.from('processes').select('*', { count: 'exact', head: true }),
        supabase.from('clients').select('*', { count: 'exact', head: true }),
        supabase.from('contracts').select('*', { count: 'exact', head: true }),
        supabase.from('payments').select('amount, status')
      ])

      const totalReceived = (payments || [])
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)

      return handleCORS(NextResponse.json({
        totalProcesses: processesCount || 0,
        totalClients: clientsCount || 0,
        totalContracts: contractsCount || 0,
        totalReceived
      }))
    }

    // ==================== 404 ====================
    return handleCORS(NextResponse.json({ error: 'Route not found', route }, { status: 404 }))

  } catch (error) {
    console.error('API Error:', error)
    return handleCORS(NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 }))
  }
}

export async function GET(request, context) {
  return handleRoute(request, context)
}

export async function POST(request, context) {
  return handleRoute(request, context)
}

export async function PUT(request, context) {
  return handleRoute(request, context)
}

export async function DELETE(request, context) {
  return handleRoute(request, context)
}
