import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';
import { AwsModule } from '../aws/aws.module'; // Import PrismaService

@Module({
  imports: [AwsModule],
  controllers: [ProductsController],
  providers: [ProductsService, PrismaService], // Add PrismaService to providers
})
export class ProductsModule {}
