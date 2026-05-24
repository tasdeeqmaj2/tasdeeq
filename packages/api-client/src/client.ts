const BASE_URL = (typeof process !== 'undefined' ? process.env.VITE_API_URL : undefined)
  ?? import.meta.env?.VITE_API_URL
  ?? 'http://localhost:3000/api/v1';

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message ?? 'Request failed');
  }

  return response.json();
}
