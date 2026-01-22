export const useAuth = () => {
  const token = useState<string | null>("token", () => null);
  const isReady = useState<boolean>("auth-ready", () => false);

  function init() {
    if (import.meta.client) {
      token.value = localStorage.getItem("token");
    }
    isReady.value = true;
  }

  function setToken(t: string) {
    token.value = t;
    if (import.meta.client) localStorage.setItem("token", t);
  }

  function logout() {
    token.value = null;
    if (import.meta.client) localStorage.removeItem("token");
  }

  return { token, isReady, init, setToken, logout };
};
