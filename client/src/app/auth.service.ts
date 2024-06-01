import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { BehaviorSubject } from 'rxjs';
import * as Chance from 'chance';
import { jwtDecode } from 'jwt-decode';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private chance: any;
  constructor(
    private readonly http: HttpClient,
    private readonly cookieService: CookieService
  ) {
    this.chance = new Chance();
    this.checkIsAdmin();
  }

  isUserLoggedIn$ = new BehaviorSubject(
    !!this.cookieService.get('accessToken')
  );

  isUserAdmin$ = new BehaviorSubject(false);

  checkIsAdmin() {
    try {
      const token = this.cookieService.get('accessToken');
      if (!token) return;
      const decode: any = jwtDecode(token);
      const isAdmin = decode.roles.includes('admin');
      this.isUserAdmin$.next(isAdmin);
    } catch {
      this.isUserAdmin$.next(false);
    }
  }

  login(
    data: Partial<{
      username: string | null;
      password: string | null;
      aclKey: string | null;
    }>
  ) {
    const keyId = localStorage.getItem('keyId');

    if (!keyId) {
      const key = this.chance.string({ length: 128 });
      localStorage.setItem('key', key.toString());

      return this.http.post('http://localhost/auth/login', {
        login: data.username,
        password: data.password,
        keyContent: key,
        code: data.aclKey,
      });
    } else {
      return this.http.post('http://localhost/auth/login', {
        login: data.username,
        password: data.password,
        keyId,
      });
    }
  }

  register(
    data: Partial<{ username: string | null; password: string | null }>
  ) {
    const key = this.chance.string({ length: 128 });
    localStorage.setItem('key', key.toString());
    return this.http.post('http://localhost/auth/register', {
      login: data.username,
      password: data.password,
      key,
    });
  }

  logout() {
    this.cookieService.delete('accessToken');
    this.cookieService.delete('refreshToken');
    this.isUserLoggedIn$.next(false);
    this.isUserAdmin$.next(false);
  }

  refresh() {
    return this.http
      .post('http://localhost/auth/refresh', {
        refreshToken: this.cookieService.get('refreshToken'),
      })
      .subscribe((res: any) => {
        this.cookieService.set('refreshToken', res.refreshToken);
        this.cookieService.set('accessToken', res.accessToken);
      });
  }

  acl() {
    const headers = new HttpHeaders({
      Authorization: 'Bearer ' + this.cookieService.get('accessToken'),
    });
    return this.http.get('http://localhost/acl/code', { headers: headers });
  }

  admin() {
    const headers = new HttpHeaders({
      Authorization: 'Bearer ' + this.cookieService.get('accessToken'),
    });
    return this.http.post<Array<{ login: string; bantime: string }>>(
      'http://localhost/auth/admin',
      { accessToken: this.cookieService.get('accessToken') },
      { headers: headers }
    );
  }

  ban(login: string, time: number, unban: boolean) {
    const headers = new HttpHeaders({
      Authorization: 'Bearer ' + this.cookieService.get('accessToken'),
    });

    const endTime = Date.now() + time;
    return this.http.post(
      'http://localhost/auth/ban',
      { time: endTime, login: login, unban: unban },
      { headers: headers }
    );
  }
}
