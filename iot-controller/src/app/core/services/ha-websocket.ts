import { Injectable, signal } from '@angular/core';
import {
  createConnection,
  subscribeEntities,
  subscribeConfig,
  callService,
  Auth,
  Connection,
  HassEntities,
  HassConfig
} from 'home-assistant-js-websocket';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HaWebsocketService {
  private connection$ = new BehaviorSubject<Connection | null>(null);

  // Signal-based reactive state
  entities = signal<HassEntities>({});
  connected = signal(false);
  config = signal<HassConfig | null>(null);

  async connect(auth: Auth): Promise<void> {
    try {
      const conn = await createConnection({
        auth
      });

      this.connection$.next(conn);
      this.connected.set(true);

      // Subscribe to real-time entity updates
      subscribeEntities(conn, (entities) => {
        this.entities.set(entities);
      });

      // Subscribe to configuration updates
      subscribeConfig(conn, (config) => {
        this.config.set(config);
      });

      // Handle connection errors
      conn.addEventListener('ready', () => {
        console.log('Home Assistant WebSocket connected');
      });

      conn.addEventListener('disconnected', () => {
        this.connected.set(false);
        console.log('Home Assistant WebSocket disconnected');
      });

      conn.addEventListener('reconnect-error', () => {
        console.error('Home Assistant WebSocket reconnection failed');
      });
    } catch (error) {
      this.connected.set(false);
      throw new Error(
        `Failed to connect to Home Assistant: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  async callService(
    domain: string,
    service: string,
    serviceData?: any,
    target?: any
  ): Promise<void> {
    const conn = this.connection$.value;
    if (!conn) {
      throw new Error('Not connected to Home Assistant');
    }

    try {
      await callService(conn, domain, service, serviceData, target);
    } catch (error) {
      throw new Error(
        `Service call failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  getConnection(): Connection | null {
    return this.connection$.value;
  }

  disconnect(): void {
    const conn = this.connection$.value;
    if (conn) {
      conn.close();
      this.connection$.next(null);
      this.connected.set(false);
    }
  }
}
