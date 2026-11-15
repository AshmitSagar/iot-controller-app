import { Injectable, inject } from '@angular/core';
import { HaWebsocketService } from './ha-websocket';
import { AiPermissionsService } from './ai-permissions';

export interface ToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, any>;
      required: string[];
    };
  };
}

export interface ToolCallResult {
  success: boolean;
  message: string;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class AiToolsService {
  private haWebsocket = inject(HaWebsocketService);
  private permissions = inject(AiPermissionsService);

  getToolDefinitions(): ToolDefinition[] {
    return [
      {
        type: 'function',
        function: {
          name: 'list_devices',
          description: 'List all available devices and their current states. Returns entity_id, friendly_name, state, and domain for each device.',
          parameters: {
            type: 'object',
            properties: {},
            required: []
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'get_device_state',
          description: 'Get the current state of a specific device by its entity_id.',
          parameters: {
            type: 'object',
            properties: {
              entity_id: {
                type: 'string',
                description: 'The entity_id of the device (e.g., "light.living_room", "switch.bedroom")'
              }
            },
            required: ['entity_id']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'turn_on',
          description: 'Turn on a device (light, switch, etc.). For lights, you can optionally set brightness (0-255).',
          parameters: {
            type: 'object',
            properties: {
              entity_id: {
                type: 'string',
                description: 'The entity_id of the device to turn on'
              },
              brightness: {
                type: 'number',
                description: 'Optional brightness level for lights (0-255)',
                minimum: 0,
                maximum: 255
              }
            },
            required: ['entity_id']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'turn_off',
          description: 'Turn off a device (light, switch, etc.).',
          parameters: {
            type: 'object',
            properties: {
              entity_id: {
                type: 'string',
                description: 'The entity_id of the device to turn off'
              }
            },
            required: ['entity_id']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'set_brightness',
          description: 'Set the brightness of a light. The light will be turned on if it is off.',
          parameters: {
            type: 'object',
            properties: {
              entity_id: {
                type: 'string',
                description: 'The entity_id of the light'
              },
              brightness: {
                type: 'number',
                description: 'Brightness level (0-255)',
                minimum: 0,
                maximum: 255
              }
            },
            required: ['entity_id', 'brightness']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'toggle',
          description: 'Toggle a device between on and off states.',
          parameters: {
            type: 'object',
            properties: {
              entity_id: {
                type: 'string',
                description: 'The entity_id of the device to toggle'
              }
            },
            required: ['entity_id']
          }
        }
      }
    ];
  }

  async executeTool(toolName: string, args: Record<string, any>): Promise<ToolCallResult> {
    try {
      switch (toolName) {
        case 'list_devices':
          return await this.listDevices();
        case 'get_device_state':
          return await this.getDeviceState(args['entity_id']);
        case 'turn_on':
          return await this.turnOn(args['entity_id'], args['brightness']);
        case 'turn_off':
          return await this.turnOff(args['entity_id']);
        case 'set_brightness':
          return await this.setBrightness(args['entity_id'], args['brightness']);
        case 'toggle':
          return await this.toggle(args['entity_id']);
        default:
          return {
            success: false,
            message: `Unknown tool: ${toolName}`
          };
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Error executing ${toolName}: ${error.message || error}`
      };
    }
  }

  private async listDevices(): Promise<ToolCallResult> {
    const entities = this.haWebsocket.entities();
    const deviceList = Object.values(entities).map(entity => ({
      entity_id: entity.entity_id,
      friendly_name: entity.attributes.friendly_name || entity.entity_id,
      state: entity.state,
      domain: entity.entity_id.split('.')[0],
      has_permission: this.permissions.check(entity.entity_id)
    }));

    return {
      success: true,
      message: `Found ${deviceList.length} devices`,
      data: deviceList
    };
  }

  private async getDeviceState(entityId: string): Promise<ToolCallResult> {
    const entities = this.haWebsocket.entities();
    const entity = entities[entityId];

    if (!entity) {
      return {
        success: false,
        message: `Device not found: ${entityId}`
      };
    }

    return {
      success: true,
      message: `Current state: ${entity.state}`,
      data: {
        entity_id: entity.entity_id,
        state: entity.state,
        attributes: entity.attributes
      }
    };
  }

  private async turnOn(entityId: string, brightness?: number): Promise<ToolCallResult> {
    if (!this.permissions.check(entityId)) {
      return {
        success: false,
        message: `Permission denied: You don't have permission to control ${entityId}. Please grant permission first.`
      };
    }

    const domain = entityId.split('.')[0];
    const serviceData: any = { entity_id: entityId };

    if (brightness !== undefined && domain === 'light') {
      serviceData.brightness = brightness;
    }

    await this.haWebsocket.callService(domain, 'turn_on', serviceData);

    const brightnessMsg = brightness !== undefined ? ` with brightness ${brightness}` : '';
    return {
      success: true,
      message: `Turned on ${entityId}${brightnessMsg}`
    };
  }

  private async turnOff(entityId: string): Promise<ToolCallResult> {
    if (!this.permissions.check(entityId)) {
      return {
        success: false,
        message: `Permission denied: You don't have permission to control ${entityId}. Please grant permission first.`
      };
    }

    const domain = entityId.split('.')[0];
    await this.haWebsocket.callService(domain, 'turn_off', { entity_id: entityId });

    return {
      success: true,
      message: `Turned off ${entityId}`
    };
  }

  private async setBrightness(entityId: string, brightness: number): Promise<ToolCallResult> {
    if (!this.permissions.check(entityId)) {
      return {
        success: false,
        message: `Permission denied: You don't have permission to control ${entityId}. Please grant permission first.`
      };
    }

    const domain = entityId.split('.')[0];
    if (domain !== 'light') {
      return {
        success: false,
        message: `Cannot set brightness: ${entityId} is not a light`
      };
    }

    await this.haWebsocket.callService('light', 'turn_on', {
      entity_id: entityId,
      brightness: brightness
    });

    return {
      success: true,
      message: `Set ${entityId} brightness to ${brightness}`
    };
  }

  private async toggle(entityId: string): Promise<ToolCallResult> {
    if (!this.permissions.check(entityId)) {
      return {
        success: false,
        message: `Permission denied: You don't have permission to control ${entityId}. Please grant permission first.`
      };
    }

    const domain = entityId.split('.')[0];
    await this.haWebsocket.callService(domain, 'toggle', { entity_id: entityId });

    return {
      success: true,
      message: `Toggled ${entityId}`
    };
  }
}
