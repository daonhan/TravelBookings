import { useContext } from 'react';
import { SignalRContext, type ConnectionStatus } from './signalr-context';

export function useConnectionStatus(): ConnectionStatus {
  const { status } = useContext(SignalRContext);
  return status;
}
