import { NextResponse } from 'next/server'
import { createCalendarEvent, listCalendarEvents, deleteCalendarEvent, updateCalendarEvent } from '@/lib/googleCalendar'

// Helper para CORS
function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}

export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

// Listar eventos
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const tokensParam = searchParams.get('tokens')
    const timeMin = searchParams.get('timeMin')
    const timeMax = searchParams.get('timeMax')

    if (!tokensParam) {
      return handleCORS(NextResponse.json(
        { error: 'Tokens not provided' },
        { status: 401 }
      ))
    }

    const tokens = JSON.parse(decodeURIComponent(tokensParam))
    const events = await listCalendarEvents(tokens, timeMin, timeMax)

    return handleCORS(NextResponse.json({ events }))
  } catch (error) {
    console.error('Error listing events:', error)
    return handleCORS(NextResponse.json(
      { error: 'Failed to list events', details: error.message },
      { status: 500 }
    ))
  }
}

// Criar evento
export async function POST(request) {
  try {
    const body = await request.json()
    const { tokens, eventData } = body

    if (!tokens) {
      return handleCORS(NextResponse.json(
        { error: 'Tokens not provided' },
        { status: 401 }
      ))
    }

    const event = await createCalendarEvent(tokens, eventData)

    return handleCORS(NextResponse.json({ event }))
  } catch (error) {
    console.error('Error creating event:', error)
    return handleCORS(NextResponse.json(
      { error: 'Failed to create event', details: error.message },
      { status: 500 }
    ))
  }
}

// Atualizar evento
export async function PUT(request) {
  try {
    const body = await request.json()
    const { tokens, eventId, eventData } = body

    if (!tokens) {
      return handleCORS(NextResponse.json(
        { error: 'Tokens not provided' },
        { status: 401 }
      ))
    }

    const event = await updateCalendarEvent(tokens, eventId, eventData)

    return handleCORS(NextResponse.json({ event }))
  } catch (error) {
    console.error('Error updating event:', error)
    return handleCORS(NextResponse.json(
      { error: 'Failed to update event', details: error.message },
      { status: 500 }
    ))
  }
}

// Deletar evento
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const tokensParam = searchParams.get('tokens')
    const eventId = searchParams.get('eventId')

    if (!tokensParam) {
      return handleCORS(NextResponse.json(
        { error: 'Tokens not provided' },
        { status: 401 }
      ))
    }

    const tokens = JSON.parse(decodeURIComponent(tokensParam))
    await deleteCalendarEvent(tokens, eventId)

    return handleCORS(NextResponse.json({ success: true }))
  } catch (error) {
    console.error('Error deleting event:', error)
    return handleCORS(NextResponse.json(
      { error: 'Failed to delete event', details: error.message },
      { status: 500 }
    ))
  }
}
