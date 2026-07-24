/**
 * Camada de comunicação com o servidor de progresso.
 * Em desenvolvimento, o Vite encaminha /api para http://localhost:3001.
 * Em produção, define VITE_API_URL com o endereço do servidor.
 */

const BASE = import.meta.env.VITE_API_URL || "";
const TOKEN_KEY = "daa-token";

export const getToken = () => {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setToken = (token) => {
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignorado */
  }
};

async function request(method, path, body) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);
  return data;
}

export const api = {
  register: (username, password) => request("POST", "/api/register", { username, password }),
  login: (username, password) => request("POST", "/api/login", { username, password }),
  logout: () => request("POST", "/api/logout"),
  getProgress: () => request("GET", "/api/progress"),
  putProgress: (progress) => request("PUT", "/api/progress", { progress }),
};
