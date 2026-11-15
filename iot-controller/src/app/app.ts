import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { HaWebsocketService } from './core/services/ha-websocket';
import { HaAuthService } from './core/services/ha-auth';
import { ThemeService } from './core/services/theme.service';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('iot-controller');
  
  websocketService = inject(HaWebsocketService);
  private authService = inject(HaAuthService);
  private router = inject(Router);
  themeService = inject(ThemeService);

  entityCount = computed(() => Object.keys(this.websocketService.entities()).length);

  logout(): void {
    this.websocketService.disconnect();
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
