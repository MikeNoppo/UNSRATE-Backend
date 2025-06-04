import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { Logger, ValidationPipe, UseGuards } from '@nestjs/common';
import { IncomingMessageDto } from './dto/incoming-message.dto';
import { xorDecrypt } from '../utils/crypto.util';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { ConfigService } from '@nestjs/config';

// We can use a guard for WebSocket authentication if needed, 
// but for simplicity, we'll parse token from handshake here.

@WebSocketGateway({
  cors: {
    origin: new ConfigService().get<string>('CORS_ORIGIN') || '*',
  },
  namespace: 'chat',
})
@UseGuards(WsJwtGuard)
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server; // This 'server' is used for broadcasting, so it should remain.

  private logger: Logger = new Logger('ChatGateway');
  private readonly encryptionKey: string;

  constructor(
    private readonly chatService: ChatService,
    private readonly configService: ConfigService,
  ) {
    this.encryptionKey = this.configService.get<string>('MESSAGE_XOR_KEY');
    if (!this.encryptionKey) {
      this.logger.error('MESSAGE_XOR_KEY is not defined in environment variables.');
      throw new Error('MESSAGE_XOR_KEY is not defined in environment variables.');
    }
  }

  afterInit(server: Server) {
    this.logger.log('ChatGateway Initialized');
  }

  // handleConnection is now primarily for post-authentication logic
  // WsJwtGuard handles the authentication and attaches client.data.user
  async handleConnection(client: Socket) {
    this.logger.log(`[ChatGateway][${client.id}] handleConnection invoked.`);
    this.logger.log(`[ChatGateway][${client.id}] Inspecting client.data. Type: ${typeof client.data}, Value: ${JSON.stringify(client.data)}`);

    if (client.data && typeof client.data === 'object' && client.data.user && client.data.user.sub) {
      this.logger.log(`[ChatGateway][${client.id}] User data found in client.data. User ID: ${client.data.user.sub}`);
      // Additional connection logic after successful authentication can go here
    } else {
      this.logger.warn(`[ChatGateway][${client.id}] User data NOT found or incomplete in client.data. Current client.data.user: ${JSON.stringify(client.data?.user)}. Full client.data: ${JSON.stringify(client.data)}`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // Handle cleanup, like removing user from rooms they were in
  }

  @SubscribeMessage('joinMatchRoom')
  handleJoinRoom(@MessageBody('matchId') matchId: string, @ConnectedSocket() client: Socket) {
    if (!client.data.user) {
      this.logger.warn(`Unauthorized attempt to join room by ${client.id}`);
      return { event: 'error', data: 'Unauthorized' };
    }
    client.join(matchId);
    this.logger.log(`User ${client.data.user.sub} (Client ${client.id}) joined room: ${matchId}`);
    // Optionally, acknowledge room join
    client.emit('joinedRoom', { matchId }); 
    return { event: 'joinedRoom', data: { matchId } };
  }

  @SubscribeMessage('leaveMatchRoom')
  handleLeaveRoom(@MessageBody('matchId') matchId: string, @ConnectedSocket() client: Socket) {
    if (!client.data.user) {
      this.logger.warn(`Unauthorized attempt to leave room by ${client.id}`);
      return { event: 'error', data: 'Unauthorized' };
    }
    client.leave(matchId);
    this.logger.log(`User ${client.data.user.sub} (Client ${client.id}) left room: ${matchId}`);
    return { event: 'leftRoom', data: { matchId } };
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody(ValidationPipe) payload: IncomingMessageDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> { // Return type can be void or an ack payload
    if (!client.data.user) {
      this.logger.warn(`Unauthorized message attempt by ${client.id}`);
      // client.emit('error', { message: 'Unauthorized' }); // Send error back to sender
      return; 
    }
    const senderId = client.data.user.sub; // Assuming 'sub' is the user ID in JWT payload
    this.logger.log(
      `Message from User ${senderId} (Client ${client.id}) to Match ${payload.matchId}: ${payload.content}`,
    );

    try {
      const savedMessage = await this.chatService.createMessage(
        payload.matchId,
        senderId,
        payload.content,
      );

      // Decrypt content for broadcasting
      const decryptedContent = xorDecrypt(savedMessage.content, this.encryptionKey);

      const messageToBroadcast = {
        id: savedMessage.id,
        matchId: savedMessage.matchId,
        senderId: savedMessage.senderId,
        content: decryptedContent, // Send decrypted content
        createdAt: savedMessage.createdAt,
        isRead: savedMessage.isRead,
        // Include sender details if needed, fetched from client.data.user or another service call
        sender: {
            id: client.data.user.sub,
            fullname: client.data.user.fullname, // Assuming fullname is in JWT or client.data
            // profilePicture: client.data.user.profilePicture
        }
      };

      // Broadcast to the specific match room
      this.server.to(payload.matchId).emit('newMessage', messageToBroadcast);
      this.logger.log(`Message broadcasted to room ${payload.matchId}`);

      // Optional: Acknowledge message receipt to sender
      // client.emit('messageSentAck', { messageId: savedMessage.id, status: 'success' });

    } catch (error) {
      this.logger.error(`Error handling message from ${senderId}: ${error.message}`);
      // client.emit('error', { message: 'Failed to send message' });
    }
  }
}
