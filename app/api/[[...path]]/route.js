import { createClient } from '@supabase/supabase-js'
import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'

// ==================== SUPABASE (Principal) ====================
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl || '', supabaseServiceKey || '')

// ==================== MONGODB (Backup) ====================
let mongoClient
let mongoDb

async function connectToMongo() {
  if (!mongoClient && process.env.MONGO_URL) {
    try {
      mongoClient = new MongoClient(process.env.MONGO_URL)
      await mongoClient.connect()
      mongoDb = mongoClient.db(process.env.DB_NAME || 'guedes_silva_law')
      console.log('MongoDB backup connected')
    } catch (error) {
      console.error('MongoDB backup connection failed:', error.message)
      mongoDb = null
    }
  }
  return mongoDb
}

// Helper para salvar no MongoDB (backup silencioso)
async function backupToMongo(collection, operation, data, id = null) {
  try {
    const db = await connectToMongo()
    if (!db) return
    
    switch (operation) {
      case 'insert':
        await db.collection(collection).insertOne({ ...data, _backup_at: new Date() })
        break
      case 'update':
        if (id) await db.collection(collection).updateOne({ id }, { $set: { ...data, _backup_at: new Date() } }, { upsert: true })
        break
      case 'delete':
        if (id) await db.collection(collection).updateOne({ id }, { $set: { _deleted: true, _deleted_at: new Date() } })
        break
    }
  } catch (error) {
    console.error(`MongoDB backup error (${collection}/${operation}):`, error.message)
  }
}

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

// ==================== CRUD GENÉRICO ====================
async function getAll(table, orderBy = 'created_at', ascending = false) {
  try {
    const { data, error } = await supabase.from(table).select('*').order(orderBy, { ascending })
    if (error) throw error
    return data || []
  } catch (supabaseError) {
    // Fallback para MongoDB se Supabase falhar
    console.error(`Supabase read failed for ${table}, trying MongoDB:`, supabaseError.message)
    try {
      const db = await connectToMongo()
      if (db) {
        const data = await db.collection(table).find({ _deleted: { $ne: true } }).sort({ [orderBy]: ascending ? 1 : -1 }).toArray()
        return data.map(({ _id, _backup_at, _deleted, ...rest }) => rest)
      }
    } catch (mongoError) {
      console.error(`MongoDB fallback failed for ${table}:`, mongoError.message)
    }
    return []
  }
}

async function getOne(table, id) {
  try {
    const { data, error } = await supabase.from(table).select('*').eq('id', id).single()
    if (error) throw error
    return data
  } catch (supabaseError) {
    // Fallback para MongoDB
    try {
      const db = await connectToMongo()
      if (db) {
        const data = await db.collection(table).findOne({ id, _deleted: { $ne: true } })
        if (data) {
          const { _id, _backup_at, _deleted, ...rest } = data
          return rest
        }
      }
    } catch (mongoError) {
      console.error(`MongoDB fallback failed:`, mongoError.message)
    }
    return null
  }
}

async function createOne(table, data) {
  const newData = {
    id: uuidv4(),
    ...data,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  
  // Gravar no Supabase (principal)
  const { data: result, error } = await supabase.from(table).insert([newData]).select()
  if (error) throw error
  
  // Backup no MongoDB (silencioso)
  backupToMongo(table, 'insert', newData)
  
  return result[0]
}

async function updateOne(table, id, data) {
  const updateData = {
    ...data,
    updated_at: new Date().toISOString()
  }
  
  // Atualizar no Supabase (principal)
  const { data: result, error } = await supabase.from(table).update(updateData).eq('id', id).select()
  if (error) throw error
  
  // Backup no MongoDB (silencioso)
  backupToMongo(table, 'update', updateData, id)
  
  return result[0]
}

async function deleteOne(table, id) {
  // Deletar no Supabase (principal)
  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) throw error
  
  // Marcar como deletado no MongoDB (soft delete para backup)
  backupToMongo(table, 'delete', null, id)
  
  return { success: true }
}

