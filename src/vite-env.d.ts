interface ImportMetaEnv {
  readonly VITE_API_KEY: string;
  readonly VITE_API_ENDPOINT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}