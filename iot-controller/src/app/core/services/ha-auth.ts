import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  Auth,
  createLongLivedTokenAuth
} from 'home-assistant-js-websocket';

@Injectable({ providedIn: 'root' })
export class HaAuthService {
  private readonly TOKEN_KEY = 'ha_access_token';
  private readonly URL_KEY = 'ha_url';

  constructor(private router: Router) {}

  async authenticate(hassUrl: string, token: string): Promise<Auth> {
    try {
      const auth = createLongLivedTokenAuth(hassUrl, token);

      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.URL_KEY, hassUrl);

      return auth;
    } catch (error) {
      throw new Error('Authentication failed: Invalid token or URL');
    }
  }

  async getAuth(): Promise<Auth | null> {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const url = localStorage.getItem(this.URL_KEY);

    if (!token || !url) {
      return null;
    }

    return createLongLivedTokenAuth(url, token);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.URL_KEY);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }
}
