import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';

@Injectable()
export class AwsService {
  private readonly s3Client = new S3Client({
    region: process.env.AWS_S3_REGION,
    credentials: {
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    },
  });

  async uploadFile(file: Express.Multer.File, userId: string): Promise<string> {
    try {
      // Upload the file to S3 using userId in the file path
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: 'app.brandmatchco.io',
          Key: `${userId}/${file.originalname}`, // Store file under userId folder
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );

      // Return the S3 URL
      return `https://app.brandmatchco.io.s3.amazonaws.com/${userId}/${file.originalname}`;
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw new Error('File upload failed');
    }
  }

  async uploadFileExport(
    userId: string, // Accept userId as a parameter
    filePath: string,
    fileName: string,
    contentType: 'image/png' | 'image/svg+xml',
  ) {
    try {
      const fileContent = fs.readFileSync(filePath);

      // Upload the file to S3 with the userId in the file path
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: 'app.brandmatchco.io',
          Key: `${userId}/${fileName}`, // Store file under userId folder
          Body: fileContent,
          ContentType: contentType,
        }),
      );

      // Return the URL including the userId in the path
      return `https://app.brandmatchco.io.s3.amazonaws.com/${userId}/${fileName}`;
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw new Error('File upload failed');
    }
  }

  async uploadFileSVGorImg(
    userId: string,
    fileContent: string | Buffer,
    fileName: string,
    contentType: 'image/png' | 'image/svg+xml',
  ) {
    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: 'app.brandmatchco.io',
          Key: `${userId}/${fileName}`, // Store file under userId folder
          Body: fileContent,
          ContentType: contentType,
        }),
      );

      return `https://app.brandmatchco.io.s3.amazonaws.com/${userId}/${fileName}`;
    } catch (error) {
      console.log(error);
    }
  }

  async deleteFile(userId: string, fileName: string): Promise<void> {
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: 'app.brandmatchco.io',
          Key: `${userId}/${fileName}`, // Specify the file to delete under userId folder
        }),
      );
      console.log(`File ${fileName} deleted successfully from user ${userId}`);
    } catch (error) {
      console.error('Error deleting file from S3:', error);
      throw new Error('File deletion failed');
    }
  }
}
