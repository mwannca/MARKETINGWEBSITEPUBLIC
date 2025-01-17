import { Module } from '@nestjs/common';
import { EditorService } from './editor.service';
import { EditorController } from './editor.controller';
import { AwsModule } from 'src/aws/aws.module';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [AwsModule],
  providers: [EditorService, PrismaService],
  controllers: [EditorController],
})
export class EditorModule {}
