import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HaWebsocketService } from '../../core/services/ha-websocket';

@Component({
  imports: [CommonModule],
  selector: 'app-overview',
  styleUrl: './overview.css',
  templateUrl: './overview.html',
})
export class Overview {
  private websocketService = inject(HaWebsocketService);
  private router = inject(Router);

  entities = this.websocketService.entities;
  connected = this.websocketService.connected;

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

  // Status card computations
  lightsOn = computed(() => 
    this.entityArray().filter(e => e.domain === 'light' && e.state === 'on').length
  );
  
  lightsTotal = computed(() => 
    this.entityArray().filter(e => e.domain === 'light').length
  );

  switchesOn = computed(() => 
    this.entityArray().filter(e => e.domain === 'switch' && e.state === 'on').length
  );
  
  switchesTotal = computed(() => 
    this.entityArray().filter(e => e.domain === 'switch').length
  );

  doorsOpen = computed(() => 
    this.entityArray().filter(e => 
      (e.domain === 'binary_sensor' && 
       e.attributes?.device_class === 'door' && 
       e.state === 'on') ||
      (e.domain === 'cover' && e.state === 'open')
    ).length
  );

  temperature = computed(() => {
    const tempSensors = this.entityArray().filter(e => 
      e.domain === 'sensor' && 
      (e.attributes?.device_class === 'temperature' || 
       e.attributes?.unit_of_measurement === '°C' ||
       e.attributes?.unit_of_measurement === '°F')
    );
    if (tempSensors.length > 0) {
      return `${tempSensors[0].state}${tempSensors[0].attributes?.unit_of_measurement || '°C'}`;
    }
    return 'N/A';
  });

  recentlyChanged = computed(() => {
    const all = this.entityArray();
    return all
      .sort((a, b) => new Date(b.last_changed).getTime() - new Date(a.last_changed).getTime())
      .slice(0, 5);
  });

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  getRelativeTime(timestamp: string): string {
    const now = new Date().getTime();
    const changed = new Date(timestamp).getTime();
    const diff = Math.floor((now - changed) / 1000);
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  getStateIcon(entity: any): string {
    const domain = entity.domain;
    const state = entity.state.toLowerCase();
    
    if (domain === 'light') return state === 'on' ? '💡' : '🔆';
    if (domain === 'switch') return state === 'on' ? '🔌' : '⚫';
    if (domain === 'binary_sensor') return state === 'on' ? '🟢' : '⚪';
    if (domain === 'sensor') return '📊';
    if (domain === 'climate') return '🌡️';
    if (domain === 'cover') return state === 'open' ? '🪟' : '🔲';
    return '🔧';
  }
}
