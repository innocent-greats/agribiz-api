
import {
  ConnectedSocket,
  MessageBody, OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { InjectRepository } from '@nestjs/typeorm';
import { SocketAuthDTO } from 'src/users/dto/create-user.input';

import { SocketService } from './service';
const connectUsers = []

@WebSocketGateway({ transports: ['websocket'] })
export class SocketsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly socketService: SocketService,
  ) {
  }
  async handleConnection(socket: Socket) {
    const user = await this.socketService.getUserFromSocket;
    if (user) {
      await this.socketService.socketRegisterUser(user, socket, 'online')
    }
  }

  @SubscribeMessage('notify-online-status')
  async notifyOnlineStatus(
    @MessageBody() socketAuthDTO: SocketAuthDTO,
    @ConnectedSocket() socket: Socket,
  ) {
    let sender: any;
    const authenticatedClient = await this.socketService.getUserFromAuthToken(
      socketAuthDTO.clientAuth,
    );
    if (authenticatedClient) {
      sender = await this.socketService.socketRegisterUser(authenticatedClient, socket, socketAuthDTO.status);

      const data = {
        socketID: sender.socketID,
        data: sender,
      };
      this.server.sockets
        .to(sender.socketID)
        .emit('update-online-status', JSON.stringify(data));
    }

  }
}