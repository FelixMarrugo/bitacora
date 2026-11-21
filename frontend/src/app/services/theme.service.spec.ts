import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let themeService: ThemeService;
  let mediaQuery: MediaQueryList;

  beforeEach(() => {
    localStorage.removeItem('bitacora-theme');
    document.documentElement.classList.remove('dark');
    mediaQuery = {
      matches: true,
      addEventListener: jasmine.createSpy('addEventListener'),
      removeEventListener: jasmine.createSpy('removeEventListener'),
    } as unknown as MediaQueryList;
    spyOn(window, 'matchMedia').and.returnValue(mediaQuery);
    themeService = new ThemeService();
  });

  afterEach(() => {
    localStorage.removeItem('bitacora-theme');
    document.documentElement.classList.remove('dark');
  });

  it('uses the system dark preference when no choice is saved', () => {
    themeService.initialize();

    expect(themeService.isDark).toBeTrue();
    expect(document.documentElement.classList.contains('dark')).toBeTrue();
    expect(mediaQuery.addEventListener).toHaveBeenCalledWith(
      'change',
      jasmine.any(Function)
    );
  });

  it('honors a saved choice without listening to the system preference', () => {
    localStorage.setItem('bitacora-theme', 'light');
    themeService.initialize();

    expect(themeService.isDark).toBeFalse();
    expect(mediaQuery.addEventListener).not.toHaveBeenCalled();
  });

  it('persists manual choices and stops following the system preference', () => {
    themeService.initialize();
    themeService.toggle();

    expect(localStorage.getItem('bitacora-theme')).toBe('light');
    expect(themeService.isDark).toBeFalse();
    expect(document.documentElement.classList.contains('dark')).toBeFalse();
    expect(mediaQuery.removeEventListener).toHaveBeenCalledWith(
      'change',
      jasmine.any(Function)
    );
  });
});
