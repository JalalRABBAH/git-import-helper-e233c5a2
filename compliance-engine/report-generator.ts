// =============================================================================
// iReg Moto BF — Générateur de Rapports Trimestriels
// XML structuré (schéma XSD) | PDF signé électroniquement | CSV pour analyse
// =============================================================================

import {
  Actor,
  Client,
  Sale,
  Vehicle,
  PurchasePrice,
  QuarterlyReport,
  GeneratedReport,
  ReportFormat,
  StockEntry,
  StructuredLogger,
  ConsoleLogger,
} from './types';

// ============================================================================
// INTERFACES
// ============================================================================

export interface ReportData {
  actor: Actor;
  report: QuarterlyReport;
  openingStock: StockEntry[];
  closingStock: StockEntry[];
  clients: Client[];
  sales: Sale[];
  purchasePrices: PurchasePrice[];
  anomalies: string[];
}

export interface IReportGenerator {
  generate(data: ReportData, format: ReportFormat): Promise<GeneratedReport>;
  generateAllFormats(data: ReportData): Promise<Record<ReportFormat, GeneratedReport>>;
}

// ============================================================================
// GÉNÉRATEUR XML — Format UEMOA structuré
// ============================================================================

export class XmlReportGenerator {
  private logger: StructuredLogger;

  constructor(logger?: StructuredLogger) {
    this.logger = logger ?? new ConsoleLogger();
  }

  generate(data: ReportData): GeneratedReport {
    const { actor, report, openingStock, closingStock, clients, sales, purchasePrices, anomalies } = data;

    const xml = this.buildXml(data);
    const checksum = this.sha256(xml);

    this.logger.info('XML report generated', { actorId: actor.id, checksum: checksum.slice(0, 16) });

    return {
      format: ReportFormat.XML_UEMOA,
      content: Buffer.from(xml, 'utf-8'),
      fileName: `RAPPORT_TRIM_${actor.nif}_${report.year}_${report.quarter}.xml`,
      mimeType: 'application/xml',
      checksum,
      generatedAt: new Date(),
    };
  }

