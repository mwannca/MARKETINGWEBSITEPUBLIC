import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUser(userId: string, res: Response) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        LastName: true,
        phoneNumber: true,
        email: true,
        stripeCustomerId: true,
      },
    });
    if (user) {
      return res.send({ message: 'Success', user }).status(200);
    } else {
      return new UnauthorizedException('User does not exist');
    }
  }
  async getUserProfileById(userId: string): Promise<object | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        LastName: true,
        phoneNumber: true,
        email: true,
        stripeCustomerId: true, // Assuming your User table has this field
      },
    });

    if (!user) {
      throw new UnauthorizedException('User does not exist');
    }

    return user;
  }
}
