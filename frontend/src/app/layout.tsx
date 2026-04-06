import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import ClientNav from '@/components/ClientNav'
import { ThemeProvider } from '@/components/ThemeProvider'

export const metadata: Metadata = {
  title: 'RAMS | Research Activity Management System',
  description: 'A centralized, scalable research intelligence platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <div className="container mx-auto px-4">
            <header className="flex justify-between items-center py-6 mb-10 border-b border-border">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">RAMS</h1>
                <p className="text-muted-foreground text-sm">Research Activity Management System</p>
              </div>
              <ClientNav />
            </header>
            <Toaster position="top-right" toastOptions={{ style: { background: 'hsl(var(--card))', color: 'hsl(var(--foreground))', border: '1px solid hsl(var(--border))' } }} />
            <main>{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
