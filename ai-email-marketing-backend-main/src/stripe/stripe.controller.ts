import {
  Body,
  Controller,
  Post,
  HttpException,
  HttpStatus,
  Delete,
  Param,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth, ApiBody,
} from '@nestjs/swagger';
import { AuthenticatedRequest } from '../auth/type';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('Stripe')
@ApiBearerAuth()
@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('create-payment-intent')
  @ApiOperation({ summary: 'Create a payment intent for Stripe' })
  @ApiResponse({
    status: 201,
    description: 'Payment intent created successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async createPaymentIntent(@Body('paymentMethodId') paymentMethodId: string) {
    try {
      const paymentIntent =
        await this.stripeService.createPaymentIntent(paymentMethodId);
      return { success: true, paymentIntent };
    } catch (error) {
      throw new HttpException(
        { success: false, error: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('create-plans')
  @ApiOperation({ summary: 'Create all subscription plans in Stripe' })
  @ApiResponse({
    status: 201,
    description: 'Plans created successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async createAllPlans() {
    try {
      await this.stripeService.createAllPlans();
      return { success: true, message: 'Plans created successfully.' };
    } catch (error) {
      console.error('Error creating plans:', error);
      throw new HttpException(
        { success: false, error: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('createSubscription')
  @ApiOperation({ summary: 'Create a new subscription for a user' })
  @ApiResponse({
    status: 201,
    description: 'Subscription created successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async createSubscription(
    @Body('stripeCustomerId') stripeCustomerId: string,
    @Body('priceId') priceId: string,
    @Body('paymentMethodId') paymentMethodId: string,
  ) {
    try {
      const subscription = await this.stripeService.createSubscription(
        stripeCustomerId,
        priceId,
        paymentMethodId,
      );
      return { success: true, subscription };
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw new HttpException(
        { success: false, error: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('subscriptions')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get current subscription for a user' })
  @ApiResponse({
    status: 200,
    description: 'Subscription retrieved successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async getCurrentSubscription(@Req() req) {
    try {
      const userId = req.user.sub; // Get user ID from token
      const subscription =
        await this.stripeService.getUserActiveSubscription(userId); // Use new service

      return { success: true, subscription };
    } catch (error) {
      throw new HttpException(
        { success: false, error: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('products') // Endpoint to get products with prices
  @ApiOperation({ summary: 'Retrieve products with prices' })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async getProductsWithPrices() {
    try {
      const products = await this.stripeService.getProductsWithPrices();
      return { success: true, products };
    } catch (error) {
      console.error('Error fetching products:', error.message);
      throw new HttpException(
        { success: false, error: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('invoices/:customerId') // New endpoint to get invoices for a customer
  @ApiOperation({ summary: 'Retrieve invoices for a specific customer' })
  @ApiResponse({
    status: 200,
    description: 'Invoices retrieved successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async getCustomerInvoices(@Param('customerId') customerId: string) {
    try {
      const invoices = await this.stripeService.getCustomerInvoices(customerId);
      return { success: true, invoices };
    } catch (error) {
      throw new HttpException(
        { success: false, error: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete('cancel-subscription/:subscriptionId')
  @ApiOperation({ summary: 'Cancel a subscription' })
  @ApiResponse({
    status: 200,
    description: 'Subscription canceled successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async cancelSubscription(@Param('subscriptionId') subscriptionId: string) {
    try {
      const subscription =
        await this.stripeService.cancelSubscription(subscriptionId);
      return { success: true, subscription };
    } catch (error) {
      throw new HttpException(
        { success: false, error: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('payment-methods/:userId')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get payment methods for a user' })
  @ApiResponse({
    status: 200,
    description: 'Payment methods retrieved successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async getPaymentMethods(@Param('userId') userId: string) {
    try {
      const paymentMethods = await this.stripeService.getPaymentMethods(userId);
      return { success: true, paymentMethods };
    } catch (error) {
      throw new HttpException(
        { success: false, error: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('paymentMethods')
  @ApiOperation({ summary: 'Add a new payment method for a user' })
  @ApiResponse({
    status: 201,
    description: 'Payment method added successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async addPaymentMethod(
    @Body('stripeCustomerId') stripeCustomerId: string,
    @Body('paymentMethodId') paymentMethodId: string,
  ) {
    try {
      const paymentMethod = await this.stripeService.addPaymentMethod(
        stripeCustomerId,
        paymentMethodId,
      );
      return { success: true, paymentMethod };
    } catch (error) {
      throw new HttpException(
        { success: false, error: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete('payment-methods/:paymentMethodId')
  @ApiOperation({ summary: 'Delete a payment method' })
  @ApiResponse({
    status: 200,
    description: 'Payment method deleted successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async deletePaymentMethod(@Param('paymentMethodId') paymentMethodId: string) {
    try {
      const response =
        await this.stripeService.deletePaymentMethod(paymentMethodId);
      return { success: true, message: response.message };
    } catch (error) {
      throw new HttpException(
        { success: false, error: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('create-customer')
  @ApiOperation({ summary: 'Create a new customer in Stripe' })
  @ApiResponse({
    status: 201,
    description: 'Customer created successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({
    description: 'Email of the customer to create in Stripe',
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          example: 'user@example.com',
        },
      },
    },
  })
  async createCustomer(@Body('email') email: string) {
    try {
      const customer = await this.stripeService.createCustomer(email);
      return { success: true, customer };
    } catch (error) {
      throw new HttpException(
        { success: false, error: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('upgrade-plan')
  @ApiOperation({ summary: 'Upgrade a customer to a higher subscription plan' })
  @ApiResponse({
    status: 200,
    description: 'Subscription upgraded successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async upgradePlan(
    @Body('customerId') customerId: string,
    @Body('newPlan') newPlan: string,
  ) {
    try {
      const subscription = await this.stripeService.upgradePlan(
        customerId,
        newPlan,
      );
      return { success: true, subscription };
    } catch (error) {
      throw new HttpException(
        { success: false, error: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
