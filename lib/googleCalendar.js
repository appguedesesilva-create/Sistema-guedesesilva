import { google } from 'googleapis'

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
)

// Scopes necessários para acessar o Google Calendar
const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events'
]

export function getAuthUrl() {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  })
}

export async function getTokensFromCode(code) {
  const { tokens } = await oauth2Client.getToken(code)
  return tokens
}

export function setCredentials(tokens) {
  oauth2Client.setCredentials(tokens)
  return oauth2Client
}

export async function createCalendarEvent(tokens, eventData) {
  const auth = setCredentials(tokens)
  const calendar = google.calendar({ version: 'v3', auth })

  const event = {
    summary: eventData.title,
    description: eventData.description,
    start: {
      dateTime: eventData.startDateTime,
      timeZone: 'America/Recife'
    },
    end: {
      dateTime: eventData.endDateTime,
      timeZone: 'America/Recife'
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 30 }
      ]
    }
  }

  const response = await calendar.events.insert({
    calendarId: 'primary',
    resource: event
  })

  return response.data
}

export async function listCalendarEvents(tokens, timeMin, timeMax) {
  const auth = setCredentials(tokens)
  const calendar = google.calendar({ version: 'v3', auth })

  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: timeMin || new Date().toISOString(),
    timeMax: timeMax,
    maxResults: 50,
    singleEvents: true,
    orderBy: 'startTime'
  })

  return response.data.items
}

export async function deleteCalendarEvent(tokens, eventId) {
  const auth = setCredentials(tokens)
  const calendar = google.calendar({ version: 'v3', auth })

  await calendar.events.delete({
    calendarId: 'primary',
    eventId: eventId
  })

  return { success: true }
}

export async function updateCalendarEvent(tokens, eventId, eventData) {
  const auth = setCredentials(tokens)
  const calendar = google.calendar({ version: 'v3', auth })

  const event = {
    summary: eventData.title,
    description: eventData.description,
    start: {
      dateTime: eventData.startDateTime,
      timeZone: 'America/Recife'
    },
    end: {
      dateTime: eventData.endDateTime,
      timeZone: 'America/Recife'
    }
  }

  const response = await calendar.events.update({
    calendarId: 'primary',
    eventId: eventId,
    resource: event
  })

  return response.data
}
