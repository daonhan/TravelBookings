import { createContext } from 'react';
import type { HubConnection } from '@microsoft/signalr';

export type ConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting';

export interface SignalRContextValue {
  connection: HubConnection | null;
  status: ConnectionStatus;
}

export const SignalRContext = createContext<SignalRContextValue>({
  connection: null,
  status: 'disconnected',
});
