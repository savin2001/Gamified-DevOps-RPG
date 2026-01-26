
import { UserProfile, UserStats } from '../types';
import { api } from './api';
import { INITIAL_STATS } from '../constants';

const STORAGE_KEY_SESSION = 'devops_quest_active_user';
const STORAGE_KEY_TOKEN = 'auth_token';

interface AuthResponse {
    message: string;
    token: string;
    user: UserProfile;
    stats: UserStats;
}

// --- Offline Fallback Logic ---
const mockRequest = async (type: 'login' | 'register', data: any): Promise<AuthResponse> => {
    console.warn("Backend unreachable. Falling back to offline demo mode.");
    
    // Simulate network delay for realism
    await new Promise(resolve => setTimeout(resolve, 600));

    const mockId = 'offline_' + (data.username || data.email.split('@')[0]);
    const isAdmin = data.email === 'admin@devops.com';
    
    // Create a mock user
    const user: UserProfile = {
        id: isAdmin ? 'sysadmin_01' : mockId,
        username: data.username || (isAdmin ? 'SysAdmin' : 'OfflineUser'),
        email: data.email,
        role: isAdmin ? 'admin' : 'user',
        joinedAt: new Date().toISOString()
    };

    return {
        message: 'Login successful (Offline Mode)',
        token: 'mock_jwt_token_offline',
        user,
        stats: { ...INITIAL_STATS, userId: user.id }
    };
}

export const registerUser = async (username: string, email: string, password: string): Promise<UserProfile> => {
    try {
        const response = await api.post<AuthResponse>('/auth/register', { username, email, password });
        handleSessionStart(response);
        return response.user;
    } catch (error: any) {
        // Fallback if server is down (Network Error or TypeError from fetch)
        if (isNetworkError(error)) {
             const response = await mockRequest('register', { username, email, password });
             handleSessionStart(response);
             return response.user;
        }
        throw error;
    }
};

export const loginUser = async (email: string, password: string): Promise<UserProfile> => {
    try {
        const response = await api.post<AuthResponse>('/auth/login', { email, password });
        handleSessionStart(response);
        return response.user;
    } catch (error: any) {
         // Fallback if server is down (Network Error or TypeError from fetch)
        if (isNetworkError(error)) {
             const response = await mockRequest('login', { email, password });
             handleSessionStart(response);
             return response.user;
        }
        throw error;
    }
};

const isNetworkError = (error: any): boolean => {
    return (
        error.name === 'TypeError' || // Standard fetch network error
        error.message?.includes('Failed to fetch') || 
        error.message?.includes('Network request failed') || 
        error.message?.includes('Connection refused')
    );
};

const handleSessionStart = (response: AuthResponse) => {
    localStorage.setItem(STORAGE_KEY_TOKEN, response.token);
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(response.user));
    
    // Cache the stats immediately so gamificationService can pick them up synchronously
    if (response.stats) {
        localStorage.setItem(`${response.user.id}_stats`, JSON.stringify(response.stats));
    }
};

export const logoutUser = () => {
    localStorage.removeItem(STORAGE_KEY_SESSION);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
};

export const getCurrentUser = (): UserProfile | null => {
    const stored = localStorage.getItem(STORAGE_KEY_SESSION);
    return stored ? JSON.parse(stored) : null;
};

// Deprecated: getUsers is no longer needed in API mode
export const getUsers = (): UserProfile[] => {
    return [];
};
