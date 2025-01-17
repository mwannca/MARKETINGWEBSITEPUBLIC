import {
  Controller,
  Delete,
  Param,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AwsService } from './aws.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('AWS')
@ApiBearerAuth()
@Controller('aws')
export class AwsController {
  constructor(private awsService: AwsService) {}

  @Post('uploadToS3')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a file to AWS S3' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File to upload',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
    @Res() res: Response,
  ) {
    try {
      const userId = req.user.sub; // Assuming user ID is in req.user.sub from AuthGuard
      const fileUrl = await this.awsService.uploadFile(file, userId);
      return res
        .status(201)
        .json({ message: 'File uploaded successfully', url: fileUrl });
    } catch (error) {
      return res
        .status(500)
        .json({ message: 'File upload failed', error: error.message });
    }
  }

  @Delete('deleteFile/:fileName')
  @UseGuards(AuthGuard) // Ensures the user is authenticated
  @ApiOperation({ summary: 'Delete a file from AWS S3' })
  @ApiResponse({
    status: 200,
    description: 'File deleted successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async deleteFile(
    @Param('fileName') fileName: string, // File name to delete
    @Req() req, // Request to get user data
    @Res() res: Response, // Response to send success/failure messages
  ) {
    const userId = req.user.sub; // Retrieve the user ID from the authenticated request

    try {
      // Call the service to delete the file from S3
      await this.awsService.deleteFile(userId, fileName);

      // Return success response
      return res.status(200).send({
        message: `File ${fileName} deleted successfully.`,
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      return res.status(500).send({ message: 'File deletion failed' });
    }
  }
}
