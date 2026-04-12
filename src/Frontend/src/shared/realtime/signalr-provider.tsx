import {
  useState,
  useEffect,
  useRef,
  useMemo,
  type ReactNode,
} from 'react';
import type { HubConnection } from '@microsoft/signalr';
import { HubConnectionState } from '@microsoft/signalr';
import { useAuth } from '@/shared/auth/use-auth';
import { createSignalRConnection } from './signalr-client';
import {
  SignalRContext,
  type ConnectionStatus,
  type SignalRContextValue,
} from './signalr-context';

interface SignalRProviderProps {
  children: ReactNode;
}

function mapConnectionState(state: HubConnectionState): ConnectionStatus {
  switch (state) {
    case HubConnectionState.Connected:
      return 'connected';
    case HubConnectionState.Connecting:
      return 'connecting';
    case HubConnectionState.Reconnecting:
      return 'reconnecting';
    case HubConnectionState.Disconnected:
    case HubConnectionState.Disconnecting:
    default:
      return 'disconnected';
  }
}

export function SignalRProvider({ children }: SignalRProviderProps) {
  const { isAuthenticated, getAccessToken } = useAuth();
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const connectionRef = useRef<HubConnection | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setConnection(null);
      setStatus('disconnected');
      return;
    }

    const hubConnection = createSignalRConnection(getAccessToken);
    connectionRef.current = hubConnection;

    hubConnection.onreconnecting(() => {
      setStatus('reconnecting');
    });

    hubConnection.onreconnected(() => {
      setStatus('connected');
    });

    hubConnection.onclose(() => {
      setStatus('disconnected');
    });

    setStatus('connecting');

    hubConnection
      .start()
      .then(() => {
        // Verify the connection ref is still current (not unmounted)
        if (connectionRef.current === hubConnection) {
          setConnection(hubConnection);
          setStatus(mapConnectionState(hubConnection.state));
        }
      })
      .catch((error: unknown) => {
        console.warn('SignalR connection failed:', error);
        if (connectionRef.current === hubConnection) {
          setStatus('disconnected');
        }
      });

    return () => {
      connectionRef.current = null;
      hubConnection
        .stop()
        .catch((error: unknown) => {
          console.warn('SignalR disconnection error:', error);
        });
      setConnection(null);
      setStatus('disconnected');
    };
  }, [isAuthenticated, getAccessToken]);

  const value = useMemo<SignalRContextValue>(
    () => ({ connection, status }),
    [connection, status],
  );

  return (
    <SignalRContext.Provider value={value}>{children}</SignalRContext.Provider>
  );
}
