import { BadRequestException, Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  addImageDto,
  ScrapeProduct,
  UpdateProductDto,
} from './dto/products.dto';
import { Response } from 'express';
import OpenAI from 'openai';

@Injectable()
export class ProductsService {
  private readonly openAi: OpenAI;

  constructor(private prisma: PrismaService) {
    this.openAi = new OpenAI({
      apiKey: process.env.OPEN_AI_KEY,
    });
  }

  async scrapeProduct(dto: ScrapeProduct, res: Response) {
    const { url, brandId } = dto;
    const browser = await puppeteer.launch();
    console.log('Browser has launched');
    try {
      const page = await browser.newPage();
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      );
      await page.setViewport({ width: 1280, height: 800 });

      page.setDefaultNavigationTimeout(2 * 60 * 1000);
      await Promise.all([page.waitForNavigation(), page.goto(url)]);
      console.log('Navigated to url');
      //fetch title
      const titleSelectors = [
        'h1[data-testid="product-title"]', // Walmart-specific title selector
        'h1[itemprop="name"]', // Microdata for product name
        'h1[class*="ProductTitle"]', // Class for product title on various sites
        '.ProductTitle', // General product title class
        'h1[id*="title"]', // General title ID
        'h1[class*="title"]', // General title class
        'h1[id*="product"]', // Specific product ID
        'h1[class*="product"]', // Class for product titles
        'h2[class*="title"]', // Secondary title option
        'h2[itemprop="name"]', // Microdata for product name
        'meta[name="title"]', // Meta title tag
        'title', // Fallback to <title> tag
        '.product-title', // General product title class
        '.product-name', // General product name class
        '.item-title', // Item title class
        'div[class*="product-title"] h1', // Title in a div
        'div[class*="product-name"] h1', // Title in a div with class
        'span[class*="product-title"] h1', // Title in a span
        'span[class*="product-name"] h1', // Title in a span
        'header[class*="product-title"] h1', // Title in a header
        'header[class*="product-name"] h1', // Title in a header
      ];
      let title: null | string | Promise<string> = null;
      for (let index = 0; index < titleSelectors.length; index++) {
        const selector = titleSelectors[index];
        title = await page.evaluate((selector) => {
          const element = document.querySelector(selector);
          if (element) {
            if (selector.startsWith('meta')) {
              return element.getAttribute('content');
            } else if (element instanceof HTMLElement) {
              return element.innerText || element.textContent;
            }
          }
        }, selector);

        if (title) break;
      }
      //fetch price
      const priceSelectors = [
        '.price', // General price
        'span[data-testid="price"]', // Walmart specific price
        'span[class*="Price"]', // Class with price in it
        'meta[itemprop="price"]', // Microdata price
        '.price',
        '.product-price',
        '.product-price-value',
        '.price-wrapper',
        '.price-value',
        '.price-amount',
        '.product-price-amount',
        '.product-price-wrapper',
        '.price-tag',
        '.price-label',
        '.current-price',
        '.sale-price',
        '.discounted-price',
        '.offer-price',
        '.product-discount-price',
        '.regular-price',
        'p[class*="price"]',
        'p[id*="price"]',
        'h1[id*="price"]',
        'h1[class*="price"]',
        'h1[itemprop="price"]',
        'h1[id*="price"]',
        'h2[class*="price"]',
        'h2[id*="price"]',
        'h2[itemprop="price"]',
        'span[class*="price"]',
        'span[id*="price"]',
        'span[itemprop="price"]',
        'div[id*="price"]',
        'div[class*="price"]',
        'div[itemprop="price"]',
        'div[id*="price"]',
      ];
      let price = null;
      for (let index = 0; index < priceSelectors.length; index++) {
        const selector = priceSelectors[index];
        price = await page.evaluate((selector) => {
          const element = document.querySelector(selector);
          if (element) {
            if (selector.startsWith('meta')) {
              return (element as HTMLMetaElement).getAttribute('content');
            } else {
              return (element as HTMLElement).innerText || element.textContent;
            }
          }
        }, selector);

        if (price) break;
      }
      //fetch description
      const descriptionSelectors = [
        'div[data-testid="product-description"]', // Walmart specific
        'div[itemprop="description"]', // Microdata
        'div[class*="ProductDescription"]', // Common class for product descriptions
        'div[class*="prod-description"]', // Alternative common class
        'div[class*="description"]', // General description class
        'p[itemprop="description"]', // Microdata paragraph
        'p[class*="description"]', // Paragraph with class
        'span[class*="description"]', // Span with class
        '.product-description', // General product description
        '.product-details', // General details section
        '.item-description', // General item description
        '.item-details', // General item details
        'meta[name="description"]', // Meta description
        'div[id*="description"]', // Any ID containing "description"
        'div[class*="desc"]', // Shorter class variants
        'h2[class*="details"]', // Heading for details
        'div[class*="details-container"]', // Container for details
        'div[class*="product-details"]', // Product details section
        'div[class*="overview"]', // Overview section
        'div[class*="info"]', // General information class
        'div[class*="content"]', // Content section
        'div[class*="item-details"]', // Item-specific details
        'div[class*="summary"]', // Summary of product
        'div[class*="description-wrapper"]', // Wrapper for descriptions
        'div[data-testid="product-description"]', // Walmart specific for testing
        'div[data-test="product-description"]', // Alternative Walmart selector
        'div[role="document"] .description', // Role-based document
      ];

      let descriptions = '';

      for (let index = 0; index < descriptionSelectors.length; index++) {
        const selector = descriptionSelectors[index];
        const elementsText = await page.evaluate((selector) => {
          const elements = document.querySelectorAll(selector);
          let textContents = '';
          elements.forEach((element) => {
            textContents = textContents + element.textContent.trim();
          });
          return textContents;
        }, selector);

        descriptions = descriptions + elementsText;
      }


      //fetch product photos
      const photoSelectors = [
        'div[data-testid="product-images"]', // Walmart specific for product images
        'img[loading="eager"]', // Images that are eagerly loaded
        '.product-gallery', // General gallery class
        '.product-images', // General images class
        '.product-photos', // General photos class
        '.image-container', // Container for images
        '.slick-slider', // If using slick carousel
        '.carousel', // General carousel class
        '.main-image', // The main displayed image
        '.featured-image', // Featured image
        '.thumbnail-gallery', // Thumbnails
        'img[src*=".jpg"], img[src*=".png"], img[src*=".gif"]', // General images in common formats
        '[data-src]', // Lazy loaded images
        '[class*="image"]', // Any class containing 'image'
        '[class*="product-image"]', // General product image classes
        '[class*="photo"]', // General photo classes
        'div[class*="image-gallery"]', // Container for image galleries
        '.product-image-slider', // Specific for image sliders
        '.owl-carousel', // If using owl carousel
        '[data-product-images]', // Generic data attribute for product images
        '[data-gallery]', // Generic data attribute for galleries
        '[data-slider]', // Generic data attribute for sliders
        '.primary-image', // Primary display image
        'img', // Any <img> tag as a last resort
      ];

      const photosArray = [];
      for (let index = 0; index < photoSelectors.length; index++) {
        const selector = photoSelectors[index];
        const photos = await page.evaluate((selector) => {
          const urls = new Set();
          // Get src from img tags
          document.querySelectorAll(`${selector} img`).forEach((img: any) => {
            if (img.src) urls.add(img.src);
          });

          // Get srcset from source tags within picture elements
          document
            .querySelectorAll(`${selector} picture source`)
            .forEach((source: any) => {
              if (source.srcset) {
                // Split srcset and get the first URL (typically the highest resolution)
                const firstSrc = source.srcset.split(',')[0].split(' ')[0];
                urls.add(firstSrc);
              }
            });
          return Array.from(urls);
        }, selector);

        photosArray.push(...photos);
      }

      //filterPhotos
      for (let i = photosArray.length - 1; i >= 0; i--) {
        const url = photosArray[i];
        if (!url.startsWith('https://')) {
          photosArray.splice(i, 1);
        }
      }

      // fetch reviews

      //upload to prisma db
      const product = await this.prisma.products.create({
        data: {
          brand_id: brandId,
          product_url: url,
          product_name: title as string,
          images: photosArray,
          description: descriptions,
          price: price,
        },
      });

      res.send({ message: 'Success', product }).status(200);
    } catch (error) {
      return new BadRequestException(error);
    } finally {
      await browser.close();
    }
  }

  async getProducts(brandId: string, res: Response) {
    const products = await this.prisma.products.findMany({
      where: { brand_id: brandId },
    });
    return res.send({ message: 'Success', products }).status(200);
  }

  async getProductById(prodId: string, res: Response) {
    const product = await this.prisma.products.findUnique({
      where: { id: prodId },
    });

    if (!product) {
      return res.status(404).send({ message: 'Product not found.' }); // Return 404 if not found
    }

    return res.status(200).send({ message: 'Success', product }); // Return the found product
  }


  async updateProduct(dto: UpdateProductDto, res: Response) {
    const { product_id, product_name, price, description, images } = dto;
    const updatedProd = await this.prisma.products.update({
      where: { id: product_id },
      data: { product_name, price, description, images },
    });
    return res.send({ message: 'Success', updatedProd }).status(200);
  }

  async scrapeProductAi(dto: { url: string }, res: Response) {
    const { url } = dto;
    const browser = await puppeteer.launch();
    try {
      const page = await browser.newPage();
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      );
      await page.setViewport({ width: 1280, height: 800 });

      page.setDefaultNavigationTimeout(2 * 60 * 1000);
      await Promise.all([page.waitForNavigation(), page.goto(url)]);
      const html = await page.evaluate(() => {
        const divs = document.querySelectorAll('div');
        return Array.from(divs).map((div) => div.innerHTML);
      });
      const jsonFormat = {
        product_title: '{{title of product}}',
        product_images: ['{{array of images}}'],
        price: '{{price}}',
        reviews: [
          { review: '{{review}}', name: '{{name of person who did review}}' },
        ],
        descriptions: ['{{array of product descriptions or information}}'],
      };
      const products = await this.openAi.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a scraper that extracts product details from websites. Return all responses in a valid JSON format. Use the following format: ${jsonFormat} \nIf any of these values are not present, please return them as null.
`,
          },
          {
            role: 'user',
            content: ` Here is the HTML content: ${html} \n Please extract and return the product title, images, price, descriptions, and reviews. If any of these values are not present in the HTML, please return them as null.`,
          },
        ],
        response_format: { type: 'json_object' },
      });

      if (!products.choices[0].message.content)
        return new BadRequestException('Html to large');
      return res
        .send({
          message: 'Success',
          product: products.choices[0].message.content,
        })
        .status(200);
    } catch (error) {
      console.log(error);
      return new BadRequestException(error);
    } finally {
      await browser.close();
    }
  }

  async addImageToProduct(dto: addImageDto, res: Response) {
    const { url, product_id } = dto;
    const product = await this.prisma.products.findUnique({
      where: { id: product_id },
    });
    if (!product) return new BadRequestException('Product does not exist');
    const updatedProduct = await this.prisma.products.update({
      where: { id: product_id },
      data: {
        images: [url, ...product.images],
      },
    });

    return res
      .send({ message: 'Success', product: updatedProduct })
      .status(200);
  }
}
