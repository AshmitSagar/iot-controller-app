import { Component, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HaWebsocketService } from '../../../core/services/ha-websocket';

@Component({
  selector: 'app-light-card',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center space-x-3">
          <span class="text-2xl">💡</span>
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
            'bg-yellow-500 hover:bg-yellow-600' :
            'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'"
          class="w-12 h-12 rounded-full transition-colors duration-200 flex items-center justify-center text-white"
          [attr.aria-label]="isOn() ? 'Turn off' : 'Turn on'"
        >
          <span class="text-xl">{{ isOn() ? '●' : '○' }}</span>
        </button>
      </div>

      @if (isOn() && supportsBrightness()) {
        <div class="mt-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Brightness: {{ brightness() }}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            [value]="brightness()"
            (input)="onBrightnessChange($event)"
            class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
          />
        </div>
      }
    </div>
  `,
  standalone: true
})
export class LightCard {
  entity = input.required<any>();
  private websocketService = inject(HaWebsocketService);

  isOn() {
    return this.entity().state === 'on';
  }

  supportsBrightness() {
    return this.entity().attributes?.supported_color_modes?.includes('brightness') ||
           this.entity().attributes?.brightness !== undefined;
  }

  brightness() {
    const b = this.entity().attributes?.brightness;
    return b ? Math.round((b / 255) * 100) : 100;
  }

  async toggle() {
    const domain = 'light';
    const service = this.isOn() ? 'turn_off' : 'turn_on';
    await this.websocketService.callService(domain, service, {
      entity_id: this.entity().entity_id
    });
  }

  async onBrightnessChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const percent = parseInt(target.value);
    const brightness = Math.round((percent / 100) * 255);

    await this.websocketService.callService('light', 'turn_on', {
      entity_id: this.entity().entity_id,
      brightness
    });
  }
}
