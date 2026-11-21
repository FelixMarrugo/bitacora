import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  isMenuOpen = false;
  isHelpOpen = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    readonly themeService: ThemeService
  ) {}

  get displayName(): string {
    const user = this.authService.getCurrentUser();
    return user ? `${user.firstName} ${user.lastName}`.trim() || user.username : '';
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  toggleHelp(): void {
    this.closeMenu();
    this.isHelpOpen = !this.isHelpOpen;
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  closeHelp(): void {
    this.isHelpOpen = false;
  }

  @HostListener('document:keydown.escape')
  closeOverlays(): void {
    this.closeMenu();
    this.closeHelp();
  }

  logout(): void {
    this.closeMenu();
    this.authService.clearSession();
    void this.router.navigateByUrl('/login');
  }
}
