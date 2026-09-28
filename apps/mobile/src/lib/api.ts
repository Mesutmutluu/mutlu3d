import { useAuth } from '@clerk/expo';

import { API_BASE_URL } from './config';

export function useApi() {
  const { getToken } = useAuth();

  async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
    const token = await getToken();
    const headers = new Headers(init?.headers);
    if (token) headers.set('Authorization', `Bearer ${token}`);

    return fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  }

  return { apiFetch };
}
