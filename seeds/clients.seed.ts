import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';
import { Client } from '@modules/clients/entities/client.entity';
import { IdDocumentType, ClientStatus } from '@shared/enums/client.enum';

const logger = new Logger('ClientsSeed');

const FIRST_NAMES_M = ['Amadou', 'Issouf', 'Jean', 'Blaise', 'Pierre', 'Kofi', 'Moussa', 'Soro', 'Thomas', 'Souleymane'];
const FIRST_NAMES_F = ['Fatima', 'Aminata', 'Marie', 'Rose', 'Adama', 'Bintou', 'Claire', 'Yasmine', 'Esther', 'Lassina'];
const LAST_NAMES = ['Kone', 'Ouedraogo', 'Kabore', 'Sawadogo', 'Sanou', 'Some', 'Zongo', 'Nikiema', 'Dao', 'Belemtigri', 'Bambara', 'Koulibaly', 'Diallo', 'Tall', 'Compaore'];
const CITIES = ['Ouagadougou', 'Bobo-Dioulasso', 'Koudougou', 'Ouahigouya', 'Banfora', 'Manga', 'Ziniare', 'Tenkodogo', 'Fada N\'Gourma', 'Gorom-Gorom'];
const REGIONS = ['Centre', 'Hauts-Bassins', 'Centre-Ouest', 'Nord', 'Cascades', 'Centre-Sud', 'Plateau-Central', 'Centre-Est', 'Est', 'Sahel'];

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

export async function seedClients(dataSource: DataSource): Promise<string[]> {
  const clientRepo = dataSource.getRepository(Client);
  const clientIds: string[] = [];

  for (let i = 0; i < 50; i++) {
    const isMale = i % 2 === 0;
    const firstNames = isMale ? FIRST_NAMES_M : FIRST_NAMES_F;
    const fnIdx = Math.floor(seededRandom(i + 1) * firstNames.length);
    const lnIdx = Math.floor(seededRandom(i + 100) * LAST_NAMES.length);
    const cityIdx = Math.floor(seededRandom(i + 200) * CITIES.length);
    const regionIdx = Math.floor(seededRandom(i + 300) * REGIONS.length);

    const firstName = firstNames[fnIdx];
    const lastName = LAST_NAMES[lnIdx];
    const city = CITIES[cityIdx];
    const region = REGIONS[regionIdx];
    const docTypes = [IdDocumentType.CNI, IdDocumentType.PASSPORT, IdDocumentType.PERMIS_CONDUIRE];
    const docType = docTypes[i % 3];

    const existing = await clientRepo.findOne({
      where: { idDocumentNumber: `ID-${2024}-${String(i + 1).padStart(4, '0')}` },
    });

    if (!existing) {
      const client = clientRepo.create({
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        idDocumentType: docType,
        idDocumentNumber: `ID-${2024}-${String(i + 1).padStart(4, '0')}`,
        phone: `+226 ${70 + (i % 10)} ${String(Math.floor(seededRandom(i + 400) * 99)).padStart(2, '0')} ${String(Math.floor(seededRandom(i + 500) * 99)).padStart(2, '0')}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i + 1}@email.bf`,
        addressLine1: `${Math.floor(seededRandom(i + 600) * 999) + 1} Rue ${lastName}`,
        city,
        region,
        status: ClientStatus.KYC_VERIFIED,
        kycVerifiedAt: new Date(Date.now() - Math.floor(seededRandom(i + 700) * 180) * 86400000),
        kycRiskLevel: i < 40 ? 'LOW' : i < 47 ? 'MEDIUM' : 'HIGH',
        biometricEnrolled: i % 5 !== 0,
        registeredByActorId: i < 25 ? '00000000-0000-0000-0000-000000000001' : '00000000-0000-0000-0000-000000000002',
        metadata: {
          seedIndex: i + 1,
          nationality: 'Burkinabe',
          birthDate: `${1980 + (i % 25)}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
        },
      });

      const saved = await clientRepo.save(client);
      clientIds.push(saved.id);
    } else {
      clientIds.push(existing.id);
    }
  }

  logger.log(`Clients seed completed (${clientIds.length} clients)`);
  return clientIds;
}