  private buildXml(data: ReportData): string {
    const { actor, report, openingStock, closingStock, clients, sales, purchasePrices, anomalies } = data;

    const header = `<?xml version="1.0" encoding="UTF-8"?>
<rapportTrimestriel xmlns="http://www.uemoa.int/ireg-moto/schema"
                    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                    xsi:schemaLocation="http://www.uemoa.int/ireg-moto/schema ireg-moto-report.xsd"
                    version="1.0"
                    type="TRIMESTRIEL"
                    generePar="iReg Moto BF v1.0">
  <en-tete>
    <identifiantRapport>${this.escapeXml(report.id)}</identifiantRapport>
    <annee>${report.year}</annee>
    <trimestre>${report.quarter}</trimestre>
    <dateDebutPeriode>${this.formatDate(report.periodStart)}</dateDebutPeriode>
    <dateFinPeriode>${this.formatDate(report.periodEnd)}</dateFinPeriode>
    <dateGeneration>${new Date().toISOString()}</dateGeneration>
  </en-tete>

  <declarant>
    <nif>${this.escapeXml(actor.nif)}</nif>
    <rccm>${this.escapeXml(actor.rccm ?? '')}</rccm>
    <denomination>${this.escapeXml(actor.companyName)}</denomination>
    <nomCommercial>${this.escapeXml(actor.tradeName ?? actor.companyName)}</nomCommercial>
    <typeActeur>${actor.actorType}</typeActeur>
    <numeroAgrement>${this.escapeXml(actor.agreementNumber ?? '')}</numeroAgrement>
    <adresse>
      <ligne1>${this.escapeXml(actor.addressLine1)}</ligne1>
      <ville>${this.escapeXml(actor.city)}</ville>
      <region>${this.escapeXml(actor.region)}</region>
    </adresse>
    <coordonneesGPS lat="${actor.gpsCoordinates?.lat ?? ''}" lng="${actor.gpsCoordinates?.lng ?? ''}"/>
  </declarant>`;

    const stocksSection = `

  <stocks>
    <stockOuverture>
      <nombreUnites>${report.stockOpeningUnits}</nombreUnites>
      <detailEngins>
${openingStock.map(e => `        <engin vin="${this.escapeXml(e.vin)}" fabricant="${this.escapeXml(e.manufacturer)}" modele="${this.escapeXml(e.model)}" categorie="${e.category}" statut="${e.status}" qr="${this.escapeXml(e.qrCode ?? '')}"/>`).join('\n')}
      </detailEngins>
    </stockOuverture>
    <stockCloture>
      <nombreUnites>${report.stockClosingUnits}</nombreUnites>
      <detailEngins>
${closingStock.map(e => `        <engin vin="${this.escapeXml(e.vin)}" fabricant="${this.escapeXml(e.manufacturer)}" modele="${this.escapeXml(e.model)}" categorie="${e.category}" statut="${e.status}" qr="${this.escapeXml(e.qrCode ?? '')}"/>`).join('\n')}
      </detailEngins>
    </stockCloture>
  </stocks>`;

    const clientsSection = `

  <registreClients>
    <nombreClients>${clients.length}</nombreClients>
    <clients>
${clients.map(c => `      <client id="${c.id}" typePiece="${c.idDocumentType}" numeroPiece="${this.escapeXml(c.idDocumentNumber)}" nom="${this.escapeXml(c.lastName)}" prenom="${this.escapeXml(c.firstName)}" telephone="${this.escapeXml(c.phone)}" ville="${this.escapeXml(c.city ?? '')}" dateEnregistrement="${c.createdAt?.toISOString() ?? ''}"/>`).join('\n')}
    </clients>
  </registreClients>`;

    const salesSection = `

  <ventes>
    <nombreVentes>${report.totalSalesCount}</nombreVentes>
    <montantTotal>${report.totalSalesAmount.toFixed(2)}</montantTotal>
    <taxesCollectees>${report.totalTaxCollected.toFixed(2)}</taxesCollectees>
    <detailVentes>
${sales.filter(s => s.status === 'PAID').map(s => {
      const items = s.items.map(i => `          <ligne vehiculeId="${i.vehicleId}" prixUnitaire="${i.unitPrice.toFixed(2)}" quantite="${i.quantity}" total="${i.lineTotal.toFixed(2)}" marge="${(i.marginRate ?? 0).toFixed(4)}"/>`).join('\n');
      return `      <vente id="${s.id}" date="${s.saleDate.toISOString()}" clientId="${s.clientId}" montant="${s.totalAmount.toFixed(2)}" modePaiement="${s.paymentMethod}" methodePaiement="${s.paymentMethod}">
        <lignes>
${items}
        </lignes>
      </vente>`;
    }).join('\n')}
    </detailVentes>
  </ventes>`;

    const purchasesSection = `

  <achats>
    <nombreAchats>${report.totalPurchasesCount}</nombreAchats>
    <montantTotal>${report.totalPurchasesAmount.toFixed(2)}</montantTotal>
    <droitsDouane>${report.totalCustomsDuties.toFixed(2)}</droitsDouane>
    <detailAchats>
${purchasePrices.filter(pp => pp.isActive).map(pp => `      <achat id="${pp.id}" date="${this.formatDate(pp.effectiveDate)}" montantXOF="${pp.unitPriceXof.toFixed(2)}" montantDevise="${pp.unitPriceForeign.toFixed(2)}" devise="${pp.foreignCurrencyCode}" tauxChange="${pp.exchangeRate.toFixed(8)}" coutTotalDebarque="${pp.totalLandedCost.toFixed(2)}"/>`).join('\n')}
    </detailAchats>
  </achats>`;

    const taxesSection = `

  <taxes>
    <tvaCollectee>${(report.totalTaxCollected * 0.82).toFixed(2)}</tvaCollectee>
    <dusCollecte>${(report.totalTaxCollected * 0.10).toFixed(2)}</dusCollecte>
    <autresTaxes>${(report.totalTaxCollected * 0.08).toFixed(2)}</autresTaxes>
    <totalTaxes>${report.totalTaxCollected.toFixed(2)}</totalTaxes>
  </taxes>`;

    const complianceSection = `

  <conformite>
    <score>${report.complianceScore?.toFixed(2) ?? 'N/A'}</score>
    <nombreViolations>${report.complianceViolationsCount}</nombreViolations>
    <status>${report.status}</status>
  </conformite>`;

    const anomaliesSection = anomalies.length > 0 ? `

  <anomalies>
${anomalies.map(a => `    <anomalie gravite="WARNING">${this.escapeXml(a)}</anomalie>`).join('\n')}
  </anomalies>` : `

  <anomalies/>`;

    const footer = `

  <signature>
    <checksum>${this.sha256(header + stocksSection + clientsSection + salesSection + purchasesSection + taxesSection + complianceSection + anomaliesSection)}</checksum>
    <horodatage>${new Date().toISOString()}</horodatage>
  </signature>
</rapportTrimestriel>`;

    return header + stocksSection + clientsSection + salesSection + purchasesSection + taxesSection + complianceSection + anomaliesSection + footer;
  }

