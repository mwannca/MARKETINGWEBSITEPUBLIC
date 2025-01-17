import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import puppeteer, { Page } from 'puppeteer';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddLogoDto, ScrapeBrands, UpdateBrandsDto } from './dto/brands.dto';
import { Response } from 'express';
import { AwsService } from 'src/aws/aws.service';
import axios from 'axios';
import { StripeService } from '../stripe/stripe.service';

@Injectable()
export class BrandsService {
  constructor(
    private prisma: PrismaService,
    private aws: AwsService,
    private stripeService: StripeService,
  ) {}

  async getAllBrands() {
    return this.prisma.brands.findMany(); // Adjust this based on your actual model
  }

  async deleteBrand(brandId: string, userId: string, res: Response) {
    try {
      // First, check if the brand exists and is not already soft deleted
      const brand = await this.prisma.brands.findFirst({
        where: { id: brandId, deleted_at: null }, // Only find brands that are not soft deleted
      });

      if (!brand) {
        return res.status(404).json({ message: 'Brand not found' });
      }

      if (brand.user_id !== userId) {
        return res.status(403).json({
          message: 'You are not authorized to delete this brand',
        });
      }

      // Proceed with soft deletion
      await this.prisma.brands.update({
        where: { id: brandId },
        data: { deleted_at: new Date() }, // Set the current date for soft delete
      });

      return res
        .status(200)
        .json({ message: 'Brand soft deleted successfully' });
    } catch (error) {
      console.error('Error soft deleting brand:', error);
      return res.status(500).json({
        message: 'Internal server error during brand deletion',
      });
    }
  }

  async scrapeForBranding(dto: ScrapeBrands, res: Response, userId: string) {
    const { url, brandName } = dto;

    try {
      // Step 1: Retrieve user's Stripe customer ID
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user || !user.stripeCustomerId) {
        throw new BadRequestException('User or Stripe customer ID not found');
      }
      const stripeCustomerId = user.stripeCustomerId;

      // Step 2: Retrieve user's active subscription
      const subscription =
        await this.stripeService.getActiveSubscription(stripeCustomerId);
      if (!subscription) {
        return res.status(400).send({ message: 'No active subscription found' });
      }

      // Step 3: Get all products with prices and retrieve brand limit from the metadata
      const productsWithPrices =
        await this.stripeService.getProductsWithPrices();
      const product = productsWithPrices.find(
        (prod) => prod.priceId === subscription.items.data[0].price.id,
      );
      const brandLimit =
        product.metadata.brand_limit === 'Unlimited'
          ? Infinity
          : parseInt(product.metadata.brand_limit, 10);

      // Step 4: Retrieve the number of brands associated with the user
      const userBrandCount = await this.prisma.brands.count({
        where: { user_id: userId, deleted_at: null }, // Exclude soft-deleted brands
      });

      // Step 5: Check if the user can create a new brand
      if (userBrandCount >= brandLimit) {
        return res.status(400).send({
          message: 'Brand limit reached. Upgrade your plan to add more brands.',
        });
      }

      // If the user is allowed to create a brand, proceed with Puppeteer
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      console.log('Browser has launched');

      try {
        const page = await browser.newPage();
        page.setDefaultNavigationTimeout(2 * 60 * 1000);
        await page.goto(url, { waitUntil: 'networkidle2' });
        console.log('Navigated to url, starting scraping process...');

        // Scrape logo
        const logo = await this.scrapeLogo(page, brandName, userId);

        // Scrape fonts and colors
        const fontsAndColors = await this.scrapeFontsAndColors(page);

        // Save to database
        const brand = await this.prisma.brands.create({
          data: {
            user_id: userId,
            brand_name: brandName,
            logos: [logo],
            fonts: {
              primaryFont: fontsAndColors.primaryFont,
              secondaryFont: fontsAndColors.secondaryFont,
            },
            colors: {
              primaryColor: fontsAndColors.primaryColor,
              backgroundColor: fontsAndColors.backgroundColor,
            },
            brand_url: url,
          },
        });

        return res.send({ message: 'Success', brand });
      } catch (error) {
        console.error('Error scraping branding info:', error);
        return res
          .status(500)
          .send({ message: 'Failed to scrape branding info', error });
      } finally {
        await browser.close();
      }
    } catch (error) {
      console.error('Error validating brand creation:', error);
      return res
        .status(500)
        .send({ message: 'Failed to validate brand creation', error });
    }
  }

  async scrapeLogo(page: Page, brandName: string, userId: string) {
    const logoSelectors: Array<string> = [
      'img[alt*="logo"]',
      'svg[alt*="logo"]',
      '[id*="logo"] img',
      '[id*="logo"] svg',
      'img[id*="logo"]',
      '[class*="logo"] svg',
      'header img',
      'header svg',
      'nav img',
      'nav svg',
      '.logo img',
      '.logo svg',
      'img[src*="logo"]',
      'img[src*="brand"]',
      'svg[src*="brand"]',
    ];

    let logo = null;
    for (const selector of logoSelectors) {
      logo = await page.evaluate((selector) => {
        const element = document.querySelector(selector);
        if (element) {
          if (element instanceof HTMLImageElement) {
            return { type: 'img', src: element.src };
          }
          if (element instanceof SVGElement) {
            return { type: 'svg', content: element.outerHTML };
          }
        }
      }, selector);
      if (logo) break;
    }

    if (!logo) {
      console.log('No logo found on the page.');
      return null;
    }

    console.log('Logo scraping result:', logo);
    let logoSrc: string | null = null;

    if (logo.type === 'img') {
      if (logo.src.startsWith('http')) {
        logoSrc = logo.src;
      } else {
        const response = await axios.get(logo.src, {
          responseType: 'arraybuffer',
        });
        const buffer = Buffer.from(response.data, 'binary');
        logoSrc = await this.aws.uploadFileSVGorImg(
          userId,
          buffer,
          `${brandName}_logo`,
          'image/png',
        );
      }
    } else if (logo.type === 'svg') {
      const buffer = Buffer.from(logo.content);
      logoSrc = await this.aws.uploadFileSVGorImg(
        userId,
        buffer,
        `${brandName}_logo.svg`,
        'image/svg+xml',
      );
    }

    return logoSrc;
  }

  async scrapeFontsAndColors(page: Page) {
    return await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const colorMap = new Map();
      const fontMap = new Map();

      elements.forEach((el) => {
        const style = window.getComputedStyle(el);
        const bgColor = style.backgroundColor;
        const textColor = style.color;
        const fontFamily = style.fontFamily.split(',')[0].trim();

        if (bgColor !== 'rgba(0, 0, 0, 0)' && !colorMap.has(bgColor)) {
          colorMap.set(bgColor, true);
        }
        if (textColor !== 'rgba(0, 0, 0, 0)' && !colorMap.has(textColor)) {
          colorMap.set(textColor, true);
        }

        if (fontFamily) {
          fontMap.set(fontFamily, (fontMap.get(fontFamily) || 0) + 1);
        }
      });

      const sortedColors = Array.from(colorMap.keys());
      const sortedFonts = Array.from(fontMap.entries()).sort(
        (a, b) => b[1] - a[1],
      );

      const primaryFont = sortedFonts[0] ? sortedFonts[0][0] : null;
      const secondaryFont = sortedFonts[1] ? sortedFonts[1][0] : null;

      return {
        primaryColor: sortedColors[0] || null,
        secondaryColor: sortedColors[1] || null,
        backgroundColor: sortedColors[2] || null,
        colors: sortedColors,
        primaryFont: primaryFont,
        secondaryFont: secondaryFont,
      };
    });
  }
