import { Injectable } from '@angular/core';

type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'bitacora-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private initialized = false;
  private mediaQuery?: MediaQueryList;
  private listeningToSystem = false;
  private readonly systemThemeChanged = (event: MediaQueryListEvent): void => {
    this.applyTheme(event.matches ? 'dark' : 'light');
  };
  private readonly storageChanged = (event: StorageEvent): void => {
    if (event.key !== THEME_STORAGE_KEY && event.key !== null) {
      return;
    }

    if (event.newValue === 'dark' || event.newValue === 'light') {
      this.stopListeningToSystem();
      this.applyTheme(event.newValue);
    } else {
      this.startListeningToSystem();
      this.applyTheme(this.mediaQuery?.matches ? 'dark' : 'light');
    }
  };

  isDark = false;

  initialize(): void {
    if (this.initialized) {
      return;
    }

    this.initialized = true;
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    window.addEventListener('storage', this.storageChanged);

    const savedTheme = this.readSavedTheme();
    if (savedTheme) {
      this.applyTheme(savedTheme);
      return;
    }

    this.startListeningToSystem();
    this.applyTheme(this.mediaQuery.matches ? 'dark' : 'light');
  }

  toggle(): void {
    this.initialize();
    const theme: Theme = this.isDark ? 'light' : 'dark';

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Keep the manual choice active for this page even if storage is unavailable.
    }

    this.stopListeningToSystem();
    this.applyTheme(theme);
  }

  private readSavedTheme(): Theme | null {
    try {
      const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
      return savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : null;
    } catch {
      return null;
    }
  }

  private startListeningToSystem(): void {
    if (!this.mediaQuery || this.listeningToSystem) {
      return;
    }

    if (this.mediaQuery.addEventListener) {
      this.mediaQuery.addEventListener('change', this.systemThemeChanged);
    } else {
      this.mediaQuery.addListener(this.systemThemeChanged);
    }
    this.listeningToSystem = true;
  }

  private stopListeningToSystem(): void {
    if (!this.mediaQuery || !this.listeningToSystem) {
      return;
    }

    if (this.mediaQuery.removeEventListener) {
      this.mediaQuery.removeEventListener('change', this.systemThemeChanged);
    } else {
      this.mediaQuery.removeListener(this.systemThemeChanged);
    }
    this.listeningToSystem = false;
  }

  private applyTheme(theme: Theme): void {
    this.isDark = theme === 'dark';
    document.documentElement.classList.toggle('dark', this.isDark);
  }
}
