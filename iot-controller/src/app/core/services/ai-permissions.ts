import { Injectable, signal } from '@angular/core';

export interface DevicePermission {
  entity_id: string;
  friendly_name: string;
  domain: string;
  granted: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AiPermissionsService {
  private readonly STORAGE_KEY = 'iot-ai-permissions';

  permissions = signal<Map<string, boolean>>(this.loadPermissions());

  private loadPermissions(): Map<string, boolean> {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return new Map();

    const obj = JSON.parse(stored);
    return new Map(Object.entries(obj));
  }

  private savePermissions(): void {
    const obj = Object.fromEntries(this.permissions());
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(obj));
  }

  grant(entityId: string): void {
    const perms = new Map(this.permissions());
    perms.set(entityId, true);
    this.permissions.set(perms);
    this.savePermissions();
  }

  revoke(entityId: string): void {
    const perms = new Map(this.permissions());
    perms.set(entityId, false);
    this.permissions.set(perms);
    this.savePermissions();
  }

  grantAll(entityIds: string[]): void {
    const perms = new Map(this.permissions());
    entityIds.forEach(id => perms.set(id, true));
    this.permissions.set(perms);
    this.savePermissions();
  }

  revokeAll(entityIds: string[]): void {
    const perms = new Map(this.permissions());
    entityIds.forEach(id => perms.set(id, false));
    this.permissions.set(perms);
    this.savePermissions();
  }

  check(entityId: string): boolean {
    return this.permissions().get(entityId) ?? false;
  }

  getGrantedEntityIds(): string[] {
    return Array.from(this.permissions().entries())
      .filter(([_, granted]) => granted)
      .map(([entityId]) => entityId);
  }
}
