import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly THEME_KEY = 'iot-controller-theme';

  theme = signal<Theme>(this.getStoredTheme());

  constructor() {
    // Apply theme on initialization
    this.applyTheme(this.theme());

    // Watch for theme changes
    effect(() => {
      this.applyTheme(this.theme());
    });

    // Watch for system theme changes
    if (typeof window !== 'undefined') {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (this.theme() === 'system') {
          this.applyTheme('system');
        }
      });
    }
  }

  setTheme(theme: Theme) {
    this.theme.set(theme);
    localStorage.setItem(this.THEME_KEY, theme);
  }

  toggleTheme() {
    const current = this.theme();
    const next = current === 'light' ? 'dark' : 'light';
    this.setTheme(next);
  }

  private getStoredTheme(): Theme {
    if (typeof window === 'undefined') return 'system';

    const stored = localStorage.getItem(this.THEME_KEY) as Theme;
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      return stored;
    }

    return 'system';
  }

  private applyTheme(theme: Theme) {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    const isDark = theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
}
