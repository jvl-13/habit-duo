// 

import { QueryProvider } from '@/components/providers/query-provider';
import './globals.css';
import { AuthProvider } from '@/lib/auth/auth-context';
import { SocketProvider } from '@/lib/socket/socket-provider';

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
            <SocketProvider>
              {children}
            </SocketProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}