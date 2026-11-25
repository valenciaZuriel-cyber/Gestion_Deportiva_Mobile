import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://proyecto-idgs9-v1.onrender.com';
const APP_TOKEN = process.env.EXPO_PUBLIC_API_APP_TOKEN || '';

async function request(endpoint, options = {}, onUnauthorized) {
  const sesionRaw = await AsyncStorage.getItem('sesion_deportes');
  let sesion = {};
  try {
    sesion = sesionRaw ? JSON.parse(sesionRaw) : {};
  } catch {
    sesion = {};
  }

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (APP_TOKEN) {
    headers['x-api-token'] = APP_TOKEN;
  }

  const userToken = sesion.token || sesion.accessToken;
  if (userToken) {
    headers.Authorization = `Bearer ${userToken}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    await AsyncStorage.removeItem('sesion_deportes');
    const esLogin = endpoint.includes('/auth/login');
    if (!esLogin && typeof onUnauthorized === 'function') {
      onUnauthorized();
    }
    throw new Error(
      esLogin
        ? 'Correo o contraseña incorrectos (401).'
        : 'Sesión expirada o no autorizada (401).'
    );
  }

  if (response.status === 403) {
    const forbiddenData = await response.json().catch(() => null);
    throw new Error(forbiddenData?.message || 'Acceso restringido (403).');
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || `Error HTTP ${response.status}`);
  }

  return data;
}

export const apiFetch = {
  get: (endpoint, onUnauthorized) => request(endpoint, { method: 'GET' }, onUnauthorized),
  post: (endpoint, body, onUnauthorized) =>
    request(endpoint, { method: 'POST', body: JSON.stringify(body) }, onUnauthorized),
  put: (endpoint, body, onUnauthorized) =>
    request(endpoint, { method: 'PUT', body: JSON.stringify(body) }, onUnauthorized),
  patch: (endpoint, body, onUnauthorized) =>
    request(endpoint, { method: 'PATCH', body: JSON.stringify(body) }, onUnauthorized),
  delete: (endpoint, onUnauthorized) => request(endpoint, { method: 'DELETE' }, onUnauthorized),
};

export default apiFetch;