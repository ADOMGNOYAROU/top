import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService, UserRole } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const user = this.auth.getCurrentUser();

    if (!user) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    const allowedRoles: UserRole[] = route.data?.['roles'] ?? [];
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      // Redirige vers l'espace correct selon son rôle réel
      this.router.navigate([this.auth.getDefaultRoute()]);
      return false;
    }

    return true;
  }
}
