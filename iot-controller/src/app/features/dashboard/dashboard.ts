import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HaWebsocketService } from '../../core/services/ha-websocket';
import { HaAuthService } from '../../core/services/ha-auth';
import { LightCard } from '../../shared/components/light-card/light-card';
import { SwitchCard } from '../../shared/components/switch-card/switch-card';
import { SensorCard } from '../../shared/components/sensor-card/sensor-card';

@Component({
  imports: [CommonModule, LightCard, SwitchCard, SensorCard],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private websocketService = inject(HaWebsocketService);
  private authService = inject(HaAuthService);
  private router = inject(Router);

  // Get entities and connection status from WebSocket service
  entities = this.websocketService.entities;
  connected = this.websocketService.connected;
  config = this.websocketService.config;

  // Computed signals for entity stats
  entityCount = computed(() => Object.keys(this.entities()).length);

  entityArray = computed(() => {
    const entitiesObj = this.entities();
    return Object.entries(entitiesObj).map(([id, entity]) => ({
      entity_id: id,
      state: entity.state,
      friendly_name: entity.attributes?.friendly_name || id,
      domain: id.split('.')[0],
      last_changed: entity.last_changed,
      attributes: entity.attributes
    }));
  });

  // Group entities by domain
  lightEntities = computed(() =>
    this.entityArray().filter(e => e.domain === 'light')
  );

  switchEntities = computed(() =>
    this.entityArray().filter(e => e.domain === 'switch')
  );

  sensorEntities = computed(() =>
    this.entityArray().filter(e => e.domain === 'sensor' || e.domain === 'binary_sensor')
  );

  otherEntities = computed(() =>
    this.entityArray().filter(e =>
      !['light', 'switch', 'sensor', 'binary_sensor'].includes(e.domain)
    )
  );

  constructor() {
    // Redirect to login if not authenticated
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
    }
  }

  getStateClass(state: string): string {
    const lowerState = state.toLowerCase();
    if (lowerState === 'on' || lowerState === 'home' || lowerState === 'open') {
      return 'text-green-600 dark:text-green-400';
    } else if (lowerState === 'off' || lowerState === 'away' || lowerState === 'closed') {
      return 'text-gray-500 dark:text-gray-400';
    } else if (lowerState === 'unavailable' || lowerState === 'unknown') {
      return 'text-red-600 dark:text-red-400';
    }
    return 'text-blue-600 dark:text-blue-400';
  }

  getDomainIcon(domain: string): string {
    const icons: Record<string, string> = {
      light: '💡',
      switch: '🔌',
      sensor: '📊',
      binary_sensor: '🔘',
      climate: '🌡️',
      cover: '🪟',
      fan: '💨',
      lock: '🔒',
      media_player: '📺',
      person: '👤',
      device_tracker: '📍',
      weather: '🌤️'
    };
    return icons[domain] || '🔧';
  }
}
