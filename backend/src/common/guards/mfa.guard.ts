import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
export const MFA_REQUIRED_KEY = 'mfaRequired';

@Injectable()
export class MfaGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) throw new UnauthorizedException('Utilisateur non authentifié');
    if (!user.mfaVerified && user.mfaRequired) {
      throw new UnauthorizedException('Vérification MFA requise');
    }
    return true;
  }
}
