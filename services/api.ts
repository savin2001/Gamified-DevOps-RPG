
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
    
    // Handle non-JSON responses (e.g., server crashes usually return HTML or text)
    const contentType = response.headers.get("content-type");
    let data;
    if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await response.json();
    } else {
        data = { message: await response.text() };
    }

    if (!response.ok) {
      throw new Error(data.message || 'API Request Failed');
    }

    return data as T;
  } catch (error: any) {
    // Only log if it's NOT a connection refused/network error (to keep console clean in offline mode)
    if (error.name !== 'TypeError' && !error.message?.includes('Failed to fetch')) {
        console.error('API Error:', error);
    }
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
