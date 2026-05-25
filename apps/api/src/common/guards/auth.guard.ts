import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { auth } from '../../auth/auth.config';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Record<string, any>>();

    // Convert Express headers object to Web API Headers
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers as Record<string, string | string[]>)) {
      if (value) {
        headers.set(key, Array.isArray(value) ? value.join(', ') : value);
      }
    }

    const session = await auth.api.getSession({ headers });
    if (!session?.user) throw new UnauthorizedException();

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requiredRoles?.length && !requiredRoles.includes(session.user.role as string)) {
      throw new ForbiddenException();
    }

    // Attach session user to request for downstream use
    (req as any).sessionUser = session.user;
    return true;
  }
}
