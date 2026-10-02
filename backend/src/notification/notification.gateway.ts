import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Server } from 'socket.io';


@WebSocketGateway({
    cors: {
        origin: '*',
    },
})

export class NotificationGateway
    implements
        OnGatewayConnection,
        OnGatewayDisconnect
{
    @WebSocketServer()
    server: Server;
    constructor(
        private readonly jwtService: JwtService,
    ) {}

    async handleConnection (socket: Socket){
        try {
            const token = socket.handshake.auth?.token;

            if (!token) {
                socket.disconnect();
                return;
            }

            const payload = await this.jwtService.verifyAsync(token);

            const userId = payload.sub;

            if (!userId) {
                socket.disconnect();
                return;
            }

            socket.data.userId = userId;

            await socket.join(
                `user: ${userId}`,
            );

            console.log(`Websocket connected: ${userId}`);

        } catch {
            socket.disconnect();
        }
    }

    handleDisconnect(socket: Socket) {
        console.log(`Websocket disconnected: ${socket.data.userId ?? 'unknown'}`);
    }

    emitNotification(userId: string, notification: unknown) {
        this.server.to(`user: ${userId}`).emit('notification: new', notification,);
    }

    
}