// ==================== ROUTE HANDLER ====================
async function handleRoute(request, { params }) {
  const { path = [] } = await params
  const route = `/${path.join('/')}`
  const method = request.method

  try {
    // Root endpoint
    if ((route === '/' || route === '/root') && method === 'GET') {
      return handleCORS(NextResponse.json({ 
        message: "Guedes & Silva API",
        database: "Supabase (primary) + MongoDB (backup)"
      }))
    }

    // ==================== LAWYERS ====================
    if (route === '/lawyers' && method === 'GET') {
      const data = await getAll('lawyers')
      return handleCORS(NextResponse.json(data))
    }
    if (route === '/lawyers' && method === 'POST') {
      const body = await request.json()
      const data = await createOne('lawyers', body)
      return handleCORS(NextResponse.json(data, { status: 201 }))
    }

    // ==================== CLIENTS ====================
    if (route === '/clients' && method === 'GET') {
      const data = await getAll('clients')
      return handleCORS(NextResponse.json(data))
    }
    if (route === '/clients' && method === 'POST') {
      const body = await request.json()
      const data = await createOne('clients', body)
      return handleCORS(NextResponse.json(data, { status: 201 }))
    }
    if (route.startsWith('/clients/') && method === 'GET') {
      const data = await getOne('clients', path[1])
      return handleCORS(NextResponse.json(data))
    }
    if (route.startsWith('/clients/') && method === 'PUT') {
      const body = await request.json()
      const data = await updateOne('clients', path[1], body)
      return handleCORS(NextResponse.json(data))
    }
    if (route.startsWith('/clients/') && method === 'DELETE') {
      const data = await deleteOne('clients', path[1])
      return handleCORS(NextResponse.json(data))
    }

    // ==================== PROCESSES ====================
    if (route === '/processes' && method === 'GET') {
      const data = await getAll('processes')
      return handleCORS(NextResponse.json(data))
    }
    if (route === '/processes' && method === 'POST') {
      const body = await request.json()
      const data = await createOne('processes', body)
      return handleCORS(NextResponse.json(data, { status: 201 }))
    }
    if (route.startsWith('/processes/') && method === 'GET') {
      const data = await getOne('processes', path[1])
      return handleCORS(NextResponse.json(data))
    }
    if (route.startsWith('/processes/') && method === 'PUT') {
      const body = await request.json()
      const data = await updateOne('processes', path[1], body)
      return handleCORS(NextResponse.json(data))
    }
    if (route.startsWith('/processes/') && method === 'DELETE') {
      const data = await deleteOne('processes', path[1])
      return handleCORS(NextResponse.json(data))
    }

    // ==================== TASKS ====================
    if (route === '/tasks' && method === 'GET') {
      const data = await getAll('tasks')
      return handleCORS(NextResponse.json(data))
    }
    if (route === '/tasks' && method === 'POST') {
      const body = await request.json()
      const data = await createOne('tasks', body)
      return handleCORS(NextResponse.json(data, { status: 201 }))
    }
    if (route.startsWith('/tasks/') && method === 'GET') {
      const data = await getOne('tasks', path[1])
      return handleCORS(NextResponse.json(data))
    }
    if (route.startsWith('/tasks/') && method === 'PUT') {
      const body = await request.json()
      const data = await updateOne('tasks', path[1], body)
      return handleCORS(NextResponse.json(data))
    }
    if (route.startsWith('/tasks/') && method === 'DELETE') {
      const data = await deleteOne('tasks', path[1])
      return handleCORS(NextResponse.json(data))
    }

    // ==================== CONTACTS ====================
    if (route === '/contacts' && method === 'GET') {
      const data = await getAll('contacts')
      return handleCORS(NextResponse.json(data))
    }
    if (route === '/contacts' && method === 'POST') {
      const body = await request.json()
      const data = await createOne('contacts', body)
      return handleCORS(NextResponse.json(data, { status: 201 }))
    }
    if (route.startsWith('/contacts/') && method === 'PUT') {
      const body = await request.json()
      const data = await updateOne('contacts', path[1], body)
      return handleCORS(NextResponse.json(data))
    }
    if (route.startsWith('/contacts/') && method === 'DELETE') {
      const data = await deleteOne('contacts', path[1])
      return handleCORS(NextResponse.json(data))
    }

    // ==================== DOCUMENTS ====================
    if (route === '/documents' && method === 'GET') {
      const data = await getAll('documents')
      return handleCORS(NextResponse.json(data))
    }
    if (route === '/documents' && method === 'POST') {
      const body = await request.json()
      const data = await createOne('documents', body)
      return handleCORS(NextResponse.json(data, { status: 201 }))
    }
    if (route.startsWith('/documents/') && method === 'GET') {
      const data = await getOne('documents', path[1])
      return handleCORS(NextResponse.json(data))
    }
    if (route.startsWith('/documents/') && method === 'PUT') {
      const body = await request.json()
      const data = await updateOne('documents', path[1], body)
      return handleCORS(NextResponse.json(data))
    }
    if (route.startsWith('/documents/') && method === 'DELETE') {
      const data = await deleteOne('documents', path[1])
      return handleCORS(NextResponse.json(data))
    }

    // ==================== APPOINTMENTS ====================
    if (route === '/appointments' && method === 'GET') {
      const data = await getAll('appointments', 'date')
      return handleCORS(NextResponse.json(data))
    }
    if (route === '/appointments' && method === 'POST') {
      const body = await request.json()
      const data = await createOne('appointments', body)
      return handleCORS(NextResponse.json(data, { status: 201 }))
    }
    if (route.startsWith('/appointments/') && method === 'PUT') {
      const body = await request.json()
      const data = await updateOne('appointments', path[1], body)
      return handleCORS(NextResponse.json(data))
    }
    if (route.startsWith('/appointments/') && method === 'DELETE') {
      const data = await deleteOne('appointments', path[1])
      return handleCORS(NextResponse.json(data))
    }

    // ==================== CONTRACTS ====================
    if (route === '/contracts' && method === 'GET') {
      const data = await getAll('contracts')
      return handleCORS(NextResponse.json(data))
    }
    if (route === '/contracts' && method === 'POST') {
      const body = await request.json()
      const data = await createOne('contracts', body)
      return handleCORS(NextResponse.json(data, { status: 201 }))
    }
    if (route.startsWith('/contracts/') && method === 'PUT') {
      const body = await request.json()
      const data = await updateOne('contracts', path[1], body)
      return handleCORS(NextResponse.json(data))
    }
    if (route.startsWith('/contracts/') && method === 'DELETE') {
      const data = await deleteOne('contracts', path[1])
      return handleCORS(NextResponse.json(data))
    }

    // ==================== PAYMENTS ====================
    if (route === '/payments' && method === 'GET') {
      const data = await getAll('payments')
      return handleCORS(NextResponse.json(data))
    }
    if (route === '/payments' && method === 'POST') {
      const body = await request.json()
      const data = await createOne('payments', body)
      return handleCORS(NextResponse.json(data, { status: 201 }))
    }
    if (route.startsWith('/payments/') && method === 'PUT') {
      const body = await request.json()
      const data = await updateOne('payments', path[1], body)
      return handleCORS(NextResponse.json(data))
    }
    if (route.startsWith('/payments/') && method === 'DELETE') {
      const data = await deleteOne('payments', path[1])
      return handleCORS(NextResponse.json(data))
    }

    // ==================== EXPENSES ====================
    if (route === '/expenses' && method === 'GET') {
      const data = await getAll('expenses')
      return handleCORS(NextResponse.json(data))
    }
    if (route === '/expenses' && method === 'POST') {
      const body = await request.json()
      const data = await createOne('expenses', body)
      return handleCORS(NextResponse.json(data, { status: 201 }))
    }
    if (route.startsWith('/expenses/') && method === 'PUT') {
      const body = await request.json()
      const data = await updateOne('expenses', path[1], body)
      return handleCORS(NextResponse.json(data))
    }
    if (route.startsWith('/expenses/') && method === 'DELETE') {
      const data = await deleteOne('expenses', path[1])
      return handleCORS(NextResponse.json(data))
    }

    // ==================== PUBLICATIONS ====================
    if (route === '/publications' && method === 'GET') {
      const data = await getAll('publications', 'publication_date')
      return handleCORS(NextResponse.json(data))
    }
    if (route === '/publications' && method === 'POST') {
      const body = await request.json()
      const data = await createOne('publications', body)
      return handleCORS(NextResponse.json(data, { status: 201 }))
    }

    // ==================== STATS ====================
    if (route === '/stats' && method === 'GET') {
      try {
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
      } catch (error) {
        // Retornar zeros se houver erro
        return handleCORS(NextResponse.json({
          totalProcesses: 0,
          totalClients: 0,
          totalContracts: 0,
          totalReceived: 0
        }))
      }
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
