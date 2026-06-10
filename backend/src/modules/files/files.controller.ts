import {
  Controller, Post, Get, Delete, Param, Query, UseGuards, UseInterceptors, UploadedFile, Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody,
} from '@nestjs/swagger';
import { FilesService } from './files.service';
import { AuthJwtGuard } from '@modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';

@ApiTags('Fichiers')
@Controller('files')
@UseGuards(AuthJwtGuard, RolesGuard)
@ApiBearerAuth('BearerAuth')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Uploader un document' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        bucket: { type: 'string', default: 'ireg-kyc-documents' },
        folder: { type: 'string', default: 'uploads' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Fichier uploadé' })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('bucket') bucket: string = 'ireg-kyc-documents',
    @Query('folder') folder: string = 'uploads',
  ): Promise<any> {
    return this.filesService.uploadFile(bucket, file, folder);
  }

  @Get('download')
  @ApiOperation({ summary: 'URL signée de téléchargement' })
  async getDownloadUrl(
    @Query('bucket') bucket: string,
    @Query('path') path: string,
  ): Promise<{ url: string }> {
    const url = await this.filesService.getPresignedUrl(bucket, path);
    return { url };
  }

  @Delete(':bucket/:path(*)')
  @ApiOperation({ summary: 'Supprimer un fichier' })
  @ApiResponse({ status: 204 })
  async deleteFile(
    @Param('bucket') bucket: string,
    @Param('path') path: string,
  ): Promise<void> {
    return this.filesService.deleteFile(bucket, path);
  }
}
