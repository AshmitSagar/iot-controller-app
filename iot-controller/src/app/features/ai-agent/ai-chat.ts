import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AiAgentService } from '../../core/services/ai-agent';

@Component({
  selector: 'app-ai-chat',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <!-- Header -->
      <header class="bg-white dark:bg-gray-800 shadow">
        <div class="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 class="text-xl font-bold text-gray-900 dark:text-white">
            AI Agent Chat
          </h1>
          <div class="flex space-x-2">
            <button
              (click)="goToPermissions()"
              class="px-4 py-2 text-sm bg-purple-600 dark:bg-purple-700 hover:bg-purple-700 dark:hover:bg-purple-600 text-white rounded-lg transition-colors"
            >
              Permissions
            </button>
            <button
              (click)="goToConfig()"
              class="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Configure
            </button>
            <button
              (click)="goToDashboard()"
              class="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Dashboard
            </button>
          </div>
        </div>
      </header>

      <!-- Messages -->
      <main class="flex-1 overflow-y-auto">
        <div class="max-w-4xl mx-auto px-4 py-6 space-y-4">
          @if (messages().length === 0) {
            <div class="text-center py-12">
              <p class="text-gray-500 dark:text-gray-400">
                Start chatting with the AI agent about your devices
              </p>
              <p class="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Try: "What devices do I have?" or "Tell me about my lights"
              </p>
            </div>
          }

          @for (msg of messages(); track msg.timestamp) {
            <div [class]="msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'">
              @if (msg.role === 'tool') {
                <!-- Tool execution result -->
                <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-900 dark:text-yellow-200 rounded-lg px-4 py-2 max-w-[80%]">
                  <p class="text-xs font-semibold mb-1">Tool Result</p>
                  <p class="text-sm whitespace-pre-wrap">{{ parseToolResult(msg.content) }}</p>
                </div>
              } @else {
                <div [class]="msg.role === 'user' ?
                  'bg-blue-600 text-white rounded-lg px-4 py-2 max-w-[80%]' :
                  'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-4 py-2 max-w-[80%] shadow'">
                  <p class="text-sm whitespace-pre-wrap">{{ msg.content }}</p>
                  @if (msg.toolCalls && msg.toolCalls.length > 0) {
                    <div class="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <p class="text-xs opacity-70 mb-1">Executing tools:</p>
                      @for (tc of msg.toolCalls; track tc.id) {
                        <div class="text-xs bg-gray-100 dark:bg-gray-700 rounded px-2 py-1 mb-1">
                          {{ tc.name }}({{ formatArgs(tc.args) }})
                        </div>
                      }
                    </div>
                  }
                  <p class="text-xs opacity-70 mt-1">
                    {{ msg.timestamp | date:'short' }}
                  </p>
                </div>
              }
            </div>
          }

          @if (isProcessing()) {
            <div class="flex justify-start">
              <div class="bg-white dark:bg-gray-800 rounded-lg px-4 py-2 shadow">
                <div class="flex space-x-2">
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                </div>
              </div>
            </div>
          }
        </div>
      </main>

      <!-- Input -->
      <footer class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div class="max-w-4xl mx-auto px-4 py-4">
          <form (ngSubmit)="sendMessage()" class="flex space-x-2">
            <input
              type="text"
              [(ngModel)]="userInput"
              name="message"
              [disabled]="isProcessing()"
              placeholder="Type your message..."
              class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
            />
            <button
              type="submit"
              [disabled]="!userInput.trim() || isProcessing()"
              class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      </footer>
    </div>
  `,
  standalone: true
})
export class AiChat {
  private aiService = inject(AiAgentService);
  private router = inject(Router);

  messages = this.aiService.messages;
  isProcessing = this.aiService.isProcessing;
  userInput = '';

  constructor() {
    if (!this.aiService.isConfigured()) {
      this.router.navigate(['/ai-config']);
    }
  }

  async sendMessage() {
    const message = this.userInput.trim();
    if (!message) return;

    this.userInput = '';
    await this.aiService.sendMessage(message);
  }

  goToConfig() {
    this.router.navigate(['/ai-config']);
  }

  goToPermissions() {
    this.router.navigate(['/ai-permissions']);
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  parseToolResult(content: string): string {
    try {
      const result = JSON.parse(content);
      return result.message || content;
    } catch {
      return content;
    }
  }

  formatArgs(args: any): string {
    return Object.entries(args)
      .map(([key, val]) => `${key}=${val}`)
      .join(', ');
  }
}