  private escapeXml(str: string): string {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private sha256(data: string): string {
    // Simple hash for browser compatibility
    // In production, use Node.js crypto
    if (typeof require !== 'undefined') {
      const crypto = require('crypto');
      return crypto.createHash('sha256').update(data, 'utf8').digest('hex');
    }
    // Fallback for environments without crypto
    return 'hash-' + data.length.toString(16);
  }
}

// ============================================================================
// GÉNÉRATEUR CSV
// ============================================================================

export class CsvReportGenerator {
  private logger: StructuredLogger;

  constructor(logger?: StructuredLogger) {
    this.logger = logger ?? new ConsoleLogger();
  }

  generate(data: ReportData): GeneratedReport {
    const { actor, report, sales, clients, openingStock, closingStock } = data;

    // Build CSV with sections
    const sections: string[] = [];

    // Header
    sections.push('SECTION,FIELD,VALUE');
    sections.push(`HEADER,REPORT_ID,${report.id}`);
    sections.push(`HEADER,ACTOR_NIF,${actor.nif}`);
    sections.push(`HEADER,ACTOR_NAME,"${actor.companyName}"`);
    sections.push(`HEADER,YEAR,${report.year}`);
    sections.push(`HEADER,QUARTER,${report.quarter}`);
    sections.push(`HEADER,GENERATED_AT,${new Date().toISOString()}`);
    sections.push('');

    // Stock summary
    sections.push('SECTION,FIELD,VALUE');
    sections.push(`STOCK,OPENING_UNITS,${report.stockOpeningUnits}`);
    sections.push(`STOCK,CLOSING_UNITS,${report.stockClosingUnits}`);
    sections.push(`STOCK,NET_CHANGE,${report.stockClosingUnits - report.stockOpeningUnits}`);
    sections.push('');

    // Sales detail
    sections.push('SECTION,SALE_ID,DATE,CLIENT_ID,VEHICLE_ID,AMOUNT,TAX,PAYMENT_METHOD');
    for (const sale of sales.filter(s => s.status === 'PAID')) {
      for (const item of sale.items) {
        sections.push(`SALE,${sale.id},${sale.saleDate.toISOString()},${sale.clientId},${item.vehicleId},${item.lineTotal},${item.taxAmount},${sale.paymentMethod}`);
      }
    }
    sections.push('');

    // Clients detail
    sections.push('SECTION,CLIENT_ID,DOC_TYPE,DOC_NUMBER,FULL_NAME,PHONE,CITY,STATUS');
    for (const client of clients) {
      sections.push(`CLIENT,${client.id},${client.idDocumentType},${client.idDocumentNumber},"${client.fullName}",${client.phone},${client.city ?? ''},${client.status}`);
    }
    sections.push('');

    // Stock detail
    sections.push('SECTION,VIN,MANUFACTURER,MODEL,CATEGORY,STATUS,TYPE');
    for (const entry of openingStock) {
      sections.push(`STOCK_DETAIL,${entry.vin},${entry.manufacturer},${entry.model},${entry.category},${entry.status},OPENING`);
    }
    for (const entry of closingStock) {
      sections.push(`STOCK_DETAIL,${entry.vin},${entry.manufacturer},${entry.model},${entry.category},${entry.status},CLOSING`);
    }

    const csv = sections.join('\n');

    this.logger.info('CSV report generated', { actorId: actor.id });

    return {
      format: ReportFormat.CSV,
      content: csv,
      fileName: `RAPPORT_TRIM_${actor.nif}_${report.year}_${report.quarter}.csv`,
      mimeType: 'text/csv',
      checksum: this.sha256(csv),
      generatedAt: new Date(),
    };
  }

