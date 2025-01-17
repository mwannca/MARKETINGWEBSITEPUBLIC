import { Module } from '@nestjs/common';
import { BrandsController } from './brands.controller';
import { BrandsService } from './brands.service';
import { AwsModule } from 'src/aws/aws.module';
import { PrismaService } from '../prisma/prisma.service';
import {StripeModule} from "../stripe/stripe.module";
import {StripeService} from "../stripe/stripe.service"; // Correct import for PrismaService

@Module({
  imports: [AwsModule, StripeModule],
  controllers: [BrandsController], // Only controllers here
  providers: [BrandsService, PrismaService, StripeService], // Add PrismaService to providers
})
export class BrandsModule {}
