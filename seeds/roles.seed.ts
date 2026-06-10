import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';
import { Role } from '@modules/roles/entities/role.entity';

const logger = new Logger('RolesSeed');

export const TEST_ROLES = [
  { name: 'SUPER_ADMIN', label: 'Super Administrateur', description: 'Contrôle total de la plateforme', hierarchyLevel: 0, isSystemRole: true },
  { name: 'MINISTRY_INSPECTOR', label: 'Inspecteur Ministère', description: 'Inspection et contrôle des acteurs', hierarchyLevel: 1, isSystemRole: true },
  { name: 'MINISTRY_ANALYST', label: 'Analyste Ministère', description: 'Analyse des données et rapports', hierarchyLevel: 2, isSystemRole: true },
  { name: 'ENTERPRISE_ADMIN', label: 'Admin Entreprise', description: 'Gestion complète de l\'entreprise', hierarchyLevel: 3, isSystemRole: true },
  { name: 'ENTERPRISE_MANAGER', label: 'Manager Entreprise', description: 'Gestion opérationnelle', hierarchyLevel: 4, isSystemRole: false },
  { name: 'ENTERPRISE_SELLER', label: 'Vendeur', description: 'Vente et clientèle', hierarchyLevel: 5, isSystemRole: false },
  { name: 'ENTERPRISE_ACCOUNTANT', label: 'Comptable', description: 'Gestion comptable et facturation', hierarchyLevel: 5, isSystemRole: false },
  { name: 'AUDITOR', label: 'Auditeur Externe', description: 'Audit indépendant et vérification', hierarchyLevel: 2, isSystemRole: true },
  // Legacy roles
  { name: 'ADMIN_DRCTT', label: 'Admin DRCTT', description: 'Administration DRCTT', hierarchyLevel: 1, isSystemRole: true },
  { name: 'CONTROLEUR', label: 'Contrôleur', description: 'Contrôle sur le terrain', hierarchyLevel: 2, isSystemRole: false },
  { name: 'IMPORTATEUR', label: 'Importateur', description: 'Importation de véhicules', hierarchyLevel: 4, isSystemRole: false },
  { name: 'DISTRIBUTEUR', label: 'Distributeur', description: 'Distribution de véhicules', hierarchyLevel: 4, isSystemRole: false },
  { name: 'ASSEMBLEUR', label: 'Assembleur', description: 'Assemblage de véhicules', hierarchyLevel: 4, isSystemRole: false },
  { name: 'DETAILLANT', label: 'Détaillant', description: 'Vente au détail', hierarchyLevel: 5, isSystemRole: false },
  { name: 'AUDITEUR', label: 'Auditeur', description: 'Audit interne', hierarchyLevel: 3, isSystemRole: false },
  { name: 'CNTI_AGENT', label: 'Agent CNTI', description: 'Agent du CNTI', hierarchyLevel: 3, isSystemRole: false },
];

export async function seedRoles(dataSource: DataSource): Promise<void> {
  const roleRepo = dataSource.getRepository(Role);

  for (const roleData of TEST_ROLES) {
    const existing = await roleRepo.findOne({ where: { name: roleData.name } });
    if (!existing) {
      const role = roleRepo.create(roleData);
      await roleRepo.save(role);
      logger.log(`Role created: ${roleData.name}`);
    } else {
      logger.log(`Role already exists: ${roleData.name}`);
    }
  }

  logger.log(`Roles seed completed (${TEST_ROLES.length} roles)`);
}
