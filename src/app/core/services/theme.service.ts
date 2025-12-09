import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'fj-theme';
  private readonly document = inject(DOCUMENT);
  theme: 'light' | 'dark' = this.getInitialTheme();

  constructor() {
    this.applyThemeClass();
  }

  toggleTheme(): void {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    const storage = this.getStorage();
    storage?.setItem?.(this.storageKey, this.theme);
    this.applyThemeClass();
  }

  private getInitialTheme(): 'light' | 'dark' {
    const storage = this.getStorage();
    const stored = storage?.getItem?.(this.storageKey) as 'light' | 'dark' | null;
    if (stored) {
      return stored;
    }

    const prefersDark =
      window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }

  private applyThemeClass(): void {
    this.document.body.classList.remove('theme-light', 'theme-dark');
    this.document.body.classList.add(`theme-${this.theme}`);
  }

  private getStorage(): Storage | null {
    try {
      return typeof localStorage !== 'undefined' ? localStorage : null;
    } catch {
      return null;
    }
  }
}
