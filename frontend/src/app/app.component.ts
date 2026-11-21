import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular/lazy';
import { NavigationEnd, Router } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, IonicModule, NavbarComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {
  showNavbar = false;

  constructor(
    themeService: ThemeService,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
    themeService.initialize();
    this.updateNavbarVisibility();
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateNavbarVisibility();
      }
    });
  }

  private updateNavbarVisibility(): void {
    this.showNavbar = this.authService.isAuthenticated() && !this.router.url.startsWith('/login');
  }
}
