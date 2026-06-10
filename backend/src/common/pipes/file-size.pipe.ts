import {
  PipeTransform, Injectable, BadRequestException,
} from '@nestjs/common';

export interface FileSizeOptions {
  maxSizeBytes: number;
  allowedTypes?: string[];
}

@Injectable()
export class FileSizePipe implements PipeTransform {
  constructor(private options: FileSizeOptions) {}

  transform(file: Express.Multer.File): Express.Multer.File {
    if (!file) throw new BadRequestException('Aucun fichier fourni');

    if (file.size > this.options.maxSizeBytes) {
      throw new BadRequestException(
        `Fichier trop volumineux: ${file.size} octets (max: ${this.options.maxSizeBytes})`,
      );
    }

    if (this.options.allowedTypes && !this.options.allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Type de fichier non autorisé: ${file.mimetype}. Autorisés: ${this.options.allowedTypes.join(', ')}`,
      );
    }

    return file;
  }
}
