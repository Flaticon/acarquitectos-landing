import { onRequestPost as __api_contact_js_onRequestPost } from "/home/verrospi/acarquitectos-landing/functions/api/contact.js"

export const routes = [
    {
      routePath: "/api/contact",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_contact_js_onRequestPost],
    },
  ]