import { UserProfile } from '../types';

const API_URL = 'http://localhost:5000/api';

interface AuthResponse {
  message: string;
  token: string;
  user: UserProfile;
}

const request = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const token = localStorage.getItem('auth_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API Request Failed');
    }

    return data as T;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const api = {
  request,

  post<T>(endpoint: string, body: any) {
    return request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  get<T>(endpoint: string) {
    return request<T>(endpoint, { method: 'GET' });
  }
};