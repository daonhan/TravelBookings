import { useContext, useEffect, useCallback } from 'react';
import { SignalRContext } from './signalr-context';

export function useSignalREvent<T>(
  eventName: string,
  callback: (event: T) => void,
): void {
  const { connection } = useContext(SignalRContext);

  // Stabilize the callback reference to avoid unnecessary re-subscriptions
  const stableCallback = useCallback(
    (event: T) => {
      callback(event);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [callback],
  );

  useEffect(() => {
    if (!connection) {
      return;
    }

    const handler = (...args: unknown[]) => {
      stableCallback(args[0] as T);
    };

    connection.on(eventName, handler);

    return () => {
      connection.off(eventName, handler);
    };
  }, [connection, eventName, stableCallback]);
}
