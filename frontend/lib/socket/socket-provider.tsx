
'use client';

import {
    createContext,
    useContext,
    useEffect,
    useState,
} from 'react';
import { io, type Socket } from 'socket.io-client';

import { getAccessToken } from '@/lib/auth/token-storage';

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
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        let activeSocket: Socket | null = null;

        const token = getAccessToken();

        if (!token) {
            setSocket(null);
            return;
        }

        activeSocket = io(
            process.env.NEXT_PUBLIC_API_URL!,
            {
                auth: {
                    token,
                },
            },
        );

        activeSocket.on('connect_error', (error) => {
            console.error(
                '[Socket.IO] Connection error:',
                error.message,
            );
        });

        setSocket(activeSocket);

        return () => {
            activeSocket?.disconnect();
            activeSocket = null;
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    return useContext(SocketContext);
}
