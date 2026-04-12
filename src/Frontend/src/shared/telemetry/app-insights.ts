import { ApplicationInsights } from '@microsoft/applicationinsights-web';

let appInsights: ApplicationInsights | null = null;

export function initAppInsights(connectionString: string): void {
  if (appInsights) {
    return;
  }

  appInsights = new ApplicationInsights({
    config: {
      connectionString,
      enableAutoRouteTracking: false,
      enableCorsCorrelation: true,
      enableRequestHeaderTracking: true,
      enableResponseHeaderTracking: true,
    },
  });

  appInsights.loadAppInsights();
}

export function trackEvent(
  name: string,
  properties?: Record<string, string>,
): void {
  if (!appInsights) {
    return;
  }

  appInsights.trackEvent({ name }, properties);
}

export function trackException(
  error: Error,
  properties?: Record<string, string>,
): void {
  if (!appInsights) {
    return;
  }

  appInsights.trackException({ exception: error }, properties);
}

export function trackPageView(name: string, uri?: string): void {
  if (!appInsights) {
    return;
  }

  appInsights.trackPageView({ name, uri });
}

export function setAuthenticatedUser(userId: string): void {
  if (!appInsights) {
    return;
  }

  appInsights.setAuthenticatedUserContext(userId, undefined, true);
}
