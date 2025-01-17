import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { EditorService } from './editor.service';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  addImageToAssetsDto,
  GetImageDto,
  ManualEditSessionDto,
  SaveSessionDto,
} from './dto/editor.dto';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Editor')
@ApiBearerAuth()
@Controller('editor')
export class EditorController {
  constructor(private editorService: EditorService) {}

  @Post('createManualSession')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Create a manual editing session' })
  @ApiResponse({
    status: 201,
    description: 'Editing session created successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  createManualSession(
    @Body() dto: ManualEditSessionDto,
    @Req() req,
    @Res() res: Response,
  ) {
    const userId = req.user.sub;
    return this.editorService.manualEditingSession(userId, dto, res);
  }

  @Get('getSession/:id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get a specific editing session by ID' })
  @ApiResponse({
    status: 200,
    description: 'Editing session retrieved successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getSession(@Param('id') id: string, @Res() res: Response) {
    return this.editorService.fetchEditingSession(id, res);
  }

  @Get('getUserSessions')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get all editing sessions for the user' })
  @ApiResponse({
    status: 200,
    description: 'User sessions retrieved successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getUserSessions(@Req() req, @Res() res: Response) {
    const userId = req.user.sub;
    return this.editorService.fetchAllEditingSessions(userId, res);
  }

  @Post('saveEmail')
  @UseGuards(AuthGuard) // Ensures the user is authenticated
  @ApiOperation({ summary: 'Save the current email edit session' })
  @ApiResponse({
    status: 201,
    description: 'Email session saved successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  saveEmail(@Body() dto: SaveSessionDto, @Req() req, @Res() res: Response) {
    // Pass the req object to the saveSession method to access the userId
    return this.editorService.saveSession(dto, req, res);
  }

  @Post('htmlToImage')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Convert HTML to an image' })
  @ApiResponse({ status: 200, description: 'Image generated successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getImage(@Body() dto: GetImageDto, @Res() res: Response) {
    return this.editorService.htmlToImage(dto, res);
  }

  @Get('assets/:id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get assets by session ID' })
  @ApiResponse({ status: 200, description: 'Assets retrieved successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getAssets(@Param('id') id: string, @Res() res: Response) {
    return this.editorService.getAssets(id, res);
  }

  @Post('addToAssets')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Add an image to assets' })
  @ApiResponse({
    status: 201,
    description: 'Image added to assets successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  addToImage(@Body() dto: addImageToAssetsDto, @Res() res: Response) {
    return this.editorService.addAssets(dto, res);
  }
}
