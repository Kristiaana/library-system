export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  const api = $fetch.create({
    baseURL: config.public.apiBase,

    onRequest({ options }) {
      // vienmēr normalizējam headers
      const headers = new Headers(options.headers as HeadersInit);

      // 👇 Dzelzs variants: token ņemam request brīdī no localStorage
      if (import.meta.client) {
        const t = localStorage.getItem("token");
        if (t) headers.set("Authorization", `Bearer ${t}`);
      }

      options.headers = headers;
    },

    async onResponseError({ response }) {
      if (response.status === 401 && import.meta.client) {
        localStorage.removeItem("token");
        await navigateTo("/login");
      }
    },
  });

  return { provide: { api } };
});
