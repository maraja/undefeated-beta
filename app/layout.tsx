import './globals.css'
import { Inter } from 'next/font/google'
import AuthHeader from './components/AuthHeader'
import Footer from './components/Footer'
import { AuthProvider } from './contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Undefeated Basketball League',
  description: 'Weekly basketball sessions with randomized teams and point tracking',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} flex flex-col min-h-screen bg-background text-foreground`}>
        <AuthProvider>
          <AuthHeader />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}

