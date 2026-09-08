import { EventEmitter } from 'events';

// Global singleton event emitter to survive Next.js dev server reloads
const globalForEvents = global as unknown as { appEventEmitter?: EventEmitter };

export const appEventEmitter = globalForEvents.appEventEmitter || new EventEmitter();
appEventEmitter.setMaxListeners(100);

if (process.env.NODE_ENV !== 'production') {
  globalForEvents.appEventEmitter = appEventEmitter;
}

export interface DataChangeEvent {
  type: 'booking_created' | 'booking_updated' | 'booking_deleted' | 'room_updated' | 'dormitory_updated' | 'db_reset' | string;
  payload?: any;
  timestamp: number;
}

export function notifyDataChange(type: DataChangeEvent['type'], payload?: any) {
  const event: DataChangeEvent = {
    type,
    payload,
    timestamp: Date.now(),
  };
  appEventEmitter.emit('change', event);
}
