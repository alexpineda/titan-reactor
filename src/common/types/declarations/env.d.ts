/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_PLUGINS_RUNTIME_ENTRY: string
    readonly VITE_OFFICIAL_PLUGINS_SERVER_URL: string
    // more env variables...
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }