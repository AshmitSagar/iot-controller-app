import { inject } from '@angular/core';
import { HaAuthService } from '../services/ha-auth';
import { HaWebsocketService } from '../services/ha-websocket';

export function initializeWebSocket() {
  return async () => {
    const authService = inject(HaAuthService);
    const websocketService = inject(HaWebsocketService);

    // If user is authenticated, reconnect WebSocket
    if (authService.isAuthenticated()) {
      try {
        const auth = await authService.getAuth();
        if (auth) {
          await websocketService.connect(auth);
          console.log('WebSocket auto-reconnected on app initialization');
        }
      } catch (error) {
        console.error('Failed to auto-reconnect WebSocket:', error);
        // Don't throw - let user continue to login page
      }
    }
  };
}
