import { Injectable, Logger } from '@nestjs/common';

export type SupportedLocale = 'fr_BF' | 'mos_BF' | 'dyu_BF' | 'fuv_BF';

export const DEFAULT_LOCALE: SupportedLocale = 'fr_BF';

@Injectable()
export class I18nService {
  private readonly logger = new Logger(I18nService.name);

  private translations: Record<SupportedLocale, Record<string, string>> = {
    fr_BF: {
      'auth.login.success': 'Connexion réussie',
      'auth.login.failed': 'Email ou mot de passe incorrect',
      'auth.logout.success': 'Déconnexion réussie',
      'auth.mfa.required': 'Vérification MFA requise',
      'auth.mfa.invalid': 'Code MFA invalide',
      'actor.created': 'Acteur créé avec succès',
      'actor.updated': 'Acteur mis à jour',
      'actor.not_found': 'Acteur non trouvé',
      'vehicle.created': 'Véhicule enregistré',
      'vehicle.blacklisted': 'Véhicule sur liste noire',
      'sale.created': 'Vente enregistrée',
      'invoice.generated': 'Facture générée',
      'compliance.score_updated': 'Score de conformité mis à jour',
      'report.generated': 'Rapport généré',
      'report.submitted': 'Rapport soumis',
      'security.alert_created': 'Alerte de sécurité créée',
      'security.cnti_reported': 'Signalement CNTI effectué',
      'error.internal': 'Une erreur interne est survenue',
      'error.validation': 'Données invalides',
      'error.forbidden': 'Accès refusé',
      'error.not_found': 'Ressource non trouvée',
      'pagination.showing': 'Affichage de {from} à {to} sur {total}',
      'common.save': 'Enregistrer',
      'common.cancel': 'Annuler',
      'common.delete': 'Supprimer',
      'common.edit': 'Modifier',
      'common.search': 'Rechercher',
      'common.filter': 'Filtrer',
      'common.export': 'Exporter',
    },
    mos_BF: {
      'auth.login.success': 'Kẽn-toor yɑɑgɑ',
      'auth.login.failed': 'Bãnga wɑ ne sebẽ kɑ sebẽ',
      'auth.logout.success': 'Kẽn-tũu yɑɑgɑ',
      'auth.mfa.required': 'MFA wɑɑtɑ',
      'auth.mfa.invalid': 'MFA tõe n yɑɑgɑ',
      'actor.created': 'Bãngrẽ na n lebs',
      'actor.updated': 'Bãngrẽ na n lebg',
      'vehicle.created': 'Sɑ̃as-noor na n lebs',
      'sale.created': 'Soam-noor na n lebs',
      'error.internal': 'B sɑn n pĩigɑ',
      'error.validation': 'Tɑɑtẽ wɑ tɩ bɑ',
      'error.forbidden': 'Kẽn wɑ tɩ sebẽ',
      'common.save': 'Lebs',
      'common.cancel': 'Aol',
      'common.delete': 'Sẽn',
      'common.edit': 'Chaas',
      'common.search': 'Yãmb',
    },
    dyu_BF: {
      'auth.login.success': 'A bɛ kɛnɛ',  
      'auth.login.failed': 'I bɛ dugula tɛ',
      'auth.logout.success': 'A bɛ taa',
      'actor.created': 'Dugukolo bɛ da',
      'vehicle.created': 'Mɔtɔ bɛ da',
      'sale.created': 'Cɛ bɛ da',
      'error.internal': 'Kɛrɛnkɛrɛnnen don',
      'common.save': 'Ka mara',
      'common.cancel': 'Ka boli',
    },
    fuv_BF: {
      'auth.login.success': 'A yahii',
      'auth.login.failed': 'Huutora mo anndaa',
      'actor.created': 'Jeyɗo dahaa',
      'vehicle.created': 'Keɓe dahaa',
      'sale.created': 'Sellanke dahaa',
      'error.internal': 'Juutde woodi',
      'common.save': 'Danndu',
      'common.cancel': 'Darta',
    },
  };

  translate(key: string, locale: SupportedLocale = DEFAULT_LOCALE, params?: Record<string, string>): string {
    const translations = this.translations[locale] || this.translations[DEFAULT_LOCALE];
    let text = translations[key] || key;

    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{{${k}}}`, v);
      });
    }

    return text;
  }

  getTranslations(locale: SupportedLocale = DEFAULT_LOCALE): Record<string, string> {
    return this.translations[locale] || this.translations[DEFAULT_LOCALE];
  }

  getSupportedLocales(): SupportedLocale[] {
    return Object.keys(this.translations) as SupportedLocale[];
  }
}
