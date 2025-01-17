import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { GenerateEmailDto } from './dto/ai.dto';
import { Response } from 'express';
import * as descriptionTemplate from '../email-templates/template3.json';
import * as salesTemplate from '../email-templates/template3.json';
import { PrismaService } from 'src/prisma/prisma.service';
import { Brands, Products } from '@prisma/client';
import { compress, encodeBase64 } from 'lzutf8';
import { Colors, Fonts } from 'types/types';
import { StripeService } from '../stripe/stripe.service';

const templates = {
  salesTemplate: salesTemplate,
  descriptionTemplate: descriptionTemplate,
};

@Injectable()
export class AiService {
  private readonly openAi: OpenAI;

  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
  ) {
    this.openAi = new OpenAI({
      apiKey: process.env.OPEN_AI_KEY,
    });
  }

  async getTemplateName(prompt: string, designStyle: string) {
    const templateDescriptions = {
      salesTemplate: {
        name: 'salesTemplate',
        description: 'A template to showcase many items and get sales',
      },
      descriptionTemplate: {
        name: 'descriptionTemplate',
        description:
          'A template to showcase the item with a detailed description, suitable for selling one item.',
      },
    };

    const jsonFormat = {
      template_name: '{{name of template}}',
    };

    const templateList = Object.keys(templateDescriptions)
      .map(
        (key) =>
          `${templateDescriptions[key].name}: ${templateDescriptions[key].description}`,
      )
      .join(', ');

    const templateSelection = await this.openAi.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an email design specialist, and you respond in valid JSON format with this exact format: ${JSON.stringify(jsonFormat)}`,
        },
        {
          role: 'user',
          content: `Based on this prompt: "${prompt}" and the design style "${designStyle}", which email template should I use? Please select from the following templates and respond with the template name only.\n Templates: ${templateList}`,
        },
      ],
    });

    const templateName = JSON.parse(
      templateSelection.choices[0].message.content,
    );

    return templateName.template_name;
  }

  async writeCopy(
    userPrompt: string,
    brand: Brands,
    product: Products,
    template: any,
  ) {
    function extractPlaceholders(
      obj: any,
      placeholders: Set<string> = new Set(),
    ): Set<string> {
      const placeholderPattern = /{{(.*?)}}/g;

      function recursiveExtract(value: any) {
        if (typeof value === 'string') {
          let match;
          while ((match = placeholderPattern.exec(value)) !== null) {
            placeholders.add(match[1]);
          }
        } else if (typeof value === 'object' && value !== null) {
          for (const key in value) {
            if (value.hasOwnProperty(key)) {
              recursiveExtract(value[key]);
            }
          }
        }
      }

      recursiveExtract(obj);
      return placeholders;
    }

    const placeholders = extractPlaceholders(template);
    const arrayOfPlaceholders = Array.from(placeholders);

    const jsonSchema = {
      placeholders: arrayOfPlaceholders.reduce(
        (acc, placeholder) => {
          acc[placeholder] = `{{${placeholder}}}`;
          return acc;
        },
        {} as Record<string, string>,
      ),
    };

    // Ensure the URL does not contain any extra characters
    const selectedImage =
      product.images.length > 0
        ? product.images[0].replace(/[\s}]+$/, '') // Sanitize the URL to remove any trailing } or spaces
        : brand.logos[0].replace(/[\s}]+$/, ''); // Fallback to logo, sanitized as well

    const prompt = `prompt: ${userPrompt} \n 
    brand name: ${brand.brand_name} \n 
    product name: ${product.product_name} \n 
    product descriptions: ${product.description} \n 
    product price: ${product.price} \n 
    logos: ${brand.logos.join(', ')} \n
    images: ${product.images.join(', ')} \n
    The image selected for 'image_1' is: ${selectedImage} \n
    The output should include the following placeholders: ${arrayOfPlaceholders.join(', ')}.`;

    try {
      console.log('Selected image:', selectedImage);
      const copy = await this.openAi.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an email marketing specialist tasked with generating content for an email template. 
          The output should be a valid JSON object, with all placeholder values filled as per the schema: ${JSON.stringify(
            jsonSchema.placeholders,
          )}. Make sure to insert the image URLs where required in the template, especially 'image_1' and 'logo'.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      // Post-process AI response to ensure valid JSON
      let jsonObj = copy.choices[0].message.content;
      jsonObj = jsonObj.replace(/`/g, '"').trim();
      jsonObj = jsonObj
        .replace(/^[\s]*"""json\s*/, '')
        .replace(/[\s]*"""$/, '')
        .trim();

      const parsedContent = JSON.parse(jsonObj);

      function fillPlaceholders(template: any, content: any) {
        function replacePlaceholders(obj: any) {
          if (typeof obj === 'string') {
            // Match both double and triple curly braces and replace with the correct content
            return obj.replace(/\{\{\{?(.*?)\}?\}\}/g, (match, p1) => {
              const trimmedKey = p1.trim(); // Trim spaces around keys to avoid issues
              return content[trimmedKey] || match;  // Return the matched value or leave it unchanged if not found
            });
          } else if (Array.isArray(obj)) {
            return obj.map((item) => replacePlaceholders(item));
          } else if (typeof obj === 'object' && obj !== null) {
            const result: any = {};
            for (const key in obj) {
              if (obj.hasOwnProperty(key)) {
                result[key] = replacePlaceholders(obj[key]);
              }
            }
            return result;
          } else {
            return obj;
          }
        }

        return replacePlaceholders(template);
      }
      const filledTemplate = fillPlaceholders(template, {
        ...parsedContent,
        logo: brand.logos[0].replace(/[\s}]+$/, ''), // Sanitize the logo URL
        image_1: selectedImage, // Use the sanitized selected image
      });

      return JSON.stringify(filledTemplate, null, 2); // Return the final template with filled placeholders
    } catch (error) {
      console.error('Error generating email:', error);
      throw new Error(
        'Failed to generate email. Invalid JSON format returned.',
      );
    }
  }

  async preFillTemplate(brand: Brands, template: any) {
    const fonts = brand.fonts as unknown as Fonts;
    const colors = brand.colors as unknown as Colors;
    const preFill = {
      text_color: colors.textColor,
      button_color: colors.buttonColor,
      button_text_color: colors.textColor,
      background_color: colors.backgroundColor,
      font_header: fonts.primaryFont,
      font_text: fonts.secondaryFont,
    };
    return await this.fillPlaceholders(template, preFill);
  }

  async fillPlaceholders(template: any, content: any) {
    function replacePlaceholders(obj: any) {
      if (typeof obj === 'string') {
        // Replace placeholders with either double or triple curly braces
        return obj.replace(
          /\{\{\{(.*?)\}\}\}|\{\{(.*?)\}\}/g,
          (match, p1, p2) => {
            const key = p1 || p2; // Either match from triple or double curly braces
            return content[key] || match; // Replace with content if found, else leave as is
          },
        );
      } else if (Array.isArray(obj)) {
        return obj.map((item) => replacePlaceholders(item)); // Recursively replace in arrays
      } else if (typeof obj === 'object' && obj !== null) {
        const result: any = {};
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            result[key] = replacePlaceholders(obj[key]); // Recursively replace in objects
          }
        }
        return result;
      } else {
        return obj;
      }
    }

    const filledTemplate = replacePlaceholders(template);
    return JSON.stringify(filledTemplate, null, 2); // Return the filled template as a string
  }

  async compressTemplate(
    template: any,
    user_id: string,
    product: Products,
    sessionType: string,
  ) {
    const encodedTemplate = encodeBase64(compress(template));
    const date = new Date();

    const newSession = await this.prisma.editor.create({
      data: {
        session_name: product.product_name,
        user_id: user_id,
        brand_id: product.brand_id,
        product_id: product.id,
        email_saves: [
          {
            save: encodedTemplate,
            updated_at: `${date.toLocaleTimeString()}, ${date.toLocaleDateString()}`,
          },
        ],
        session_type: sessionType,
      },
    });

    return newSession;
  }

  async generateEmail(dto: GenerateEmailDto, user_id: string, res: Response) {
    const { prompt, brand_id, product_id, designStyle } = dto;

    try {
      // Step 1: Retrieve user's Stripe customer ID
      const user = await this.prisma.user.findUnique({
        where: { id: user_id },
      });

      if (!user || !user.stripeCustomerId) {
        return res
          .status(400)
          .send({ message: 'User or Stripe customer ID not found' });
      }
      const stripeCustomerId = user.stripeCustomerId;

      // Step 2: Retrieve user's active subscription
      const subscription =
        await this.stripeService.getActiveSubscription(stripeCustomerId);
      if (!subscription) {
        return res
          .status(400)
          .send({ message: 'No active subscription found' });
      }

      // Step 3: Get all products with prices and retrieve available credits from the metadata
      const productsWithPrices =
        await this.stripeService.getProductsWithPrices();
      const product = productsWithPrices.find(
        (prod) => prod.priceId === subscription.items.data[0].price.id,
      );
      const availableCredits =
        product.metadata.credits === 'Unlimited'
          ? Infinity
          : parseInt(product.metadata.credits, 10);

      // Step 4: Retrieve the number of editing sessions created via `generateEmail`
      const generatedSessionsCount = await this.prisma.editor.count({
        where: {
          user_id: user_id,
          session_type: 'generated', // Only count sessions created by `generateEmail`
        },
      });

      // Step 5: Check if the user has enough credits to generate an email
      if (generatedSessionsCount >= availableCredits) {
        return res.status(400).send({
          message:
            'Email generation limit reached. Upgrade your plan to generate more emails.',
        });
      }

      // Proceed to generate the email if the user has enough credits
      const brand = await this.prisma.brands.findUnique({
        where: { id: brand_id },
      });
      const productInDB = await this.prisma.products.findUnique({
        where: { id: product_id },
      });

      if (!brand || !productInDB) {
        return res.status(400).send({ message: 'Brand or product not found' });
      }

      const templateName = await this.getTemplateName(prompt, designStyle);
      const template = templates[templateName];
      const preFillTemplate = await this.preFillTemplate(brand, template);
      const templateJson = await this.writeCopy(
        prompt,
        brand,
        productInDB,
        preFillTemplate,
      );
      console.log('final template' + templateJson);
      // Use the updated compressTemplate method
      const newSession = await this.compressTemplate(
        templateJson,
        user_id,
        productInDB,
        'generated', // Specify that this session was generated via `generateEmail`
      );

      return res.send({ message: 'Success', newSession }).status(200);
    } catch (error) {
      console.error('Error generating email:', error);
      return res
        .status(500)
        .send({ message: 'Failed to generate email', error });
    }
  }
}
