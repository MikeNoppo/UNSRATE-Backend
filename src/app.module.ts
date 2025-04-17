import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { UsersModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PddiktiModule } from './pddikti/pddikti.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [ConfigModule.forRoot({isGlobal : true}),UsersModule,AuthModule,PddiktiModule,PrismaModule],
  providers: [AppService],
})
export class AppModule {}
