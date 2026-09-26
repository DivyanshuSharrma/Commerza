import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageFactory } from '../../providers/storage/storage.factory';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { RequirePermissions } from '../auth/permissions.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { BusinessException } from '../../common/exceptions/custom.exceptions';
import * as crypto from 'crypto';
import * as path from 'path';

@ApiTags('uploads')
@Controller('uploads')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UploadsController {
  private readonly logger = new Logger(UploadsController.name);

  constructor(private readonly storageFactory: StorageFactory) {}

  @Post('public')
  @RequirePermissions('product:create')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a public digital asset or image' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
  }))
  async uploadPublicFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BusinessException('No file uploaded.', HttpStatus.BAD_REQUEST);
    }

    this.logger.log(
      `[Upload Public] File received: name=${file.originalname}, size=${file.size}, mime=${file.mimetype}`,
    );

    // Validate MIME type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BusinessException('Invalid file type. Only JPEG, PNG, GIF, and WEBP images are allowed.', HttpStatus.BAD_REQUEST);
    }

    return this.processUpload(file, 'public');
  }

  @Post('private')
  @RequirePermissions('product:create')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a private downloadable product file' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB
  }))
  async uploadPrivateFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BusinessException('No file uploaded.', HttpStatus.BAD_REQUEST);
    }

    this.logger.log(
      `[Upload Private] File received: name=${file.originalname}, size=${file.size}, mime=${file.mimetype}`,
    );

    // Validate MIME type for private files
    const allowedMimeTypes = [
      'application/zip',
      'application/x-zip-compressed',
      'application/x-rar-compressed',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/epub+zip',
      'audio/mpeg',
      'video/mp4',
      'image/jpeg',
      'image/png',
      'image/webp'
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BusinessException('Unsupported file format.', HttpStatus.BAD_REQUEST);
    }

    return this.processUpload(file, 'private');
  }

  private async processUpload(file: Express.Multer.File, visibility: 'public' | 'private') {
    // Generate SHA-256 checksum for integrity verification
    const checksum = crypto
      .createHash('sha256')
      .update(file.buffer)
      .digest('hex');

    // Generate a unique, safe file path
    const extension = path.extname(file.originalname).toLowerCase();
    const randomName = crypto.randomBytes(16).toString('hex');
    const relativePath = `${visibility}/files/${randomName}${extension}`;

    try {
      const strategy = await this.storageFactory.getStrategy();
      const savedPath = await strategy.uploadFile(
        file.buffer,
        relativePath,
        file.mimetype,
      );

      this.logger.log(`[Upload Success] Stored at: ${savedPath} (${visibility})`);

      return {
        filePath: savedPath,
        originalName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        checksum,
      };
    } catch (err: any) {
      this.logger.error(`[Upload Failed] ${err.message}`);
      throw new BusinessException(
        `Upload failed: ${err.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
