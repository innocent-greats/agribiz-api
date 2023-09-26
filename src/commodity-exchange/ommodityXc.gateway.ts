import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayConnection, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketService } from 'src/sockets-gateway/service';
import { SocketCallDTO } from 'src/users/dto/create-user.input';
import { CommodityXcService } from './ommodityXc.service';

@WebSocketGateway()
export class CommodityXcGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;
  constructor(private readonly beautyMarketplaceService: CommodityXcService, private readonly socketService: SocketService) {}

  async handleConnection(socket: Socket) {
    const user = await this.socketService.getUserFromSocket(socket);
    if (user) {
      await this.socketService.socketRegisterUser(user, socket, 'online')
    }
  }

  @SubscribeMessage('get-marketplace-beauty-services')
  async getMarketplaceBeautyServices(
    @MessageBody() orderDTO: SocketCallDTO,
    @ConnectedSocket() socket: Socket,
  ) {
    // authorize transaction user through call auth token
    const authenticatedClient = await this.socketService.getUserFromAuthToken(
      orderDTO.clientAuth,
    );
    if (authenticatedClient) {
      const beautyServices = await this.beautyMarketplaceService.getMarketplaceBeautyServices(authenticatedClient.userID);

      if (beautyServices) {
        // execute socket messaging, direct or broadcast call
        // check authenticatedClient is online, else establish a new socket connection
        const client = await this.socketService.socketRegisterUser(
          authenticatedClient,
          socket,
          'online',
        );
        if (client) {
          const userConnection =  await this.socketService.findConnectedUser(client.userID)
          if (userConnection) {
            this.server.sockets
              .to(userConnection.socketID)
              .emit('receive-marketplace-beauty-services', JSON.stringify(beautyServices));
          }
        }
        // on service call execution success, return the new call acknoledgement
        return beautyServices;
      }
    }
  }
  @SubscribeMessage('get-marketplace-beauty-service-providers')
  async getMarketplaceBeautyServiceProviders(
    @MessageBody() orderDTO: SocketCallDTO,
    @ConnectedSocket() socket: Socket,
  ) {
    // authorize transaction user through call auth token
    const authenticatedClient = await this.socketService.getUserFromAuthToken(
      orderDTO.clientAuth,
    );
    if (authenticatedClient) {
      const beautyServicesProviders = await this.beautyMarketplaceService.getMarketplaceBeautyServiceProviders(authenticatedClient.userID);

      if (beautyServicesProviders) {
        // execute socket messaging, direct or broadcast call
        // check authenticatedClient is online, else establish a new socket connection
        const client = await this.socketService.socketRegisterUser(
          authenticatedClient,
          socket,
          'online',
        );
        if (client) {
          const userConnection =  await this.socketService.findConnectedUser(client.userID)
          if (userConnection) {
            this.server.sockets
              .to(userConnection.socketID)
              .emit('receive-marketplace-beauty-service-providers', JSON.stringify(beautyServicesProviders));
          }
        }
        // on service call execution success, return the new call acknoledgement
        return beautyServicesProviders;
      }
    }
  }
}
