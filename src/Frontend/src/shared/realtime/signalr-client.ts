import {
  HubConnectionBuilder,
  HubConnection,
  HttpTransportType,
  LogLevel,
} from '@microsoft/signalr';

const SIGNALR_HUB_URL =
  import.meta.env.VITE_SIGNALR_HUB_URL || '/hubs/events';

const RECONNECT_DELAYS = [0, 2000, 10000, 30000];

export function createSignalRConnection(
  getAccessToken: () => Promise<string>,
): HubConnection {
  const connection = new HubConnectionBuilder()
    .withUrl(SIGNALR_HUB_URL, {
      accessTokenFactory: getAccessToken,
      transport:
        HttpTransportType.WebSockets | HttpTransportType.LongPolling,
    })
    .withAutomaticReconnect(RECONNECT_DELAYS)
    .configureLogging(
      import.meta.env.DEV ? LogLevel.Information : LogLevel.Warning,
    )
    .build();

  return connection;
}
