import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { jwtConstants } from './constants';
import { signinDto, signupDto, UpdateUserDto } from './dto/auth.dto';
import { StripeService } from '../stripe/stripe.service';
import { AuthenticatedRequest } from './type'; // Import the StripeService

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private stripeService: StripeService, // Inject the StripeService
  ) {}

  async signup(dto: signupDto, req: Request, res: Response) {
    const { firstName, lastName, email, password, phoneNumber, address } = dto;
    const isCurrentUser = await this.prisma.user.findUnique({
      where: { email: email },
    });
    if (isCurrentUser) throw new BadRequestException('Email already exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        firstName: firstName,
        LastName: lastName,
        email: email,
        hashedPassword: hashedPassword,
        phoneNumber: phoneNumber,
        Address: address,
      },
    });

    if (!user) throw new BadRequestException('Could Not Create User');

    // Create a Stripe customer for the new user
    const customer = await this.stripeService.createCustomer(email);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customer.id }, // Store the Stripe customer ID in the user record
    });

    const payload = {
      sub: user.id,
      username: `${user.firstName} ${user.LastName}`,
    };
    const token = await this.jwtService.signAsync(payload, {
      secret: jwtConstants.secret,
      expiresIn: '1h',
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });
    return res.send({ message: 'Success', stripeCustomerId: customer.id });
  }

  async signin(dto: signinDto, req: Request, res: Response) {
    const { email, password } = dto;
    const user = await this.prisma.user.findUnique({ where: { email: email } });
    if (!user) throw new BadRequestException(`No user with the email ${email}`);

    const isMatch = await bcrypt.compare(password, user.hashedPassword);
    if (!isMatch) throw new BadRequestException('Invalid Login Credentials');

    const payload = {
      sub: user.id,
      username: `${user.firstName} ${user.LastName}`,
    };
    const token = await this.jwtService.signAsync(payload, {
      secret: jwtConstants.secret,
      expiresIn: '1h',
    });
    if (!token) throw new BadRequestException('Internal Server Error');

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });
    return res.send({ message: 'Success' });
  }

  async signout(req: Request, res: Response) {
    res.clearCookie('token');
    return res.send({ message: 'Success' });
  }

  // Fetch user details
  async getUserDetails(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { subscriptions: true }, // Include subscriptions if needed
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return user;
  }

  // Update user details
  async updateUserDetails(userId: string, userDetails: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    return await this.prisma.user.update({
      where: { id: userId },
      data: userDetails,
    });
  }

  // Add a payment method
  async addPaymentMethod(stripeUserId: string, paymentMethodId: string) {
    return await this.stripeService.addPaymentMethod(
      stripeUserId,
      paymentMethodId,
    );
  }

  // Delete a payment method
  async deletePaymentMethod(userId: string, paymentMethodId: string) {
    return await this.stripeService.deletePaymentMethod(paymentMethodId);
  }
}
