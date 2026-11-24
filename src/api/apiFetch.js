import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
const APP_TOKEN = process.env.EXPO_PUBLIC_API_APP_TOKEN || '';

async function request(endpoint, options = {}, onUnauthorized = null) {
  const sesionRaw = await AsyncStorage.getItem('sesion_deportes');
  const sesion = sesionRaw ? JSON.parse(sesionRaw) : {};

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Header 1: Autenticación de la aplicación cliente (x-api-token)[cite: 3]
  if (APP_TOKEN) {
    headers['x-api-token'] = APP_TOKEN;
  }

  // Header 2: Autorización del usuario autenticado (Bearer <token>)[cite: 3]
  const userToken = sesion.token || sesion.accessToken;
  if (userToken) {
    headers.Authorization = `Bearer ${userToken}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // 401 Unauthorized: limpiar sesión guardada y redirigir a Login[cite: 3]
  if (response.status === 401) {
    await AsyncStorage.removeItem('sesion_deportes');
    if (typeof onUnauthorized === 'function') {
      onUnauthorized();
    }
    throw new Error('Sesión expirada o no autorizada (401).');
  }

  // 403 Forbidden: acceso restringido[cite: 3]
  if (response.status === 403) {
    const errData = await response.json().catch(() => null);
    throw new Error(errData?.message || 'Acceso restringido (403).');
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