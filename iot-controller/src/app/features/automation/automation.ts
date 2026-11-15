import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HaWebsocketService } from '../../core/services/ha-websocket';
import { HaAuthService } from '../../core/services/ha-auth';
import { Router } from '@angular/router';

@Component({
  imports: [CommonModule],
  selector: 'app-automation',
  styleUrl: './automation.css',
  templateUrl: './automation.html',
})
export class AutomationComponent {
  private websocketService = inject(HaWebsocketService);
  private authService = inject(HaAuthService);
  private router = inject(Router);

  entities = this.websocketService.entities;
  connected = this.websocketService.connected;
  executingScript = signal<string | null>(null);

  entityArray = computed(() => {
    const entitiesObj = this.entities();
    return Object.entries(entitiesObj).map(([id, entity]) => ({
      entity_id: id,
      state: entity.state,
      friendly_name: entity.attributes?.friendly_name || id,
      domain: id.split('.')[0],
      last_changed: entity.last_changed,
      last_triggered: entity.attributes?.['last_triggered'],
      attributes: entity.attributes
    }));
  });

  automations = computed(() => 
    this.entityArray().filter(e => e.domain === 'automation')
  );

  scripts = computed(() => 
    this.entityArray().filter(e => e.domain === 'script')
  );

  scenes = computed(() => 
    this.entityArray().filter(e => e.domain === 'scene')
  );

  constructor() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
    }
  }

  async toggleAutomation(entityId: string, currentState: string): Promise<void> {
    const service = currentState === 'on' ? 'turn_off' : 'turn_on';
    await this.websocketService.callService('automation', service, { entity_id: entityId });
  }

  async triggerAutomation(entityId: string): Promise<void> {
    await this.websocketService.callService('automation', 'trigger', { entity_id: entityId });
  }

  async executeScript(entityId: string): Promise<void> {
    this.executingScript.set(entityId);
    try {
      await this.websocketService.callService('script', 'turn_on', { entity_id: entityId });
      setTimeout(() => this.executingScript.set(null), 1000);
    } catch (err) {
      this.executingScript.set(null);
      console.error('Failed to execute script:', err);
    }
  }

  async activateScene(entityId: string): Promise<void> {
    await this.websocketService.callService('scene', 'turn_on', { entity_id: entityId });
  }

  getRelativeTime(timestamp: string | undefined): string {
    if (!timestamp) return 'Never';
    
    const now = new Date().getTime();
    const changed = new Date(timestamp).getTime();
    const diff = Math.floor((now - changed) / 1000);
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }
}
