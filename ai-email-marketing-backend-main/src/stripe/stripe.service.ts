import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2024-06-20', // Update API version if needed
    });
  }
  async createAllPlans(): Promise<void> {
    const plans = [
      {
        name: 'Free Plan',
        description:
          'Up to 5 custom emails per month (includes revisions), Brand limit: 1, Basic analytics and reporting',
        unitAmount: 0, // Free plan
        usageBased: false,
        metadata: {
          brand_limit: '1',
          features: 'Basic analytics and reporting',
          credits: '100',
        },
      },
      {
        name: 'Scale Plan',
        description:
          'Up to 25 custom emails per month (includes revisions), Brand limit: 1, Export as HTML/image or with Klaviyo, Priority support, Access to basic AI analytics and reporting',
        unitAmount: 3900, // Usage-based, $1 per email (CAD cents)
        usageBased: true, // Metered billing
        emailLimit: 25, // Includes up to 25 custom emails per month
        metadata: {
          brand_limit: '1',
          features:
            'Priority support, Export as HTML/image, Basic AI analytics',
          credits: '500',
        },
      },
      {
        name: 'Growth Plan',
        description:
          'Up to 100 custom emails per month (includes revisions), Brand limit: 5, Export as HTML/image or with Klaviyo, Priority support, Advanced AI analytics and reporting, Customizable email templates',
        unitAmount: 8900, // Usage-based, $0.80 per email (CAD cents)
        usageBased: true, // Metered billing
        emailLimit: 100, // Includes up to 100 custom emails per month
        metadata: {
          brand_limit: '5',
          features:
            'Priority support, Advanced AI analytics, Customizable templates',
          credits: '1000',
        },
      },
      {
        name: 'Enterprise Plan',
        description:
          'Unlimited custom emails (includes revisions), Custom ESP integration, Slack Connect, Brand limit: Unlimited, Access to all features, Managed services, Dedicated AI consultant, Early access to new features',
        unitAmount: 24900, // Flat pricing, $249/month (CAD cents)
        usageBased: false, // No overages for this plan
        metadata: {
          brand_limit: 'Unlimited',
          features:
            'Managed services, Custom ESP integration, Slack Connect, AI consultant',
          credits: 'Unlimited',
        },
      },
    ];

    for (const plan of plans) {
      await this.createPlan(plan);
    }

    console.log('Plans created successfully.');
  }

  async createPlan(plan: {
    name: string;
    description: string;
    unitAmount: number;
    usageBased: boolean;
    emailLimit?: number;
    metadata: {
      brand_limit: string;
      features: string;
      credits: string;
    };
  }): Promise<void> {
    try {
      // Create product in Stripe
      const product = await this.stripe.products.create({
        name: plan.name,
        description: plan.description,
        metadata: plan.metadata,
      });

      // Check if usage-based billing is required (i.e., using meters)
      if (plan.usageBased) {
        // Create the metered pricing
        await this.stripe.prices.create({
          unit_amount: plan.unitAmount, // Pricing for metered usage
          currency: 'cad',
          recurring: {
            interval: 'month',
            usage_type: 'metered', // Set usage type as metered
          },
          product: product.id,
          // Link the price to the meter system as per your Stripe configuration
          expand: ['metering_system'], // Adjust this according to Stripe’s API for metered system
        });
      } else {
        // Create a standard flat-rate recurring price
        await this.stripe.prices.create({
          unit_amount: plan.unitAmount, // Price in cents
          currency: 'cad',
          recurring: {
            interval: 'month',
          },
          product: product.id,
        });
      }

      console.log(`Created plan: ${plan.name}`);
    } catch (error) {
      console.error(`Error creating plan ${plan.name}:`, error);
    }
  }

  // async createAllPlans(): Promise<void> {
  //   const plans = [
  //     {
  //       name: 'Free Plan',
  //       description:
  //         'Up to 5 custom emails per month (includes revisions), Brand limit: 1, Basic analytics and reporting',
  //       unitAmount: 0, // Free
  //       usageBased: false,
  //     },
  //     {
  //       name: 'Scale Plan',
  //       description:
  //         'Up to 25 custom emails per month (includes revisions), Brand limit: 1, Export as HTML/image or with Klaviyo, Priority support, Access to basic AI analytics and reporting',
  //       unitAmount: 3900, // $39/month
  //       usageBased: true,
  //       emailLimit: 25, // Includes up to 25 custom emails per month
  //     },
  //     {
  //       name: 'Growth Plan',
  //       description:
  //         'Up to 100 custom emails per month (includes revisions), Brand limit: 5, Export as HTML/image or with Klaviyo, Priority support, Advanced AI analytics and reporting, Customizable email templates',
  //       unitAmount: 8900, // $89/month
  //       usageBased: true,
  //       emailLimit: 100, // Includes up to 100 custom emails per month
  //     },
  //     {
  //       name: 'Enterprise Plan',
  //       description:
  //         'Unlimited custom emails (includes revisions), Custom ESP integration, Slack Connect, Brand limit: Unlimited, Access to all features, Managed services, Contact sales for custom pricing, Dedicated AI consultant, Early access to new features',
  //       unitAmount: 24900, // Starting at $249/month (custom pricing)
  //       usageBased: false, // No overages for this plan
  //     },
  //   ];
  //
  //   for (const plan of plans) {
  //     await this.createPlan(plan);
  //   }
  //
  //   console.log('Plans created successfully.');
  // }
  /**
   * Create a product and price in Stripe
   */
  /**
   * Create a product and price in Stripe.
   * Adds usage-based pricing for plans with email limits.
   */
  // async createPlan(plan: {
  //   name: string;
  //   description: string;
  //   unitAmount: number;
  //   usageBased: boolean;
  //   emailLimit?: number;
  // }): Promise<void> {
  //   const product = await this.stripe.products.create({
  //     name: plan.name,
  //     description: plan.description,
  //   });
  //
  //   // Create a recurring price for the base plan
  //   await this.stripe.prices.create({
  //     unit_amount: plan.unitAmount, // Price in cents (e.g., $39/month is 3900)
  //     currency: 'usd',
  //     recurring: { interval: 'month' },
  //     product: product.id,
  //   });
  //
  //   // If the plan has usage-based pricing, add a metered price for extra emails
  //   if (plan.usageBased && plan.emailLimit) {
  //     // Create usage-based price for additional emails
  //     await this.stripe.prices.create({
  //       unit_amount: 100, // $1 per extra email (in cents)
  //       currency: 'usd',
  //       recurring: {
  //         interval: 'month',
  //         usage_type: 'metered', // This enables metered billing (usage-based pricing)
  //       },
  //       product: product.id,
  //       metadata: {
  //         feature: 'email_overage',
  //         email_limit: plan.emailLimit.toString(),
  //       },
  //     });
  //
  //     console.log(
  //       `Usage-based pricing created for ${plan.name} with ${plan.emailLimit} emails included.`,
  //     );
  //   }
  // }

  /**
   * Create a subscription for the user
   */
  async createSubscription(
    customerId: string,
    priceId: string,
    paymentMethodId: string,
  ): Promise<Stripe.Subscription> {
    const subscription = await this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      default_payment_method: paymentMethodId,
      expand: ['latest_invoice.payment_intent'],
    });

    return subscription;
  }

  /**
   * Handle email usage for metered billing
   */
  async handleEmailUsage(
    customerId: string,
    plan: string,
    emailsSent: number,
  ): Promise<void> {
    // Retrieve active subscription for the customer
    const subscription = await this.getActiveSubscription(customerId);

    if (!subscription) {
      throw new Error(
        `No active subscription found for customer ${customerId}`,
      );
    }

    // Define email limits for each plan (Scale and Growth)
    const planLimits = {
      scale: 25,
      growth: 100,
    };

    // Handle plans with usage billing
    if (plan === 'scale' || plan === 'growth') {
      const emailsAllowed = planLimits[plan];

      // If the emails sent exceed the allowed limit, report overage to Stripe
      if (emailsSent > emailsAllowed) {
        const overage = emailsSent - emailsAllowed;
        // Report overage for emails that exceed the plan limit
        await this.reportMeteredUsage(customerId, 'email_overage', overage);
      } else {
        // If under the limit, bill for the actual usage
        await this.reportMeteredUsage(customerId, 'email_usage', emailsSent);
      }
    }

    // No usage metering for enterprise plan (flat rate)
    if (plan === 'enterprise') {
      console.log(
        `Enterprise plan for customer ${customerId}: Flat rate billing`,
      );
    }
  }

  async reportMeteredUsage(
    customerId: string,
    eventName: string,
    usageValue: number,
  ): Promise<void> {
    try {
      const timestamp = Math.floor(Date.now() / 1000); // Current time in Unix timestamp format

      const response = await this.stripe.billing.meterEvents.create({
        event_name: eventName,
        timestamp: timestamp, // Current timestamp for event
        payload: {
          stripe_customer_id: customerId,
          value: usageValue.toString(), // The usage value to report (e.g., 1 email sent)
        },
      });

      console.log(
        `Reported metered usage for customer ${customerId}:`,
        response,
      );
    } catch (error) {
      console.error('Error reporting metered usage:', error);
      throw error;
    }
  }
  /**
   * Get active subscription for a customer
   */
  async getActiveSubscription(
    customerId: string,
  ): Promise<Stripe.Subscription | null> {
    const subscriptions = await this.stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
    });

    return subscriptions.data.length > 0 ? subscriptions.data[0] : null;
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(
    subscriptionId: string,
  ): Promise<Stripe.Subscription> {
    const subscription = await this.stripe.subscriptions.cancel(subscriptionId);
    await this.prisma.subscription.update({
      where: { stripeSubscriptionId: subscriptionId },
      data: { status: subscription.status },
    });

    return subscription;
  }

  /**
   * Create a payment intent for charging
   */
  async createPaymentIntent(
    paymentMethodId: string,
  ): Promise<Stripe.PaymentIntent> {
    return await this.stripe.paymentIntents.create({
      amount: 2000, // Amount in cents (e.g., $20.00)
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true, // Automatically confirm the payment
    });
  }

  /**
   * Get products with their prices
   */
  async getProductsWithPrices(): Promise<any[]> {
    // Fetch all products from Stripe
    const products = await this.stripe.products.list();
    const productsWithPrices = [];

    for (const product of products.data) {
      let priceList = [];

      // Retrieve the default price or list all prices if no default is set
      if (product.default_price) {
        const price = await this.stripe.prices.retrieve(
          product.default_price as string,
        );
        priceList = [price];
      } else {
        const prices = await this.stripe.prices.list({ product: product.id });
        if (prices.data.length > 0) {
          priceList = prices.data;
        }
      }

      // Ensure prices are available and push product data with all metadata (excluding trial_days)
      if (priceList.length > 0) {
        productsWithPrices.push({
          priceId: priceList[0].id,
          productName: product.name,
          prices: priceList,
          metadata: product.metadata, // Returning all metadata, no filtering
        });
      }
    }

    return productsWithPrices;
  }

  async getUserActiveSubscription(userId: string): Promise<Stripe.Subscription | null> {
    // Retrieve the user from the database
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    console.log(user);
    if (!user || !user.stripeCustomerId) {
      throw new Error('No Stripe customer ID found for user');
    }

    // Use the existing Stripe service method to get the active subscription
    const subscription = await this.getActiveSubscription(
      user.stripeCustomerId,
    );
    return subscription;
  }
  /**
   * Upgrade a customer to a higher plan
   */
  async upgradePlan(
    customerId: string,
    newPlan: string,
  ): Promise<Stripe.Subscription> {
    const subscription = await this.getActiveSubscription(customerId);

    if (!subscription) {
      throw new Error(
        `No active subscription found for customer ${customerId}`,
      );
    }

    const newPriceId = this.getPlanPriceId(newPlan);

    const updatedSubscription = await this.stripe.subscriptions.update(
      subscription.id,
      {
        items: [{ id: subscription.items.data[0].id, price: newPriceId }],
      },
    );

    return updatedSubscription;
  }

  /**
   * Get Stripe Price ID for a plan
   */
  getPlanPriceId(plan: string): string {
    switch (plan) {
      case 'scale':
        return 'price_scale_plan_id'; // Replace with your Scale Plan price ID
      case 'growth':
        return 'price_growth_plan_id'; // Replace with your Growth Plan price ID
      case 'enterprise':
        return 'price_enterprise_plan_id'; // Replace with your Enterprise Plan price ID
      case 'free':
        return 'price_free_plan_id'; // Replace with your Free Plan price ID
      default:
        throw new Error('Unknown plan');
    }
  }

  /**
   * Create a new Stripe customer
   */
  async createCustomer(email: string): Promise<Stripe.Customer> {
    return this.stripe.customers.create({ email });
  }

  /**
   * Add a new payment method for a user
   */
  async addPaymentMethod(
    stripeCustomerId: string,
    paymentMethodId: string,
  ): Promise<Stripe.PaymentMethod> {
    const paymentMethod = await this.stripe.paymentMethods.attach(
      paymentMethodId,
      { customer: stripeCustomerId },
    );
    await this.stripe.customers.update(stripeCustomerId, {
      invoice_settings: { default_payment_method: paymentMethod.id },
    });
    return paymentMethod;
  }

  async getPaymentMethods(userId: string): Promise<Stripe.PaymentMethod[]> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.stripeCustomerId) {
      throw new Error('User or customer not found');
    }
    console.log("i WAS THERE");
    console.log(user.stripeCustomerId);
    const paymentMethods = await this.stripe.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: 'card', // Adjust the type if needed
    });

    return paymentMethods.data;
  }

  /**
   * Delete a payment method
   */
  async deletePaymentMethod(
    paymentMethodId: string,
  ): Promise<{ message: string }> {
    await this.stripe.paymentMethods.detach(paymentMethodId);
    return { message: 'Payment method deleted successfully' };
  }

  /**
   * Fetch invoices for a specific customer
   */
  async getCustomerInvoices(customerId: string): Promise<Stripe.Invoice[]> {
    const invoices = await this.stripe.invoices.list({ customer: customerId });
    return invoices.data;
  }
}
