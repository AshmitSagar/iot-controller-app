import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AiPermissionsService } from '../../core/services/ai-permissions';
import { HaWebsocketService } from '../../core/services/ha-websocket';

@Component({
  selector: 'app-ai-permissions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-purple-500 to-indigo-600 dark:from-gray-900 dark:to-gray-800 p-4">
      <div class="max-w-4xl mx-auto">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          <h1 class="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            AI Device Permissions
          </h1>
          <p class="text-gray-600 dark:text-gray-300 mb-6">
            Grant or revoke AI agent's access to control devices
          </p>

          <div class="flex gap-4 mb-6">
            <button
              (click)="grantAll()"
              class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition">
              Grant All
            </button>
            <button
              (click)="revokeAll()"
              class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition">
              Revoke All
            </button>
          </div>

          <div class="space-y-6">
            @for (group of groupedEntities(); track group.domain) {
              <div class="border dark:border-gray-700 rounded-lg p-4">
                <h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-4 capitalize">
                  {{ group.domain }}s ({{ group.entities.length }})
                </h2>
                <div class="space-y-2">
                  @for (entity of group.entities; track entity.entity_id) {
                    <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div class="flex-1">
                        <div class="font-medium text-gray-800 dark:text-white">
                          {{ entity.friendly_name }}
                        </div>
                        <div class="text-sm text-gray-500 dark:text-gray-400">
                          {{ entity.entity_id }}
                        </div>
                      </div>
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          [checked]="entity.granted"
                          (change)="togglePermission(entity.entity_id)"
                          class="sr-only peer">
                        <div class="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  }
                </div>
              </div>
            }
          </div>

          @if (groupedEntities().length === 0) {
            <div class="text-center py-12 text-gray-500 dark:text-gray-400">
              No devices available. Connect to Home Assistant first.
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class AiPermissionsComponent {
  private haWebsocket = inject(HaWebsocketService);
  private permissionsService = inject(AiPermissionsService);

  groupedEntities = computed(() => {
    const entities = this.haWebsocket.entities();
    const permissions = this.permissionsService.permissions();

    const grouped = new Map<string, any[]>();

    Object.values(entities).forEach(entity => {
      const domain = entity.entity_id.split('.')[0];
      if (!grouped.has(domain)) {
        grouped.set(domain, []);
      }
      grouped.get(domain)!.push({
        entity_id: entity.entity_id,
        friendly_name: entity.attributes.friendly_name || entity.entity_id,
        granted: permissions.get(entity.entity_id) ?? false
      });
    });

    return Array.from(grouped.entries())
      .map(([domain, entities]) => ({ domain, entities }))
      .sort((a, b) => a.domain.localeCompare(b.domain));
  });

  togglePermission(entityId: string): void {
    const current = this.permissionsService.check(entityId);
    if (current) {
      this.permissionsService.revoke(entityId);
    } else {
      this.permissionsService.grant(entityId);
    }
  }

  grantAll(): void {
    const entities = this.haWebsocket.entities();
    const entityIds = Object.keys(entities);
    this.permissionsService.grantAll(entityIds);
  }

  revokeAll(): void {
    const entities = this.haWebsocket.entities();
    const entityIds = Object.keys(entities);
    this.permissionsService.revokeAll(entityIds);
  }
}
