import { NextResponse } from 'next/server'
import { getTokensFromCode } from '@/lib/googleCalendar'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    // Redireciona para a página com erro
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    return NextResponse.redirect(`${baseUrl}?google_error=${error}`)
  }

  if (!code) {
    return NextResponse.json(
      { error: 'Authorization code not provided' },
      { status: 400 }
    )
  }

  try {
    const tokens = await getTokensFromCode(code)
    
    // Codifica os tokens para passar via URL (em produção, salvar em banco de dados)
    const encodedTokens = encodeURIComponent(JSON.stringify(tokens))
    
    // Redireciona para a página principal com os tokens
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    return NextResponse.redirect(`${baseUrl}?google_tokens=${encodedTokens}&google_success=true`)
  } catch (error) {
    console.error('Error getting tokens:', error)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    return NextResponse.redirect(`${baseUrl}?google_error=token_error`)
  }
}
