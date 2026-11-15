export interface AuthConfig {
  hassUrl: string;
  accessToken: string;
}

export interface LoginCredentials {
  hassUrl: string;
  accessToken: string;
}

export interface AuthError {
  message: string;
  code?: string;
  details?: any;
}

export interface ConnectionStatus {
  connected: boolean;
  authenticated: boolean;
  lastConnected?: Date;
  error?: AuthError;
}
