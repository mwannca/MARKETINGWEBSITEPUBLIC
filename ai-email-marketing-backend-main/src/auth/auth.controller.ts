import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Req,
  Res,
  Delete,
  Param,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { signupDto, signinDto } from './dto/auth.dto'; // Make sure to define updateUserDto
import { UpdateUserDto } from './dto/auth.dto';
import { Request, Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StripeService } from '../stripe/stripe.service';
import { AuthenticatedRequest } from './type';
import { AuthGuard } from './auth.guard'; // Import StripeService

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly stripeService: StripeService, // Inject StripeService
  ) {}

  @Post('signup')
  @ApiOperation({ summary: 'User signup' })
  @ApiResponse({ status: 201, description: 'User signed up successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  signup(@Body() dto: signupDto, @Req() req: Request, @Res() res: Response) {
    return this.authService.signup(dto, req, res);
  }

  @Post('signin')
  @ApiOperation({ summary: 'User signin' })
  @ApiResponse({ status: 200, description: 'User signed in successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  signin(@Body() dto: signinDto, @Req() req: Request, @Res() res: Response) {
    return this.authService.signin(dto, req, res);
  }

  @Post('signout')
  @ApiOperation({ summary: 'User signout' })
  @ApiResponse({ status: 200, description: 'User signed out successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  signout(@Req() req: Request, @Res() res: Response) {
    // Assuming this.authService.signout() handles the cookie clearing
    res.clearCookie('token');
    return res.send({ message: 'Success' });
  }

  @Get('me') // New endpoint to get user details
  @ApiOperation({ summary: 'Get current user details' })
  @ApiResponse({
    status: 200,
    description: 'User details retrieved successfully.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async getUserDetails(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    try {
      const userDetails = await this.authService.getUserDetails(req.user.id); // Assumes req.user is set by a middleware
      return res.json(userDetails);
    } catch (error) {
      return res.status(404).json({ error: error.message });
    }
  }

  @Patch('update')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update user details' })
  @ApiResponse({
    status: 200,
    description: 'User details updated successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async updateUser(
    @Body() dto: UpdateUserDto,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    try {
      const updatedUser = await this.authService.updateUserDetails(
        req.user.id, // Use req.user.id instead of req.user.sub
        dto,
      );
      return res.json({
        message: 'User details updated successfully',
        user: updatedUser,
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  @Get('payment-methods') // New endpoint to get payment methods
  @ApiOperation({ summary: 'Retrieve payment methods for the user' })
  @ApiResponse({
    status: 200,
    description: 'Payment methods retrieved successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async getPaymentMethods(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    try {
      const paymentMethods = await this.stripeService.getPaymentMethods(
        req.user.id,
      ); // Assumes user ID is available in the request
      return res.json(paymentMethods);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  @Post('payment-methods') // New endpoint to add a payment method
  @ApiOperation({ summary: 'Add a new payment method' })
  @ApiResponse({
    status: 201,
    description: 'Payment method added successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async addPaymentMethod(
    @Body('paymentMethodId') paymentMethodId: string,
    @Req() stripeUserId: string,
    @Res() res: Response,
  ) {
    try {
      await this.stripeService.addPaymentMethod(stripeUserId, paymentMethodId);
      return res.json({ message: 'Payment method added successfully' });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  @Delete('payment-methods/:id') // New endpoint to delete a payment method
  @ApiOperation({ summary: 'Delete a payment method' })
  @ApiResponse({
    status: 200,
    description: 'Payment method deleted successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async deletePaymentMethod(
    @Param('id') paymentMethodId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      await this.stripeService.deletePaymentMethod(paymentMethodId);
      return res.json({ message: 'Payment method deleted successfully' });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
}
