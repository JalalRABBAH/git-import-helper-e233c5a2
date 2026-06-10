import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from '@modules/users/entities/user.entity';
import { Role } from '@modules/roles/entities/role.entity';
import { UserRoleAssignment } from '@modules/roles/entities/user-role-assignment.entity';

const logger = new Logger('UsersSeed');

export interface UserSeedEntry {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  enterpriseKey?: string;
  password: string;
}

export const TEST_USERS: UserSeedEntry[] = [
  { email: 'superadmin@iregmoto.gov.bf', firstName: 'Super', lastName: 'Admin', role: 'SUPER_ADMIN', password: 'Test@2026!Admin' },
  { email: 'inspector@iregmoto.gov.bf', firstName: 'Ministry', lastName: 'Inspector', role: 'MINISTRY_INSPECTOR', password: 'Test@2026!Insp' },
  { email: 'analyst@iregmoto.gov.bf', firstName: 'Ministry', lastName: 'Analyst', role: 'MINISTRY_ANALYST', password: 'Test@2026!Ana' },
  { email: 'admin@fasomoto.bf', firstName: 'Faso', lastName: 'Admin', role: 'ENTERPRISE_ADMIN', enterpriseKey: 'fasomoto', password: 'Test@2026!Ent' },
  { email: 'manager@fasomoto.bf', firstName: 'Faso', lastName: 'Manager', role: 'ENTERPRISE_MANAGER', enterpriseKey: 'fasomoto', password: 'Test@2026!Man' },
  { email: 'seller@fasomoto.bf', firstName: 'Faso', lastName: 'Seller', role: 'ENTERPRISE_SELLER', enterpriseKey: 'fasomoto', password: 'Test@2026!Sell' },
  { email: 'compta@fasomoto.bf', firstName: 'Faso', lastName: 'Comptable', role: 'ENTERPRISE_ACCOUNTANT', enterpriseKey: 'fasomoto', password: 'Test@2026!Compta' },
  { email: 'admin@burkinawheels.bf', firstName: 'Burkina', lastName: 'Admin', role: 'ENTERPRISE_ADMIN', enterpriseKey: 'burkinawheels', password: 'Test@2026!Velo' },
  { email: 'auditor@externe.bf', firstName: 'External', lastName: 'Auditor', role: 'AUDITOR', password: 'Test@2026!Audit' },
];

export async function seedUsers(
  dataSource: DataSource,
  enterpriseMap: Map<string, string>,
): Promise<Map<string, string>> {
  const userRepo = dataSource.getRepository(User);
  const roleRepo = dataSource.getRepository(Role);
  const userRoleRepo = dataSource.getRepository(UserRoleAssignment);
  const userMap = new Map<string, string>();

  // Pre-hash all unique passwords
  const passwordMap = new Map<string, string>();
  for (const u of TEST_USERS) {
    if (!passwordMap.has(u.password)) {
      passwordMap.set(u.password, bcrypt.hashSync(u.password, 12));
    }
  }

  for (const userData of TEST_USERS) {
    let user = await userRepo.findOne({ where: { email: userData.email } });

    if (!user) {
      user = userRepo.create({
        email: userData.email.toLowerCase(),
        passwordHash: passwordMap.get(userData.password)!,
        firstName: userData.firstName,
        lastName: userData.lastName,
        isActive: true,
        emailVerified: true,
        locale: 'fr_BF',
        timezone: 'Africa/Ouagadougou',
      });
      user = await userRepo.save(user);
      logger.log(`User created: ${userData.email} (${user.id})`);
    } else {
      logger.log(`User already exists: ${userData.email}`);
    }

    // Assign role
    const role = await roleRepo.findOne({ where: { name: userData.role } });
    if (role) {
      const existingAssignment = await userRoleRepo.findOne({
        where: { userId: user.id, roleId: role.id },
      });
      if (!existingAssignment) {
        const assignment = userRoleRepo.create({
          userId: user.id,
          roleId: role.id,
          actorId: userData.enterpriseKey ? enterpriseMap.get(userData.enterpriseKey) : undefined,
          isPrimaryRole: true,
        });
        await userRoleRepo.save(assignment);
        logger.log(`  Role assigned: ${userData.role}`);
      }
    } else {
      logger.warn(`  Role not found: ${userData.role}`);
    }

    userMap.set(userData.email, user.id);
  }

  logger.log(`Users seed completed (${TEST_USERS.length} users)`);
  return userMap;
}
