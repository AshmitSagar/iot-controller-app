import { Component, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HaWebsocketService } from '../../../core/services/ha-websocket';

@Component({
  selector: 'app-switch-card',
  imports: [CommonModule],
  template: `
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <span class="text-2xl">🔌</span>
          <div>
            <h3 class="font-medium text-gray-900 dark:text-white">
              {{ entity().attributes?.friendly_name || entity().entity_id }}
            </h3>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ entity().entity_id }}
            </p>
          </div>
        </div>
        <button
          (click)="toggle()"
          [class]="isOn() ?
            'bg-green-500 hover:bg-green-600' :
            'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'"
          class="w-12 h-12 rounded-full transition-colors duration-200 flex items-center justify-center text-white font-bold"
          [attr.aria-label]="isOn() ? 'Turn off' : 'Turn on'"
        >
          {{ isOn() ? 'ON' : 'OFF' }}
        </button>
      </div>
    </div>
  `,
  standalone: true
})
export class SwitchCard {
  entity = input.required<any>();
  private websocketService = inject(HaWebsocketService);

  isOn() {
    return this.entity().state === 'on';
  }

  async toggle() {
    const domain = 'switch';
    const service = this.isOn() ? 'turn_off' : 'turn_on';
    await this.websocketService.callService(domain, service, {
      entity_id: this.entity().entity_id
    });
  }
}
