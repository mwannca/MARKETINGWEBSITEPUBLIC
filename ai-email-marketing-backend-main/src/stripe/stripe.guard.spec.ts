import { StripeGuard } from './stripe.guard';

describe('StripeGuard', () => {
  it('should be defined', () => {
    expect(new StripeGuard()).toBeDefined();
  });
});