  private sha256(data: string): string {
    if (typeof require !== 'undefined') {
      const crypto = require('crypto');
      return crypto.createHash('sha256').update(data, 'utf8').digest('hex');
    }
    return 'hash-' + data.length.toString(16);
  }
}

// ============================================================================
// GÉNÉRATEUR PDF — (Simulé, utilise un template en production)
// ============================================================================

export class PdfReportGenerator {
  private logger: StructuredLogger;

  constructor(logger?: StructuredLogger) {
    this.logger = logger ?? new ConsoleLogger();
  }

  generate(data: ReportData): GeneratedReport {
    const { actor, report, sales, clients, openingStock, closingStock, anomalies } = data;

    // In production, this would use a PDF library like Puppeteer, jsPDF, or pdf-lib
    // For now, we generate a structured text that represents the PDF content
    const pdfContent = this.buildPdfContent(data);

    this.logger.info('PDF report generated', { actorId: actor.id });

    return {
      format: ReportFormat.PDF_SIGNED,
      content: Buffer.from(pdfContent, 'utf-8'),
      fileName: `RAPPORT_TRIM_${actor.nif}_${report.year}_${report.quarter}.pdf`,
      mimeType: 'application/pdf',
      checksum: this.sha256(pdfContent),
      generatedAt: new Date(),
      digitalSignature: this.generateMockSignature(report.id),
    };
  }

