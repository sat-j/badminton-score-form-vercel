/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  // more VITE_ variables:
  // readonly VITE_SOME_OTHER: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
