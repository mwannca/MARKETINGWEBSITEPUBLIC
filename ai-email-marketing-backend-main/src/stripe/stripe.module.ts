import { Module } from '@nestjs/common';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service'; // Import PrismaService

@Module({
  controllers: [StripeController],
  providers: [StripeService, PrismaService, UsersService], // Add PrismaService here if it's needed
  exports: [StripeService], // Export StripeService
})
export class StripeModule {}
