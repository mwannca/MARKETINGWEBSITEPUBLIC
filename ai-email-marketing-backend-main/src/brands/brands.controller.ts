import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AddLogoDto, ScrapeBrands, UpdateBrandsDto } from './dto/brands.dto';
import { Response } from 'express';
import { BrandsService } from './brands.service';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Brands')
@ApiBearerAuth()
@Controller('brands')
export class BrandsController {
  constructor(private brandsService: BrandsService) {}

  @Post('scrapeBrand')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Scrape brand information from a source' })
  @ApiResponse({
    status: 200,
    description: 'Brand information scraped successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getLogo(@Body() dto: ScrapeBrands, @Req() req, @Res() res: Response) {
    const userId = req.user.sub;
    return this.brandsService.scrapeForBranding(dto, res, userId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Delete a brand by ID' })
  @ApiResponse({ status: 200, description: 'Brand deleted successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async deleteBrand(
    @Param('id') brandId: string,
    @Req() req,
    @Res() res: Response,
  ) {
    const userId = req.user.sub; // Ensure that the user ID is available from the JWT
    return await this.brandsService.deleteBrand(brandId, userId, res);
  }

  @Get('getBrands')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get all brands for a user' })
  @ApiResponse({ status: 200, description: 'Brands retrieved successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getBrands(@Req() req, @Res() res: Response) {
    const userId = req.user.sub;
    return this.brandsService.getBrands(userId, res);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get a specific brand by ID' })
  @ApiResponse({ status: 200, description: 'Brand retrieved successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getBrandById(@Param() params, @Req() req, @Res() res: Response) {
    const brandId = params.id;
    const userId = req.user.sub;
    return this.brandsService.getBrandById(userId, brandId, res);
  }

  @Post('addLogo')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Add a logo to a brand' })
  @ApiResponse({ status: 201, description: 'Logo added successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  addLogo(@Body() dto: AddLogoDto, @Req() req, @Res() res: Response) {
    const userId = req.user.sub;
    return this.brandsService.addLogo(dto, userId, res);
  }

  @Post('updateBrand')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update brand details' })
  @ApiResponse({ status: 200, description: 'Brand updated successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  updateBrand(@Body() dto: UpdateBrandsDto, @Req() req, @Res() res: Response) {
    const userId = req.user.sub;
    return this.brandsService.updateBrands(dto, userId, res);
  }
}
