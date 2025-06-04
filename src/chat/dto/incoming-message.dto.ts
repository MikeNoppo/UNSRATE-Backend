import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class IncomingMessageDto {
  @IsNotEmpty()
  @IsString()
  matchId: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(2000) // Consistent with CreateMessageDto previously
  content: string;
}
