import { CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';
import { inject } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { CookieService } from 'ngx-cookie-service';

export const adminGuard: CanActivateFn = (route, state) => {
  const cookieService = inject(CookieService);
  const token = cookieService.get('accessToken');

  try {
    const isAdmin = (jwtDecode(token) as any).roles.includes('admin');
    if (!isAdmin) alert('you are not admin');
    return isAdmin;
  } catch {
    return false;
  }
};
