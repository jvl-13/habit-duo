'use client';

import {
    createContext,
    useContext,
    useEffect,
    useState,
} from 'react';
import { io, type Socket } from 'socket.io-client';

import {
    getAccessToken,
    subscribeToTokenChanges,
} from '@/lib/auth/token-storage';
import { useAuth } from '@/lib/auth/auth-context';

interface SocketContextValue {
    socket: Socket | null;
}

const SocketContext = createContext<SocketContextValue>({
    socket: null,
});

export function SocketProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, isLoading } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        if (isLoading || !isAuthenticated) {
            setSocket(null);
            return;
        }

        let activeSocket: Socket | null = null;
        let currentToken: string | null = null;

        const connectSocket = () => {
            const token = getAccessToken();

            if (!token) {
                activeSocket?.disconnect();
                activeSocket = null;
                currentToken = null;
                setSocket(null);
                return;
            }

            if (activeSocket && currentToken === token) {
                return;
            }

            activeSocket?.disconnect();

            const newSocket = io(
                process.env.NEXT_API_URL!,
                {
                    autoConnect: false,
                    auth: { token },
                },
            );

            // newSocket.on('connect', () => {
            //     console.log(
            //         '[SocketProvider] Connected:',
            //         newSocket.id,
            //     );
            // });

            // newSocket.on('disconnect', (reason) => {
            //     console.log(
            //         '[SocketProvider] Disconnected:',
            //         reason,
            //     );
            // });

            newSocket.on('connect_error', (error) => {
                console.error(
                    '[Socket.IO] Connection error:',
                    error.message,
                );
            });

            // console.trace(
            //     '[SocketProvider] Creating connection',
            // );

            activeSocket = newSocket;
            currentToken = token;

            setSocket(newSocket);
            newSocket.connect();
        };

        connectSocket();

        const unsubscribe = subscribeToTokenChanges(() => {
            connectSocket();
        });

        return () => {
            unsubscribe();
            activeSocket?.disconnect();
            activeSocket = null;
            currentToken = null;
        };
    }, [isAuthenticated, isLoading]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    return useContext(SocketContext);
}
