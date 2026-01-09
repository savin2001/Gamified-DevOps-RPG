
import { UserProfile } from '../types';

const STORAGE_KEY_USERS = 'devops_quest_users';
const STORAGE_KEY_SESSION = 'devops_quest_active_user';

export const getUsers = (): UserProfile[] => {
    const stored = localStorage.getItem(STORAGE_KEY_USERS);
    return stored ? JSON.parse(stored) : [];
};

export const saveUser = (user: UserProfile) => {
    const users = getUsers();
    // Update if exists, else add
    const existingIndex = users.findIndex(u => u.id === user.id);
    if (existingIndex >= 0) {
        users[existingIndex] = user;
    } else {
        users.push(user);
    }
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
};

export const registerUser = (username: string, email: string): UserProfile | null => {
    const users = getUsers();
    if (users.find(u => u.email === email)) {
        return null; // User already exists
    }

    const newUser: UserProfile = {
        id: 'user_' + Date.now(),
        username,
        email,
        role: users.length === 0 ? 'admin' : 'user', // First user is admin
        joinedAt: new Date().toISOString()
    };

    saveUser(newUser);
    
    // Automatically log in the user after registration
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(newUser));
    
    return newUser;
};

export const loginUser = (email: string): UserProfile | null => {
    const users = getUsers();
    const user = users.find(u => u.email === email);
    if (user) {
        localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(user));
        return user;
    }
    return null;
};

export const logoutUser = () => {
    localStorage.removeItem(STORAGE_KEY_SESSION);
};

export const getCurrentUser = (): UserProfile | null => {
    const stored = localStorage.getItem(STORAGE_KEY_SESSION);
    return stored ? JSON.parse(stored) : null;
};
