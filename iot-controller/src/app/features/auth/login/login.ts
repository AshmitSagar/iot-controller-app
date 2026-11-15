import { Component, signal, model, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HaAuthService } from '../../../core/services/ha-auth';
import { HaWebsocketService } from '../../../core/services/ha-websocket';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  hassUrl = model('http://localhost:8123');
  accessToken = model('');
  loading = signal(false);
  error = signal<string | null>(null);

  private authService = inject(HaAuthService);
  private websocketService = inject(HaWebsocketService);
  private router = inject(Router);

  constructor() {
    // Check if already authenticated
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/overview']);
    }
  }

  async onLogin(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      // Authenticate with Home Assistant
      const auth = await this.authService.authenticate(
        this.hassUrl(),
        this.accessToken()
      );

      // Connect WebSocket
      await this.websocketService.connect(auth);

      // Navigate to overview on success
      this.router.navigate(['/overview']);
    } catch (err) {
      this.error.set(
        err instanceof Error
          ? err.message
          : 'Failed to connect to Home Assistant'
      );
      this.loading.set(false);
    }
  }

  isFormValid(): boolean {
    return this.hassUrl().trim() !== '' && this.accessToken().trim() !== '';
  }
}
