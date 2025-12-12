import './globals.css'
import { Toaster } from '@/components/ui/sonner'

export const metadata = {
  title: 'Guedes & Silva - Gestão Advocatícia',
  description: 'Sistema de gestão para escritório de advocacia',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-background antialiased">
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
