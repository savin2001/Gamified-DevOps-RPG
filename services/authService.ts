
import { UserProfile, UserStats } from '../types';
import { api } from './api';

const STORAGE_KEY_SESSION = 'devops_quest_active_user';
const STORAGE_KEY_TOKEN = 'auth_token';

interface AuthResponse {
    message: string;
    token: string;
    user: UserProfile;
    stats: UserStats;
}

export const registerUser = async (username: string, email: string, password: string): Promise<UserProfile> => {
    try {
        const response = await api.post<AuthResponse>('/auth/register', { username, email, password });
        
        handleSessionStart(response);
        
        return response.user;
    } catch (error) {
        throw error;
    }
};

export const loginUser = async (email: string, password: string): Promise<UserProfile> => {
    try {
        const response = await api.post<AuthResponse>('/auth/login', { email, password });
        
        handleSessionStart(response);
        
        return response.user;
    } catch (error) {
        throw error;
    }
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
