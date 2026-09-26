import { StorageStrategy } from '../../core/interfaces/storage-strategy.interface';
import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';
import { ConfigService } from '../../config/config.service';

@Injectable()
export class S3StorageStrategy implements StorageStrategy {
  readonly deliveryMode = 'REDIRECT' as const;
  private readonly logger = new Logger(S3StorageStrategy.name);

  constructor(private readonly configService: ConfigService) {}

  private async getClient(context?: any): Promise<{ client: S3Client; bucketName: string }> {
    const accessKeyId = await this.configService.get('aws_access_key_id', context);
    const secretAccessKey = await this.configService.get('aws_secret_access_key', context);
    const region = await this.configService.get('aws_region', context, 'us-east-1');
    const bucketName = await this.configService.get('aws_bucket_name', context);
    const endpoint = await this.configService.get('aws_endpoint', context, '');

    const client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      endpoint: endpoint || undefined,
      forcePathStyle: !!endpoint,
    });

    return { client, bucketName };
  }

  async uploadFile(file: Buffer, path: string, mimeType: string, context?: any): Promise<string> {
    try {
      const { client, bucketName } = await this.getClient(context);
      await client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: path,
          Body: file,
          ContentType: mimeType,
        })
      );
      return path;
    } catch (err: any) {
      this.logger.error(`Failed to upload to S3: ${err.message}`);
      throw err;
    }
  }

  async getSignedUrl(path: string, expirySeconds = 3600, context?: any): Promise<string> {
    try {
      const { client, bucketName } = await this.getClient(context);
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: path,
      });
      return await getSignedUrl(client, command, { expiresIn: expirySeconds });
    } catch (err: any) {
      this.logger.error(`Failed to get S3 signed URL: ${err.message}`);
      throw err;
    }
  }

  async downloadStream(path: string, context?: any): Promise<Readable> {
    try {
      const { client, bucketName } = await this.getClient(context);
      const response = await client.send(
        new GetObjectCommand({
          Bucket: bucketName,
          Key: path,
        })
      );
      return response.Body as Readable;
    } catch (err: any) {
      this.logger.error(`Failed to download S3 stream: ${err.message}`);
      throw err;
    }
  }
}
