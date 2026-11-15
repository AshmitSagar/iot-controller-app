import type { HassEntity, HassEntities } from 'home-assistant-js-websocket';

export type { HassEntity, HassEntities };

export interface EntityState {
  entity_id: string;
  state: string;
  attributes: Record<string, any>;
  last_changed: string;
  last_updated: string;
  context: {
    id: string;
    parent_id: string | null;
    user_id: string | null;
  };
}

export interface EntityDomain {
  light: 'light';
  switch: 'switch';
  sensor: 'sensor';
  binary_sensor: 'binary_sensor';
  climate: 'climate';
  cover: 'cover';
  fan: 'fan';
  lock: 'lock';
  media_player: 'media_player';
}

export type Domain = keyof EntityDomain;

export interface ServiceCallData {
  domain: string;
  service: string;
  service_data?: any;
  target?: {
    entity_id?: string | string[];
    device_id?: string | string[];
    area_id?: string | string[];
  };
}
