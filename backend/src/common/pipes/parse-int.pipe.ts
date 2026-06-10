import {
  PipeTransform, Injectable, BadRequestException,
} from '@nestjs/common';

@Injectable()
export class CustomParseIntPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    const val = parseInt(value, 10);
    if (isNaN(val)) throw new BadRequestException(`La valeur "${value}" n'est pas un nombre valide`);
    return val;
  }
}