async getBrands(userId: string, res: Response) {
    const brands = await this.prisma.brands.findMany({
      where: { user_id: userId, deleted_at: null }, // Exclude soft-deleted brands
    });
    return res.send({ message: 'Success', brands }).status(200);
  }

  async getBrandById(userId: string, brandId: string, res: Response) {
    const brand = await this.prisma.brands.findUnique({
      where: { id: brandId, deleted_at: null }, // Exclude soft-deleted brands
    });
    if (!brand) return new BadRequestException('No such brand with given id');
    if (userId === brand.user_id) {
      return res.send({ message: 'Success', brand }).status(200);
    } else {
      return new UnauthorizedException(
        'User is not authorized to access this store',
      );
    }
  }

  async addLogo(dto: AddLogoDto, user_id: string, res: Response) {
    const { brandId, logo } = dto;
    const brand = await this.prisma.brands.findUnique({
      where: { id: brandId, deleted_at: null }, // Exclude soft-deleted brands
    });
    if (!brand)
      return new BadRequestException(
        `Brand with id: ${brandId} does not exist`,
      );
    const updatedBrand = await this.prisma.brands.update({
      where: { id: brandId },
      data: { logos: [...brand.logos, logo] },
    });
    return res.send({ message: 'Success', updatedBrand }).status(200);
  }

  async updateBrands(dto: UpdateBrandsDto, user_id: string, res: Response) {
    const { brandName, fonts, colors, logos, brandId } = dto;

    try {
      const existingBrand = await this.prisma.brands.findUnique({
        where: { id: brandId, deleted_at: null }, // Exclude soft-deleted brands
      });

      if (!existingBrand) {
        return res.status(404).json({ message: 'Brand not found' });
      }

      if (existingBrand.user_id !== user_id) {
        return res
          .status(403)
          .json({ message: 'You are not authorized to update this brand' });
      }

      // Compare existing logos with the updated logos and delete the old ones
      const logosToDelete = existingBrand.logos.filter(
        (oldLogo) => !logos.includes(oldLogo),
      );

      // Delete the old logos from S3
      for (const logoUrl of logosToDelete) {
        const logoFileName = logoUrl.split('/').pop();
        if (logoFileName) {
          await this.aws.deleteFile(user_id, logoFileName);
        }
      }

      // Update the brand with the new data
      const updatedBrand = await this.prisma.brands.update({
        where: { id: brandId },
        data: {
          brand_name: brandName,
          fonts: JSON.stringify(fonts),
          colors: JSON.stringify(colors),
          logos: logos, // Use the updated logos
        },
      });

      return res.status(200).send({ message: 'Success', updatedBrand });
    } catch (error) {
      console.error('Error updating brand:', error);
      return res
        .status(500)
        .send({ message: 'Internal server error during brand update' });
    }
  }
}