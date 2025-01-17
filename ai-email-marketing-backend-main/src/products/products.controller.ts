import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import {
  addImageDto,
  ScrapeProduct,
  UpdateProductDto,
} from './dto/products.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('Products')
@ApiBearerAuth()
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Post('scrapeProduct')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Scrape product details' })
  @ApiResponse({
    status: 200,
    description: 'Product details scraped successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  scrapeProduct(@Body() dto: ScrapeProduct, @Res() res) {
    return this.productsService.scrapeProduct(dto, res);
  }

  @Get('getProducts/:id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get products by user ID' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getProducts(@Param('id') id: string, @Res() res) {
    return this.productsService.getProducts(id, res);
  }

  @Get('getProductById/:id') // Ensure the route matches
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiResponse({ status: 200, description: 'Product retrieved successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  getProductById(@Param('id') id: string, @Res() res) {
    return this.productsService.getProductById(id, res);
  }
  @Patch('updateProduct')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update product details' })
  @ApiResponse({ status: 200, description: 'Product updated successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  updateProduct(@Body() dto: UpdateProductDto, @Res() res) {
    return this.productsService.updateProduct(dto, res);
  }

  @Post('addImage')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Add an image to a product' })
  @ApiResponse({ status: 200, description: 'Image added successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  addImage(@Body() dto: addImageDto, @Res() res) {
    return this.productsService.addImageToProduct(dto, res);
  }
}
