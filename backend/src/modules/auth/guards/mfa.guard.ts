import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthMfaGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) throw new UnauthorizedException('Utilisateur non authentifié');
    if (user.mfaRequired && !user.mfaVerified) {
      throw new UnauthorizedException('Vérification MFA requise');
    }
    return true;
  }
}