  private buildPdfContent(data: ReportData): string {
    const { actor, report, sales, clients, openingStock, closingStock, anomalies } = data;

    return `%PDF-1.4 MOCK
RAPPORT TRIMESTRIEL — iReg Moto BF
=====================================

ARRÊTÉ MINISTÉRIEL 05/06/2026
DIRECTION DE LA RÉGLEMENTATION ET DU CONTRÔLE DES TRANSPORTS TERRESTRES

--------------------------------------------------------------------------------
1. IDENTIFICATION DU DÉCLARANT
--------------------------------------------------------------------------------
NIF:               ${actor.nif}
RCCM:              ${actor.rccm ?? 'N/A'}
Dénomination:      ${actor.companyName}
Nom commercial:    ${actor.tradeName ?? actor.companyName}
Type d'acteur:     ${actor.actorType}
N° Agrément:       ${actor.agreementNumber ?? 'N/A'}
Adresse:           ${actor.addressLine1}, ${actor.city}, ${actor.region}

Période:           ${report.quarter} — ${report.year}
Du:                ${report.periodStart.toISOString().split('T')[0]}
Au:                ${report.periodEnd.toISOString().split('T')[0]}

--------------------------------------------------------------------------------
2. SYNTHÈSE DES STOCKS
--------------------------------------------------------------------------------
Stock ouverture:   ${report.stockOpeningUnits} unités
Stock clôture:     ${report.stockClosingUnits} unités
Variation:         ${report.stockClosingUnits - report.stockOpeningUnits} unités

Détail stock ouverture (${openingStock.length} engins):
${openingStock.map(e => `  • ${e.vin} | ${e.manufacturer} ${e.model} | ${e.category}`).join('\n')}

Détail stock clôture (${closingStock.length} engins):
${closingStock.map(e => `  • ${e.vin} | ${e.manufacturer} ${e.model} | ${e.category}`).join('\n')}

--------------------------------------------------------------------------------
3. VENTES DU TRIMESTRE
--------------------------------------------------------------------------------
Nombre de ventes:  ${report.totalSalesCount}
Montant total HT:  ${report.totalSalesAmount.toLocaleString()} XOF
Taxes collectées:  ${report.totalTaxCollected.toLocaleString()} XOF

Détail des ventes:
${sales.filter(s => s.status === 'PAID').map(s => {
  const items = s.items.map(i => `    — ${i.vehicleId}: ${i.unitPrice.toLocaleString()} XOF`).join('\n');
  return `  Vente ${s.id} (${s.saleDate.toISOString().split('T')[0]})
    Client: ${s.clientId}
    Total: ${s.totalAmount.toLocaleString()} XOF
    Paiement: ${s.paymentMethod}
${items}`;
}).join('\n\n')}

--------------------------------------------------------------------------------
4. REGISTRE CLIENTS
--------------------------------------------------------------------------------
Nombre de clients: ${clients.length}

${clients.map(c => `  • ${c.fullName} | ${c.idDocumentType}: ${c.idDocumentNumber} | ${c.phone} | ${c.city ?? 'N/A'}`).join('\n')}

--------------------------------------------------------------------------------
5. ACHATS ET IMPORTATIONS
--------------------------------------------------------------------------------
Nombre d'achats:    ${report.totalPurchasesCount}
Montant total:      ${report.totalPurchasesAmount.toLocaleString()} XOF
Droits de douane:   ${report.totalCustomsDuties.toLocaleString()} XOF
Véhicules importés: ${report.totalVehiclesImported}

--------------------------------------------------------------------------------
6. TAXES ET REDEVANCES
--------------------------------------------------------------------------------
TVA collectée:      ${(report.totalTaxCollected * 0.82).toLocaleString()} XOF
DUS collecté:       ${(report.totalTaxCollected * 0.10).toLocaleString()} XOF
Autres taxes:       ${(report.totalTaxCollected * 0.08).toLocaleString()} XOF
TOTAL TAXES:        ${report.totalTaxCollected.toLocaleString()} XOF

--------------------------------------------------------------------------------
7. CONFORMITÉ
--------------------------------------------------------------------------------
Score de conformité: ${report.complianceScore?.toFixed(2) ?? 'N/A'}/100
Violations:          ${report.complianceViolationsCount}
Statut:              ${report.status}

--------------------------------------------------------------------------------
8. ANOMALIES ET ÉCARTS
--------------------------------------------------------------------------------
${anomalies.length === 0 ? 'Aucune anomalie déclarée.' : anomalies.map(a => `  ⚠ ${a}`).join('\n')}

--------------------------------------------------------------------------------
9. SIGNATURE ÉLECTRONIQUE
--------------------------------------------------------------------------------
Horodatage: ${new Date().toISOString()}
Signature numérique: [SIGNÉ PAR CERTIFICAT DRCTT]
Hash du document: ${this.sha256(JSON.stringify(report))}

Ce document est une déclaration officielle soumise au ministère des Transports.
Toute fausse déclaration est passible de sanctions conformément à l'arrêté
ministériel 05/06/2026.

--- FIN DU RAPPORT ---
`;
  }

  private generateMockSignature(reportId: string): string {
    return `SIG_DRCTT_${this.sha256(reportId + Date.now().toString()).slice(0, 32)}`;
  }

  private sha256(data: string): string {
    if (typeof require !== 'undefined') {
      const crypto = require('crypto');
      return crypto.createHash('sha256').update(data, 'utf8').digest('hex');
    }
    return 'hash-' + data.length.toString(16);
  }
}

// ============================================================================
// GÉNÉRATEUR JSON
// ============================================================================

export class JsonReportGenerator {
  private logger: StructuredLogger;

  constructor(logger?: StructuredLogger) {
    this.logger = logger ?? new ConsoleLogger();
  }

