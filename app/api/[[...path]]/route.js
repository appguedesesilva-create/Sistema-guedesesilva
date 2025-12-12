import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'

// MongoDB connection
let client
let db

async function connectToMongo() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URL)
    await client.connect()
    db = client.db(process.env.DB_NAME || 'guedes_silva_law')
  }
  return db
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

// Route handler function
async function handleRoute(request, { params }) {
  const { path = [] } = await params
  const route = `/${path.join('/')}`
  const method = request.method

  try {
    const db = await connectToMongo()

    // Root endpoint
    if ((route === '/' || route === '/root') && method === 'GET') {
      return handleCORS(NextResponse.json({ message: "Guedes & Silva API" }))
    }

    // ==================== LAWYERS ====================
    if (route === '/lawyers' && method === 'GET') {
      const lawyers = await db.collection('lawyers').find({}).toArray()
      const cleaned = lawyers.map(({ _id, ...rest }) => rest)
      return handleCORS(NextResponse.json(cleaned))
    }

    if (route === '/lawyers' && method === 'POST') {
      const body = await request.json()
      const lawyer = {
        id: body.id || uuidv4(),
        email: body.email,
        name: body.name,
        oab: body.oab,
        phone: body.phone,
        created_at: new Date()
      }
      await db.collection('lawyers').insertOne(lawyer)
      return handleCORS(NextResponse.json(lawyer))
    }

    // ==================== CLIENTS ====================
    if (route === '/clients' && method === 'GET') {
      const clients = await db.collection('clients').find({}).sort({ created_at: -1 }).toArray()
      const cleaned = clients.map(({ _id, ...rest }) => rest)
      return handleCORS(NextResponse.json(cleaned))
    }

    if (route === '/clients' && method === 'POST') {
      const body = await request.json()
      const client = {
        id: uuidv4(),
        ...body,
        created_at: new Date(),
        updated_at: new Date()
      }
      await db.collection('clients').insertOne(client)
      return handleCORS(NextResponse.json(client))
    }

    if (route.match(/^\/clients\/[\w-]+$/) && method === 'GET') {
      const id = path[1]
      const client = await db.collection('clients').findOne({ id })
      if (!client) {
        return handleCORS(NextResponse.json({ error: 'Client not found' }, { status: 404 }))
      }
      const { _id, ...cleaned } = client
      return handleCORS(NextResponse.json(cleaned))
    }

    if (route.match(/^\/clients\/[\w-]+$/) && method === 'PUT') {
      const id = path[1]
      const body = await request.json()
      const { id: _, _id: __, ...updateData } = body
      await db.collection('clients').updateOne(
        { id },
        { $set: { ...updateData, updated_at: new Date() } }
      )
      const updated = await db.collection('clients').findOne({ id })
      const { _id: ___, ...cleaned } = updated
      return handleCORS(NextResponse.json(cleaned))
    }

    if (route.match(/^\/clients\/[\w-]+$/) && method === 'DELETE') {
      const id = path[1]
      await db.collection('clients').deleteOne({ id })
      return handleCORS(NextResponse.json({ success: true }))
    }

    // ==================== PROCESSES ====================
    if (route === '/processes' && method === 'GET') {
      const processes = await db.collection('processes').find({}).sort({ created_at: -1 }).toArray()
      // Join with clients
      const clients = await db.collection('clients').find({}).toArray()
      const clientMap = clients.reduce((acc, c) => { acc[c.id] = c.name; return acc }, {})
      const cleaned = processes.map(({ _id, ...rest }) => ({
        ...rest,
        client_name: clientMap[rest.client_id] || null
      }))
      return handleCORS(NextResponse.json(cleaned))
    }

    if (route === '/processes' && method === 'POST') {
      const body = await request.json()
      const process = {
        id: uuidv4(),
        ...body,
        created_at: new Date(),
        updated_at: new Date()
      }
      await db.collection('processes').insertOne(process)
      return handleCORS(NextResponse.json(process))
    }

    if (route.match(/^\/processes\/[\w-]+$/) && method === 'PUT') {
      const id = path[1]
      const body = await request.json()
      const { id: _, _id: __, ...updateData } = body
      await db.collection('processes').updateOne(
        { id },
        { $set: { ...updateData, updated_at: new Date() } }
      )
      const updated = await db.collection('processes').findOne({ id })
      const { _id: ___, ...cleaned } = updated
      return handleCORS(NextResponse.json(cleaned))
    }

    if (route.match(/^\/processes\/[\w-]+$/) && method === 'DELETE') {
      const id = path[1]
      await db.collection('processes').deleteOne({ id })
      return handleCORS(NextResponse.json({ success: true }))
    }

    // ==================== SERVICES ====================
    if (route === '/services' && method === 'GET') {
      const services = await db.collection('services').find({}).sort({ created_at: -1 }).toArray()
      const clients = await db.collection('clients').find({}).toArray()
      const clientMap = clients.reduce((acc, c) => { acc[c.id] = c.name; return acc }, {})
      const cleaned = services.map(({ _id, ...rest }) => ({
        ...rest,
        client_name: clientMap[rest.client_id] || null
      }))
      return handleCORS(NextResponse.json(cleaned))
    }

    if (route === '/services' && method === 'POST') {
      const body = await request.json()
      const service = {
        id: uuidv4(),
        ...body,
        created_at: new Date(),
        updated_at: new Date()
      }
      await db.collection('services').insertOne(service)
      return handleCORS(NextResponse.json(service))
    }

    if (route.match(/^\/services\/[\w-]+$/) && method === 'PUT') {
      const id = path[1]
      const body = await request.json()
      const { id: _, _id: __, ...updateData } = body
      await db.collection('services').updateOne(
        { id },
        { $set: { ...updateData, updated_at: new Date() } }
      )
      const updated = await db.collection('services').findOne({ id })
      const { _id: ___, ...cleaned } = updated
      return handleCORS(NextResponse.json(cleaned))
    }

    if (route.match(/^\/services\/[\w-]+$/) && method === 'DELETE') {
      const id = path[1]
      await db.collection('services').deleteOne({ id })
      return handleCORS(NextResponse.json({ success: true }))
    }

    // ==================== TASKS ====================
    if (route === '/tasks' && method === 'GET') {
      const tasks = await db.collection('tasks').find({}).sort({ created_at: -1 }).toArray()
      const clients = await db.collection('clients').find({}).toArray()
      const clientMap = clients.reduce((acc, c) => { acc[c.id] = c.name; return acc }, {})
      const cleaned = tasks.map(({ _id, ...rest }) => ({
        ...rest,
        client_name: clientMap[rest.client_id] || null
      }))
      return handleCORS(NextResponse.json(cleaned))
    }

    if (route === '/tasks' && method === 'POST') {
      const body = await request.json()
      const task = {
        id: uuidv4(),
        ...body,
        completed: false,
        created_at: new Date(),
        updated_at: new Date()
      }
      await db.collection('tasks').insertOne(task)
      return handleCORS(NextResponse.json(task))
    }

    if (route.match(/^\/tasks\/[\w-]+$/) && method === 'PUT') {
      const id = path[1]
      const body = await request.json()
      const { id: _, _id: __, ...updateData } = body
      await db.collection('tasks').updateOne(
        { id },
        { $set: { ...updateData, updated_at: new Date() } }
      )
      const updated = await db.collection('tasks').findOne({ id })
      const { _id: ___, ...cleaned } = updated
      return handleCORS(NextResponse.json(cleaned))
    }

    if (route.match(/^\/tasks\/[\w-]+$/) && method === 'DELETE') {
      const id = path[1]
      await db.collection('tasks').deleteOne({ id })
      return handleCORS(NextResponse.json({ success: true }))
    }

    // ==================== CONTACTS ====================
    if (route === '/contacts' && method === 'GET') {
      const contacts = await db.collection('contacts').find({}).sort({ created_at: -1 }).toArray()
      const cleaned = contacts.map(({ _id, ...rest }) => rest)
      return handleCORS(NextResponse.json(cleaned))
    }

    if (route === '/contacts' && method === 'POST') {
      const body = await request.json()
      const contact = {
        id: uuidv4(),
        ...body,
        created_at: new Date(),
        updated_at: new Date()
      }
      await db.collection('contacts').insertOne(contact)
      return handleCORS(NextResponse.json(contact))
    }

    if (route.match(/^\/contacts\/[\w-]+$/) && method === 'PUT') {
      const id = path[1]
      const body = await request.json()
      const { id: _, _id: __, ...updateData } = body
      await db.collection('contacts').updateOne(
        { id },
        { $set: { ...updateData, updated_at: new Date() } }
      )
      const updated = await db.collection('contacts').findOne({ id })
      const { _id: ___, ...cleaned } = updated
      return handleCORS(NextResponse.json(cleaned))
    }

    if (route.match(/^\/contacts\/[\w-]+$/) && method === 'DELETE') {
      const id = path[1]
      await db.collection('contacts').deleteOne({ id })
      return handleCORS(NextResponse.json({ success: true }))
    }

    // ==================== CONTRACTS ====================
    if (route === '/contracts' && method === 'GET') {
      const contracts = await db.collection('contracts').find({}).sort({ created_at: -1 }).toArray()
      const clients = await db.collection('clients').find({}).toArray()
      const clientMap = clients.reduce((acc, c) => { acc[c.id] = c.name; return acc }, {})
      const cleaned = contracts.map(({ _id, ...rest }) => ({
        ...rest,
        client_name: clientMap[rest.client_id] || null
      }))
      return handleCORS(NextResponse.json(cleaned))
    }

    if (route === '/contracts' && method === 'POST') {
      const body = await request.json()
      const contract = {
        id: uuidv4(),
        ...body,
        created_at: new Date(),
        updated_at: new Date()
      }
      await db.collection('contracts').insertOne(contract)
      return handleCORS(NextResponse.json(contract))
    }

    if (route.match(/^\/contracts\/[\w-]+$/) && method === 'PUT') {
      const id = path[1]
      const body = await request.json()
      const { id: _, _id: __, ...updateData } = body
      await db.collection('contracts').updateOne(
        { id },
        { $set: { ...updateData, updated_at: new Date() } }
      )
      const updated = await db.collection('contracts').findOne({ id })
      const { _id: ___, ...cleaned } = updated
      return handleCORS(NextResponse.json(cleaned))
    }

    if (route.match(/^\/contracts\/[\w-]+$/) && method === 'DELETE') {
      const id = path[1]
      await db.collection('contracts').deleteOne({ id })
      return handleCORS(NextResponse.json({ success: true }))
    }

    // ==================== PAYMENTS ====================
    if (route === '/payments' && method === 'GET') {
      const payments = await db.collection('payments').find({}).sort({ created_at: -1 }).toArray()
      const cleaned = payments.map(({ _id, ...rest }) => rest)
      return handleCORS(NextResponse.json(cleaned))
    }

    if (route === '/payments' && method === 'POST') {
      const body = await request.json()
      const payment = {
        id: uuidv4(),
        ...body,
        created_at: new Date()
      }
      await db.collection('payments').insertOne(payment)
      return handleCORS(NextResponse.json(payment))
    }

    if (route.match(/^\/payments\/[\w-]+$/) && method === 'PUT') {
      const id = path[1]
      const body = await request.json()
      const { id: _, _id: __, ...updateData } = body
      await db.collection('payments').updateOne(
        { id },
        { $set: { ...updateData } }
      )
      const updated = await db.collection('payments').findOne({ id })
      const { _id: ___, ...cleaned } = updated
      return handleCORS(NextResponse.json(cleaned))
    }

    if (route.match(/^\/payments\/[\w-]+$/) && method === 'DELETE') {
      const id = path[1]
      await db.collection('payments').deleteOne({ id })
      return handleCORS(NextResponse.json({ success: true }))
    }

    // ==================== EXPENSES ====================
    if (route === '/expenses' && method === 'GET') {
      const expenses = await db.collection('expenses').find({}).sort({ created_at: -1 }).toArray()
      const cleaned = expenses.map(({ _id, ...rest }) => rest)
      return handleCORS(NextResponse.json(cleaned))
    }

    if (route === '/expenses' && method === 'POST') {
      const body = await request.json()
      const expense = {
        id: uuidv4(),
        ...body,
        created_at: new Date()
      }
      await db.collection('expenses').insertOne(expense)
      return handleCORS(NextResponse.json(expense))
    }

    if (route.match(/^\/expenses\/[\w-]+$/) && method === 'PUT') {
      const id = path[1]
      const body = await request.json()
      const { id: _, _id: __, ...updateData } = body
      await db.collection('expenses').updateOne(
        { id },
        { $set: { ...updateData } }
      )
      const updated = await db.collection('expenses').findOne({ id })
      const { _id: ___, ...cleaned } = updated
      return handleCORS(NextResponse.json(cleaned))
    }

    if (route.match(/^\/expenses\/[\w-]+$/) && method === 'DELETE') {
      const id = path[1]
      await db.collection('expenses').deleteOne({ id })
      return handleCORS(NextResponse.json({ success: true }))
    }

    // ==================== DOCUMENTS ====================
    if (route === '/documents' && method === 'GET') {
      const documents = await db.collection('documents').find({}).sort({ created_at: -1 }).toArray()
      const cleaned = documents.map(({ _id, ...rest }) => rest)
      return handleCORS(NextResponse.json(cleaned))
    }

    if (route === '/documents' && method === 'POST') {
      const body = await request.json()
      const document = {
        id: uuidv4(),
        ...body,
        created_at: new Date(),
        updated_at: new Date()
      }
      await db.collection('documents').insertOne(document)
      return handleCORS(NextResponse.json(document))
    }

    if (route.match(/^\/documents\/[\w-]+$/) && method === 'PUT') {
      const id = path[1]
      const body = await request.json()
      const { id: _, _id: __, ...updateData } = body
      await db.collection('documents').updateOne(
        { id },
        { $set: { ...updateData, updated_at: new Date() } }
      )
      const updated = await db.collection('documents').findOne({ id })
      const { _id: ___, ...cleaned } = updated
      return handleCORS(NextResponse.json(cleaned))
    }

    if (route.match(/^\/documents\/[\w-]+$/) && method === 'DELETE') {
      const id = path[1]
      await db.collection('documents').deleteOne({ id })
      return handleCORS(NextResponse.json({ success: true }))
    }

    // ==================== APPOINTMENTS ====================
    if (route === '/appointments' && method === 'GET') {
      const appointments = await db.collection('appointments').find({}).sort({ created_at: -1 }).toArray()
      const clients = await db.collection('clients').find({}).toArray()
      const clientMap = clients.reduce((acc, c) => { acc[c.id] = c.name; return acc }, {})
      const cleaned = appointments.map(({ _id, ...rest }) => ({
        ...rest,
        client_name: clientMap[rest.client_id] || null
      }))
      return handleCORS(NextResponse.json(cleaned))
    }

    if (route === '/appointments' && method === 'POST') {
      const body = await request.json()
      const appointment = {
        id: uuidv4(),
        ...body,
        created_at: new Date(),
        updated_at: new Date()
      }
      await db.collection('appointments').insertOne(appointment)
      return handleCORS(NextResponse.json(appointment))
    }

    if (route.match(/^\/appointments\/[\w-]+$/) && method === 'PUT') {
      const id = path[1]
      const body = await request.json()
      const { id: _, _id: __, ...updateData } = body
      await db.collection('appointments').updateOne(
        { id },
        { $set: { ...updateData, updated_at: new Date() } }
      )
      const updated = await db.collection('appointments').findOne({ id })
      const { _id: ___, ...cleaned } = updated
      return handleCORS(NextResponse.json(cleaned))
    }

    if (route.match(/^\/appointments\/[\w-]+$/) && method === 'DELETE') {
      const id = path[1]
      await db.collection('appointments').deleteOne({ id })
      return handleCORS(NextResponse.json({ success: true }))
    }

    // ==================== STATS ====================
    if (route === '/stats' && method === 'GET') {
      const [processes, clients, contracts, payments] = await Promise.all([
        db.collection('processes').find({}).toArray(),
        db.collection('clients').find({}).toArray(),
        db.collection('contracts').find({}).toArray(),
        db.collection('payments').find({}).toArray()
      ])

      const stats = {
        totalProcesses: processes.length,
        judicialProcesses: processes.filter(p => p.type === 'judicial').length,
        administrativeProcesses: processes.filter(p => p.type === 'administrative').length,
        extraJudicialServices: processes.filter(p => p.type === 'extrajudicial').length,
        totalClients: clients.length,
        contractValues: contracts.reduce((sum, c) => sum + (c.total_value || 0), 0),
        receivedValues: payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.amount || 0), 0),
        pendingValues: payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + (p.amount || 0), 0)
      }

      return handleCORS(NextResponse.json(stats))
    }

    // ==================== PUBLICATIONS (Tribunais) ====================
    if (route === '/publications/search' && method === 'GET') {
      const url = new URL(request.url)
      const oab = url.searchParams.get('oab') || ''
      const name = url.searchParams.get('name') || ''

      // Simulated response from tribunal APIs
      // In production, this would call the actual PJe/e-SAJ APIs
      const mockPublications = []
      
      if (oab || name) {
        // Generate some mock publications for demonstration
        const courts = ['trt6', 'tjpe', 'jfpe']
        const subjects = [
          'Intimação para audiência',
          'Publicação de sentença',
          'Despacho de citação',
          'Movimentação processual',
          'Decisão interlocutória'
        ]

        for (let i = 0; i < 3; i++) {
          mockPublications.push({
            id: uuidv4(),
            court: courts[i % 3],
            process_number: `${String(Math.random()).slice(2, 9)}-${String(Math.random()).slice(2, 4)}.${2024}.8.${String(Math.random()).slice(2, 4)}.0001`,
            date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            content: `${subjects[i % 5]} - Referente à OAB ${oab || 'N/A'} / Advogado(a) ${name || 'N/A'}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
            link: `https://pje.${courts[i % 3]}.jus.br/consulta`
          })
        }
      }

      return handleCORS(NextResponse.json({ publications: mockPublications }))
    }

    // Route not found
    return handleCORS(NextResponse.json(
      { error: `Route ${route} not found` },
      { status: 404 }
    ))

  } catch (error) {
    console.error('API Error:', error)
    return handleCORS(NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    ))
  }
}

// Export all HTTP methods
export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute
