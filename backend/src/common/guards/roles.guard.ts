import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '@common/decorators/roles.decorator';
import { UserRole } from '@shared/enums/user-role.enum';
import { CurrentUserPayload } from '@common/decorators/current-user.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(), context.getClass(),
    ]);
    if (!requiredRoles?.length) return true;

    const { user } = context.switchToHttp().getRequest();
    const currentUser = user as CurrentUserPayload;

    if (!currentUser?.roles) throw new ForbiddenException('Rôles utilisateur non définis');

    const hasRole = requiredRoles.some(r => currentUser.roles.includes(r));
    if (!hasRole) throw new ForbiddenException(`Rôles requis: ${requiredRoles.join(', ')}`);
    return true;
  }
}
