import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { BrandsModule } from './brands/brands.module';
import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';
import { EditorModule } from './editor/editor.module';
import { AiModule } from './ai/ai.module';
import { AwsModule } from './aws/aws.module';
import { EspApiKeysModule } from './esp-api-keys/esp-api-keys.module';
import { StripeModule } from './stripe/stripe.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // This makes the configuration available globally
    }),
    AuthModule,
    PrismaModule,
    BrandsModule,
    ProductsModule,
    UsersModule,
    EditorModule,
    AiModule,
    AwsModule,
    EspApiKeysModule,
    StripeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
