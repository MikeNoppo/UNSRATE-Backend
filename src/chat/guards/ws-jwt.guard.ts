import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  private logger: Logger = new Logger(WsJwtGuard.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const client: Socket = context.switchToWs().getClient<Socket>();
    const token =
      client.handshake.auth?.token ||
      client.handshake.headers?.authorization?.split(' ')[1];

    if (!token) {
      this.logger.warn(`Client ${client.id} connection denied: No token provided.`);
      client.disconnect(true); // Or emit an error event
      return false;
    }

    try {
      const secret = this.configService.get<string>('JWT_SECRET');
      if (!secret) {
        this.logger.error('JWT_SECRET is not defined in environment variables.');
        throw new Error('JWT_SECRET is not configured.');
      }
      const payload = this.jwtService.verify(token, { secret });
      this.logger.log(`[WsJwtGuard][${client.id}] Payload verified: ${JSON.stringify(payload)}`);
      
      client.data = client.data || {}; // Ensure client.data is an object
      client.data.user = payload; 
      this.logger.log(`[WsJwtGuard][${client.id}] client.data after assignment: ${JSON.stringify(client.data)}`);
      
      if (client.data.user && client.data.user.sub) {
        this.logger.log(`[WsJwtGuard][${client.id}] Authentication successful for user: ${client.data.user.sub}`);
        return true;
      } else {
        this.logger.error(`[WsJwtGuard][${client.id}] FATAL: Payload verified but client.data.user or client.data.user.sub is missing post-assignment. Payload: ${JSON.stringify(payload)}, client.data.user: ${JSON.stringify(client.data.user)}`);
        client.disconnect(true);
        return false;
      }
    } catch (error) {
      this.logger.warn(`[WsJwtGuard][${client.id}] Connection denied: Token verification failed. ${error.message}`);
      client.disconnect(true); // Or emit an error event
      return false;
    }
  }
}