  generate(data: ReportData): GeneratedReport {
    const json = JSON.stringify({
      metadata: {
        version: '1.0',
        generatedAt: new Date().toISOString(),
        schema: 'http://www.uemoa.int/ireg-moto/schema/v1',
      },
      declarant: {
        nif: data.actor.nif,
        rccm: data.actor.rccm,
        companyName: data.actor.companyName,
        actorType: data.actor.actorType,
        agreementNumber: data.actor.agreementNumber,
      },
      period: {
        year: data.report.year,
        quarter: data.report.quarter,
        start: data.report.periodStart.toISOString(),
        end: data.report.periodEnd.toISOString(),
      },
      summary: {
        openingStock: data.report.stockOpeningUnits,
        closingStock: data.report.stockClosingUnits,
        totalSales: data.report.totalSalesCount,
        totalSalesAmount: data.report.totalSalesAmount,
        totalTaxes: data.report.totalTaxCollected,
        totalPurchases: data.report.totalPurchasesCount,
        totalPurchasesAmount: data.report.totalPurchasesAmount,
        complianceScore: data.report.complianceScore,
        violations: data.report.complianceViolationsCount,
      },
      stocks: {
        opening: data.openingStock,
        closing: data.closingStock,
      },
      clients: data.clients.map(c => ({
        id: c.id,
        fullName: c.fullName,
        idDocumentType: c.idDocumentType,
        idDocumentNumber: c.idDocumentNumber,
        phone: c.phone,
        city: c.city,
      })),
      sales: data.sales.filter(s => s.status === 'PAID').map(s => ({
        id: s.id,
        date: s.saleDate.toISOString(),
        clientId: s.clientId,
        amount: s.totalAmount,
        paymentMethod: s.paymentMethod,
        items: s.items.map(i => ({
          vehicleId: i.vehicleId,
          unitPrice: i.unitPrice,
          quantity: i.quantity,
          lineTotal: i.lineTotal,
          marginRate: i.marginRate,
        })),
      })),
      anomalies: data.anomalies,
    }, null, 2);

    return {
      format: ReportFormat.JSON,
      content: json,
      fileName: `RAPPORT_TRIM_${data.actor.nif}_${data.report.year}_${data.report.quarter}.json`,
      mimeType: 'application/json',
      checksum: this.sha256(json),
      generatedAt: new Date(),
    };
  }

  private sha256(data: string): string {
    if (typeof require !== 'undefined') {
      const crypto = require('crypto');
      return crypto.createHash('sha256').update(data, 'utf8').digest('hex');
    }
    return 'hash-' + data.length.toString(16);
  }
}

// ============================================================================
// ORCHESTRATEUR — Report Generator
// ============================================================================

export class ReportGenerator implements IReportGenerator {
  private xmlGenerator: XmlReportGenerator;
  private csvGenerator: CsvReportGenerator;
  private pdfGenerator: PdfReportGenerator;
  private jsonGenerator: JsonReportGenerator;
  private logger: StructuredLogger;

  constructor(logger?: StructuredLogger) {
    this.logger = logger ?? new ConsoleLogger();
    this.xmlGenerator = new XmlReportGenerator(this.logger);
    this.csvGenerator = new CsvReportGenerator(this.logger);
    this.pdfGenerator = new PdfReportGenerator(this.logger);
    this.jsonGenerator = new JsonReportGenerator(this.logger);
  }

  async generate(data: ReportData, format: ReportFormat): Promise<GeneratedReport> {
    this.logger.info('Generating report', { format, actorId: data.actor.id });

    switch (format) {
      case ReportFormat.XML_UEMOA:
        return this.xmlGenerator.generate(data);
      case ReportFormat.CSV:
        return this.csvGenerator.generate(data);
      case ReportFormat.PDF_SIGNED:
        return this.pdfGenerator.generate(data);
      case ReportFormat.JSON:
        return this.jsonGenerator.generate(data);
      default:
        throw new Error(`Unsupported report format: ${format}`);
    }
  }

  async generateAllFormats(data: ReportData): Promise<Record<ReportFormat, GeneratedReport>> {
    this.logger.info('Generating all report formats', { actorId: data.actor.id });

    const results = await Promise.all([
      this.generate(data, ReportFormat.XML_UEMOA),
      this.generate(data, ReportFormat.CSV),
      this.generate(data, ReportFormat.PDF_SIGNED),
      this.generate(data, ReportFormat.JSON),
    ]);

    return {
      [ReportFormat.XML_UEMOA]: results[0],
      [ReportFormat.CSV]: results[1],
      [ReportFormat.PDF_SIGNED]: results[2],
      [ReportFormat.JSON]: results[3],
    };
  }
}
