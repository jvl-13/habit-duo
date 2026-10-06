// 

import { QueryProvider } from '@/components/providers/query-provider';
import './globals.css';
import { AuthProvider } from '@/lib/auth/auth-context';

export default function RootLayout({
  children,
} : Readonly<{
  children: React.ReactNode;
} > ) {
  return (
    <html lang='en'>
      <body>
        <QueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}