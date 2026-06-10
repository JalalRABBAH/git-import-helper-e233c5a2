import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '@common/decorators/permissions.decorator';
import { CurrentUserPayload } from '@common/decorators/current-user.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(), context.getClass(),
    ]);
    if (!required?.length) return true;

    const { user } = context.switchToHttp().getRequest();
    const cu = user as CurrentUserPayload;
    if (!cu?.permissions) throw new ForbiddenException('Permissions non définies');

    const hasAll = required.every(p => cu.permissions.includes(p) || cu.permissions.includes('admin:*'));
    if (!hasAll) throw new ForbiddenException(`Permissions requises: ${required.join(', ')}`);
    return true;
  }
}
