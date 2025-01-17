import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { StripeService } from '../stripe/stripe.service'; // Import StripeService
import { PrismaModule } from '../prisma/prisma.module'; // Import PrismaModule

@Module({
  imports: [
    PrismaModule, // Add PrismaModule here
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, StripeService], // Add StripeService to providers
})
export class AuthModule {}
