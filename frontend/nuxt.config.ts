export default defineNuxtConfig({
  modules: ["@nuxt/ui"],

  css: ["~/assets/css/main.css"],

  runtimeConfig: {
    public: {
      apiBase: "http://localhost:3001",
    },
  },
});
