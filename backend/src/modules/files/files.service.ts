import {
  Injectable, BadRequestException, Logger, NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import * as crypto from 'crypto';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  private minioClient: Minio.Client;

  constructor(private configService: ConfigService) {
    const cfg = this.configService.get('minio');
    this.minioClient = new Minio.Client({
      endPoint: cfg.endPoint,
      port: cfg.port,
      useSSL: cfg.useSSL,
      accessKey: cfg.accessKey,
      secretKey: cfg.secretKey,
    });
  }

  async uploadFile(
    bucket: string,
    file: Express.Multer.File,
    folder: string = '',
  ): Promise<{ url: string; path: string; size: number; checksum: string }> {
    await this.ensureBucket(bucket);

    const ext = file.originalname.split('.').pop() || 'bin';
    const filename = `${folder}/${crypto.randomUUID()}.${ext}`;
    const checksum = crypto.createHash('sha256').update(file.buffer).digest('hex');

    await this.minioClient.putObject(bucket, filename, file.buffer, file.size, {
      'Content-Type': file.mimetype,
      'x-amz-meta-checksum': checksum,
      'x-amz-meta-originalname': file.originalname,
    });

    this.logger.log(`Uploaded: ${bucket}/${filename} (${file.size} bytes)`);

    return {
      url: await this.getPresignedUrl(bucket, filename),
      path: filename,
      size: file.size,
      checksum,
    };
  }

  async getPresignedUrl(bucket: string, path: string, expiry: number = 3600): Promise<string> {
    return this.minioClient.presignedGetObject(bucket, path, expiry);
  }

  async deleteFile(bucket: string, path: string): Promise<void> {
    await this.minioClient.removeObject(bucket, path);
    this.logger.log(`Deleted: ${bucket}/${path}`);
  }

  async validateFile(file: Express.Multer.File, options: { maxSize?: number; allowedTypes?: string[] } = {}): Promise<void> {
    const maxSize = options.maxSize || this.configService.get('minio.maxFileSize', 10485760);
    if (file.size > maxSize) {
      throw new BadRequestException(`Fichier trop volumineux: max ${maxSize / 1024 / 1024}MB`);
    }
    if (options.allowedTypes && !options.allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(`Type non autorisé: ${file.mimetype}`);
    }
  }

  private async ensureBucket(bucket: string): Promise<void> {
    const exists = await this.minioClient.bucketExists(bucket);
    if (!exists) {
      await this.minioClient.makeBucket(bucket, 'us-east-1');
      this.logger.log(`Bucket created: ${bucket}`);
    }
  }
}
