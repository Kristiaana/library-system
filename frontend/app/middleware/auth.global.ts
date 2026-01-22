export default defineNuxtRouteMiddleware(async (to) => {
  const { token, isReady, init } = useAuth();

  if (!isReady.value) {
    init();

    await nextTick();
  }

  const isLoggedIn = !!token.value;

  if (!isLoggedIn && to.path !== "/login") {
    return navigateTo("/login");
  }

  if (isLoggedIn && to.path === "/login") {
    return navigateTo("/readers");
  }
});
