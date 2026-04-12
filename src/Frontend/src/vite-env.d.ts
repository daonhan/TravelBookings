/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_AZURE_AD_CLIENT_ID: string;
  readonly VITE_AZURE_AD_TENANT_ID: string;
  readonly VITE_AZURE_AD_REDIRECT_URI: string;
  readonly VITE_APP_CONFIG_ENDPOINT: string;
  readonly VITE_APPINSIGHTS_CONNECTION_STRING: string;
  readonly VITE_SIGNALR_HUB_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
