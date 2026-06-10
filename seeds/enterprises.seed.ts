import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';
import { Actor, Warehouse } from '@modules/actors/entities/actor.entity';
import { ActorStatus, AgreementStatus } from '@shared/enums/actor-type.enum';

const logger = new Logger('EnterprisesSeed');

export const TEST_ENTERPRISES = [
  {
    key: 'fasomoto',
    companyName: 'Faso Moto SARL',
    tradeName: 'Faso Moto',
    nif: 'IFU-2023012345678',
    rccm: 'RCCM-BF-2023-012345',
    legalRepresentativeName: 'Amadou Kone',
    legalRepresentativePhone: '+226 70 11 22 33',
    email: 'contact@fasomoto.bf',
    phone: '+226 20 30 40 50',
    addressLine1: 'Avenue de l\'Indépendance, secteur 10',
    city: 'Ouagadougou',
    region: 'Centre',
    agreementNumber: 'AGR-2023-001-FM',
    complianceScore: 94.5,
    warehouses: [
      { name: 'Entrepôt Principal Ouaga', code: 'FM-OUAGA-01', addressLine1: 'Zone industrielle, Rue des Métiers', city: 'Ouagadougou', region: 'Centre', isPrimary: true },
      { name: 'Dépôt Bobo', code: 'FM-BOBO-01', addressLine1: 'Avenue des Nations Unies', city: 'Bobo-Dioulasso', region: 'Hauts-Bassins', isPrimary: false },
    ],
  },
  {
    key: 'burkinawheels',
    companyName: 'Burkina Wheels SA',
    tradeName: 'Burkina Wheels',
    nif: 'IFU-2023987654321',
    rccm: 'RCCM-BF-2022-987654',
    legalRepresentativeName: 'Fatima Ouedraogo',
    legalRepresentativePhone: '+226 76 54 32 10',
    email: 'contact@burkinawheels.bf',
    phone: '+226 25 50 40 30',
    addressLine1: 'Boulevard Charles de Gaulle, secteur 25',
    city: 'Ouagadougou',
    region: 'Centre',
    agreementNumber: 'AGR-2022-002-BW',
    complianceScore: 87.2,
    warehouses: [
      { name: 'Centre Logistique Central', code: 'BW-CENTRAL-01', addressLine1: 'Zone industrielle Sud', city: 'Ouagadougou', region: 'Centre', isPrimary: true },
    ],
  },
  {
    key: 'motoexpress',
    companyName: 'Moto Express Distribution',
    tradeName: 'Moto Express',
    nif: 'IFU-2023456789012',
    rccm: 'RCCM-BF-2024-567890',
    legalRepresentativeName: 'Issouf Dembele',
    legalRepresentativePhone: '+226 78 90 12 34',
    email: 'contact@motoexpress.bf',
    phone: '+226 22 33 44 55',
    addressLine1: 'Rue du Commerce, secteur 5',
    city: 'Bobo-Dioulasso',
    region: 'Hauts-Bassins',
    agreementNumber: 'AGR-2024-003-MX',
    complianceScore: 78.9,
    warehouses: [
      { name: 'Stock Principal Bobo', code: 'MX-BOBO-01', addressLine1: 'Zone portuaire', city: 'Bobo-Dioulasso', region: 'Hauts-Bassins', isPrimary: true },
    ],
  },
];

export async function seedEnterprises(dataSource: DataSource): Promise<Map<string, string>> {
  const actorRepo = dataSource.getRepository(Actor);
  const warehouseRepo = dataSource.getRepository(Warehouse);
  const enterpriseMap = new Map<string, string>();

  for (const ent of TEST_ENTERPRISES) {
    let actor = await actorRepo.findOne({ where: { nif: ent.nif } });

    if (!actor) {
      actor = actorRepo.create({
        actorTypeId: '00000000-0000-0000-0000-000000000001',
        companyName: ent.companyName,
        tradeName: ent.tradeName,
        nif: ent.nif,
        rccm: ent.rccm,
        legalRepresentativeName: ent.legalRepresentativeName,
        legalRepresentativePhone: ent.legalRepresentativePhone,
        email: ent.email,
        phone: ent.phone,
        addressLine1: ent.addressLine1,
        city: ent.city,
        region: ent.region,
        status: ActorStatus.ACTIVE,
        agreementNumber: ent.agreementNumber,
        agreementStatus: AgreementStatus.APPROVED,
        complianceScore: ent.complianceScore,
        currencyCode: 'XOF',
      });
      actor = await actorRepo.save(actor);
      logger.log(`Enterprise created: ${ent.companyName} (${actor.id})`);

      // Create warehouses
      for (const wh of ent.warehouses) {
        const warehouse = warehouseRepo.create({
          actorId: actor.id,
          ...wh,
          isActive: true,
        });
        await warehouseRepo.save(warehouse);
        logger.log(`  Warehouse created: ${wh.name}`);
      }
    } else {
      logger.log(`Enterprise already exists: ${ent.companyName}`);
    }

    enterpriseMap.set(ent.key, actor.id);
  }

  logger.log(`Enterprises seed completed (${TEST_ENTERPRISES.length} enterprises)`);
  return enterpriseMap;
}
