import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { I18nService, DEFAULT_LOCALE, SupportedLocale } from './i18n.service';
import { AuthJwtGuard } from '@modules/auth/guards/jwt-auth.guard';
import { Public } from '@common/decorators/public.decorator';

@ApiTags('I18n')
@Controller('i18n')
export class I18nController {
  constructor(private readonly i18nService: I18nService) {}

  @Get('translations')
  @Public()
  @ApiOperation({ summary: 'Obtenir les traductions' })
  async getTranslations(@Query('locale') locale?: string): Promise<Record<string, string>> {
    return this.i18nService.getTranslations((locale || DEFAULT_LOCALE) as SupportedLocale);
  }

  @Get('locales')
  @Public()
  @ApiOperation({ summary: 'Langues supportées' })
  async getSupportedLocales(): Promise<string[]> {
    return this.i18nService.getSupportedLocales();
  }

  @Get('translate/:key')
  @Public()
  @ApiOperation({ summary: 'Traduire une clé' })
  async translate(
    @Param('key') key: string,
    @Query('locale') locale?: string,
  ): Promise<{ key: string; translation: string }> {
    return {
      key,
      translation: this.i18nService.translate(key, (locale || DEFAULT_LOCALE) as SupportedLocale),
    };
  }
}
