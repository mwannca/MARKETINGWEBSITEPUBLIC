import { Module } from '@nestjs/common';
import { SendGridService } from './sendgrid/sendgrid.service';

@Module({
  providers: [SendGridService],
    exports: [SendGridService], // Export the service to be available to other modules
    })
    export class NotificationModule {}