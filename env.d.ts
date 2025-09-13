/// <reference types="astro/client" />
/// <reference path="./src/worker-configuration.d.ts" />

// Extend the generated Env interface with our secrets
declare namespace Cloudflare {
  interface Env {
    RESEND_API_KEY_AC_FORMULARIO: string;
  }
}

// use a default runtime configuration (advanced mode).
type Runtime = import("@astrojs/cloudflare").Runtime<Env>;
declare namespace App {
  interface Locals extends Runtime {}
}