import { Injectable, signal, inject } from '@angular/core';
import OpenAI from 'openai';
import { HaWebsocketService } from './ha-websocket';
import { AiToolsService } from './ai-tools';
import { AiPermissionsService } from './ai-permissions';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: Date;
  toolCalls?: Array<{ id: string; name: string; args: any }>;
  toolCallId?: string;
}

export interface AIConfig {
  apiKey: string;
  baseURL: string;
  model: string;
}

@Injectable({ providedIn: 'root' })
export class AiAgentService {
  private readonly CONFIG_KEY = 'iot-ai-config';
  private client: OpenAI | null = null;

  private haWebsocket = inject(HaWebsocketService);
  private aiTools = inject(AiToolsService);
  private permissions = inject(AiPermissionsService);

  config = signal<AIConfig | null>(this.getStoredConfig());
  messages = signal<ChatMessage[]>([]);
  isProcessing = signal(false);

  configureAI(config: AIConfig) {
    this.config.set(config);
    localStorage.setItem(this.CONFIG_KEY, JSON.stringify(config));

    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
      dangerouslyAllowBrowser: true
    });
  }

  isConfigured(): boolean {
    return this.config() !== null && this.client !== null;
  }

  async sendMessage(userMessage: string): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error('AI not configured');
    }

    const message: ChatMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };

    this.messages.update(msgs => [...msgs, message]);
    this.isProcessing.set(true);

    try {
      const systemPrompt = this.buildSystemPrompt();
      const tools = this.aiTools.getToolDefinitions();

      let currentMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...this.messages().map(m => {
          if (m.role === 'tool') {
            return {
              role: 'tool' as const,
              content: m.content,
              tool_call_id: m.toolCallId!
            };
          }
          return { role: m.role as 'user' | 'assistant', content: m.content };
        })
      ];

      // Tool execution loop - max 5 iterations
      for (let i = 0; i < 5; i++) {
        const response = await this.client!.chat.completions.create({
          model: this.config()!.model,
          messages: currentMessages,
          tools: tools as any
        });

        const assistantMessage = response.choices[0].message;

        // Check if AI wants to call tools
        if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
          // Add assistant message with tool calls
          const toolCallsInfo = assistantMessage.tool_calls.map((tc: any) =>
            `${tc.function.name}(${JSON.stringify(JSON.parse(tc.function.arguments))})`
          ).join(', ');

          this.messages.update(msgs => [...msgs, {
            role: 'assistant',
            content: `Calling: ${toolCallsInfo}`,
            timestamp: new Date(),
            toolCalls: assistantMessage.tool_calls!.map((tc: any) => ({
              id: tc.id,
              name: tc.function.name,
              args: JSON.parse(tc.function.arguments)
            }))
          }]);

          // Execute each tool call
          for (const toolCall of assistantMessage.tool_calls) {
            const tc = toolCall as any;
            const toolName = tc.function.name;
            const toolArgs = JSON.parse(tc.function.arguments);

            const result = await this.aiTools.executeTool(toolName, toolArgs);

            // Add tool result message
            this.messages.update(msgs => [...msgs, {
              role: 'tool',
              content: JSON.stringify(result),
              timestamp: new Date(),
              toolCallId: tc.id
            }]);

            // Add to current messages for next iteration
            currentMessages.push({
              role: 'assistant',
              content: assistantMessage.content || ''
            } as any);
            currentMessages.push({
              role: 'tool',
              content: JSON.stringify(result),
              tool_call_id: tc.id
            } as any);
          }
        } else {
          // No more tool calls, add final response
          this.messages.update(msgs => [...msgs, {
            role: 'assistant',
            content: assistantMessage.content || 'No response',
            timestamp: new Date()
          }]);
          break;
        }
      }
    } catch (error) {
      this.messages.update(msgs => [...msgs, {
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      }]);
    } finally {
      this.isProcessing.set(false);
    }
  }

  clearMessages() {
    this.messages.set([]);
  }

  private getStoredConfig(): AIConfig | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(this.CONFIG_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  private buildSystemPrompt(): string {
    const entities = this.haWebsocket.entities();
    const grantedEntityIds = this.permissions.getGrantedEntityIds();

    const entityList = Object.entries(entities)
      .map(([id, entity]) => {
        const hasPermission = grantedEntityIds.includes(id);
        const permissionLabel = hasPermission ? '✓' : '✗';
        return `- ${permissionLabel} ${id}: ${entity.state} (${entity.attributes?.friendly_name || id})`;
      })
      .join('\n');

    return `You are an IoT device controller assistant. You can control Home Assistant devices using the provided tools.

Current time: ${new Date().toISOString()}

Available devices (✓ = you have permission, ✗ = no permission):
${entityList}

Instructions:
- Use the available tools to control devices and get their states
- You can ONLY control devices marked with ✓ (permission granted)
- If a user asks you to control a device without permission (✗), politely inform them that you need permission first
- When controlling lights, you can set brightness (0-255) if needed
- Be concise and friendly
- After executing actions, confirm what you did

Available tools:
- list_devices: List all devices with their states and permissions
- get_device_state: Get current state of a specific device
- turn_on: Turn on a device (with optional brightness for lights)
- turn_off: Turn off a device
- set_brightness: Set brightness for a light
- toggle: Toggle a device on/off`;
  }
}
