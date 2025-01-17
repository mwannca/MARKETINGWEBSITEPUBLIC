import { SetMetadata } from '@nestjs/common';

export const Stripe = (...args: string[]) => SetMetadata('stripe', args);
