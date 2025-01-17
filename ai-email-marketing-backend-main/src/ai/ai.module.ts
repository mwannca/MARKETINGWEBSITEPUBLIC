  import { Module } from '@nestjs/common';
  import { AiService } from './ai.service';
  import { AiController } from './ai.controller';
  import { StripeService } from '../stripe/stripe.service';
  import { StripeModule } from '../stripe/stripe.module';

  @Module({
    imports: [StripeModule],
    providers: [AiService, StripeService],
    controllers: [AiController],
  })
  export class AiModule {}
