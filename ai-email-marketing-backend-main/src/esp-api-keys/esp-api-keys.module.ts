import { Module } from '@nestjs/common';
import { EspApiKeysController } from './esp-api-keys.controller';
import { EspApiKeysService } from './esp-api-keys.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [EspApiKeysController],
  providers: [EspApiKeysService, PrismaService],
})
export class EspApiKeysModule {}
