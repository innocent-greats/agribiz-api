import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConnectedUser } from '../users/entities/user.entity';
import Message from '../users/entities/message.entity';
import { MessageDTO } from '../users/dto/create-user.input';
import { UsersService } from '../users/users.service';

@Injectable()
export class SocketService {
  constructor(
    @InjectRepository(ConnectedUser)
    private readonly connectedUserRepository: Repository<ConnectedUser>,
    private readonly usersService: UsersService,

    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
  ) {
  }
  async socketRegisterUser(user, socket: Socket, status: string) {
    try {
      // console.log('socketRegisterUser. socket.user', user);
      const userConnected = await this.connectedUserRepository.findOne({ where: { userID: user.userID } })
      if (userConnected) {
        // console.log('socketRegisterUser. userExist', userConnected);
        // console.log('socketRegisterUser. socket.id', socket.id);
       

        if (status == 'offline') {
          // console.log('user connection status', status);
          userConnected.currentConnectionStatus = 'offline'
          userConnected.isOnline = false
          userConnected.socketID = null
          await this.connectedUserRepository.update(userConnected.connectionID, userConnected);
          const data = await this.connectedUserRepository.findOne({ where: { connectionID: userConnected.connectionID } })
          // console.log('updated socketRegisterUser. connection', data);
          return data;
        } else {
          // console.log('user connection status', status);
          if(userConnected.socketID != socket.id){
            // console.log(`updating socketRegisterUser. from ${userConnected.socketID} to ${ socket.id}`);
            userConnected.currentConnectionStatus = 'online'
            userConnected.isOnline = true
            userConnected.socketID = socket.id
            await this.connectedUserRepository.update(userConnected.connectionID, userConnected);
            const data = await this.connectedUserRepository.findOne({ where: { userID: user.userID } })
            // console.log('updated socketRegisterUser. connection', data);
            return data;
          }
          return userConnected;

        }
      } else {
        // console.log('socketRegisterUser. user does not exist');
        const connection = {
          socketID: socket.id,
          userID: user.userID,
          currentConnectionStatus: 'online',
          isOnline: true
        }
        // console.log('socketRegisterUser. user does not Exist connection',connection);
        const newConnection = this.connectedUserRepository.create(connection);
                              await this.connectedUserRepository.save(newConnection);
        const savedConnection = await this.connectedUserRepository.findOne({ where: { userID: user.userID } })
        // console.log('socketRegisterUser. savedConnection socket.id', savedConnection);
        return savedConnection;
      }
    } catch (error) {

    }
  }

  async findConnectedUser(userID: string
  ) {
    const data = await this.connectedUserRepository.findOne({ where: { userID: userID, currentConnectionStatus: 'online' }, })
        if (data) {
      return data;
    }
    return null;
  }
  async handleAuthentication(
    clientAuth: string,
    socket: Socket,
    status: string,
  ) {
    const user = await this.getUserFromAuthToken(clientAuth);
    if (user) {
      const client = await this.socketRegisterUser(user, socket, status);
      return client;
    }
    return null;
  }

  async getUserFromSocket(socket: Socket) {
    let newUser;
    let token = socket.handshake.headers.cookie != null ? socket.handshake.headers.cookie : socket.handshake.query['token']
    if (token) {
      newUser = await this.usersService.decodeUserToken(token.toString());
    }
    return newUser;
  }

  async getUserFromAuthToken(authToken: string) {
    let newUser;
    if (authToken) {
     const authUser = await this.usersService.decodeUserToken(authToken.toString());
     if(authUser){
      newUser = await this.usersService.getUserByID(authUser.userID)
      return newUser;
     }else{return}
    }
  }



  

  async saveMessage(messageDTO: MessageDTO) {
    const newMessage = await this.messagesRepository.create(messageDTO);
    await this.messagesRepository.save(newMessage);
    return newMessage;
  }

  

  async getAllMessages() {
    return this.messagesRepository.find({
      relations: ['author']
    });
  }
}