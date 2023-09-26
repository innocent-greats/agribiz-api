import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer, OnGatewayConnection } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketAuthDTO, SocketCallDTO } from 'src/users/dto/create-user.input';
import { SocketService } from 'src/sockets-gateway/service';
import { UsersService } from 'src/users/users.service';
import { CommodityManagersService } from './commodity-manager.service';

@WebSocketGateway({ transports: ['websocket'] })
export class CommodityManagerGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;
  constructor(private readonly commodityManagersService: CommodityManagersService, private readonly socketService: SocketService, private readonly usersService: UsersService) {}

  async handleConnection(socket: Socket) {
    const user = await this.socketService.getUserFromSocket(socket);
    if (user) {
      await this.socketService.socketRegisterUser(user, socket, 'online')
    }
  }

    @SubscribeMessage('get-account-portfolios')
    async getAccountPortfolios(
      @MessageBody() orderDTO: SocketCallDTO,
      @ConnectedSocket() socket: Socket,
    ) {
      // authorize transaction user through call auth token
      let authenticatedClient;
      if(orderDTO.clientAuth){
       
        authenticatedClient = await this.socketService.getUserFromAuthToken(
          orderDTO.clientAuth,
        );
      }

      if (authenticatedClient) {
        const accountCatalogs = await this.commodityManagersService.getPortfoliosByAccountID(authenticatedClient.userID);
  
        if (accountCatalogs) {
          // execute socket messaging, direct or broadcast call
          // check authenticatedClient is online, else establish a new socket connection
          const client = await this.socketService.socketRegisterUser(
            authenticatedClient,
            socket,
            'online',
          );
          if (client) {
            const userConnection = await this.socketService.findConnectedUser(client.userID)
            if (userConnection) {
              this.server.sockets
                .to(userConnection.socketID)
                .emit('receive-account-portfolios', JSON.stringify(accountCatalogs));
            }
          }
          // on service call execution success, return the new call acknoledgement
          return accountCatalogs;
        }
      }
    }  
  }

