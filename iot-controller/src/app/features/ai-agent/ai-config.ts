import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AiAgentService } from '../../core/services/ai-agent';

@Component({
  selector: 'app-ai-config',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div class="max-w-2xl mx-auto">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Configure AI Agent
          </h2>

          <form (ngSubmit)="onSave()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                API Key
              </label>
              <input
                type="password"
                [(ngModel)]="apiKey"
                name="apiKey"
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter your OpenRouter API key"
              />
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Get a free API key at <a href="https://openrouter.ai" target="_blank" class="text-blue-600 dark:text-blue-400 hover:underline">openrouter.ai</a>
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Base URL
              </label>
              <input
                type="text"
                [(ngModel)]="baseURL"
                name="baseURL"
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Model
              </label>
              <select
                [(ngModel)]="model"
                name="model"
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="meta-llama/llama-3.2-3b-instruct:free">Llama 3.2 3B (Free)</option>
                <option value="mistralai/mistral-7b-instruct:free">Mistral 7B (Free)</option>
                <option value="google/gemma-2-9b-it:free">Gemma 2 9B (Free)</option>
              </select>
            </div>

            <div class="flex space-x-4">
              <button
                type="submit"
                class="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Save Configuration
              </button>
              <button
                type="button"
                (click)="goBack()"
                class="px-4 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-900 dark:text-white font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  standalone: true
})
export class AiConfig {
  private aiService = inject(AiAgentService);
  private router = inject(Router);

  apiKey = '';
  baseURL = 'https://openrouter.ai/api/v1';
  model = 'meta-llama/llama-3.2-3b-instruct:free';

  constructor() {
    const config = this.aiService.config();
    if (config) {
      this.apiKey = config.apiKey;
      this.baseURL = config.baseURL;
      this.model = config.model;
    }
  }

  onSave() {
    this.aiService.configureAI({
      apiKey: this.apiKey,
      baseURL: this.baseURL,
      model: this.model
    });
    this.router.navigate(['/ai-chat']);
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
