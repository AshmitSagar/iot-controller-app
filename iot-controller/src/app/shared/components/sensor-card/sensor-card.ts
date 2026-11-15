import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sensor-card',
  imports: [CommonModule],
  template: `
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div class="flex items-center space-x-3">
        <span class="text-2xl">{{ getIcon() }}</span>
        <div class="flex-1">
          <h3 class="font-medium text-gray-900 dark:text-white">
            {{ entity().attributes?.friendly_name || entity().entity_id }}
          </h3>
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">
            {{ entity().entity_id }}
          </p>
          <div class="flex items-baseline space-x-2">
            <span class="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {{ entity().state }}
            </span>
            @if (entity().attributes?.unit_of_measurement) {
              <span class="text-sm text-gray-600 dark:text-gray-400">
                {{ entity().attributes.unit_of_measurement }}
              </span>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  standalone: true
})
export class SensorCard {
  entity = input.required<any>();

  getIcon() {
    const deviceClass = this.entity().attributes?.device_class;
    const icons: Record<string, string> = {
      temperature: '🌡️',
      humidity: '💧',
      battery: '🔋',
      power: '⚡',
      energy: '⚡',
      illuminance: '💡',
      pressure: '🌤️',
      motion: '🚶',
      door: '🚪',
      window: '🪟'
    };
    return icons[deviceClass] || '📊';
  }
}
