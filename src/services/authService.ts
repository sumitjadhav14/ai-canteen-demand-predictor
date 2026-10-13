import { User, UserRole } from '../types/auth';
import { UserDataService } from './userDataService';

const STORAGE_USERS_KEY = 'canteen_registered_users';
const STORAGE_CURRENT_USER_KEY = 'canteen_active_user';

interface StoredAccount {
  user: User;
  passwordHash: string; // Plain/hashed simulation for client-side storage
}

const DEFAULT_ACCOUNTS: StoredAccount[] = [
  {
    user: {
      id: 'usr-demo-1',
      name: 'Rajesh Sharma',
      email: 'admin@college.edu',
      role: 'Canteen Supervisor',
      department: 'Campus Dining Services',
      createdAt: '2026-01-15',
    },
    passwordHash: 'admin123',
  },
  {
    user: {
      id: 'usr-demo-2',
      name: 'Priya Verma',
      email: 'staff@college.edu',
      role: 'Kitchen Manager',
      department: 'Kitchen Operations',
      createdAt: '2026-03-10',
    },
    passwordHash: 'staff123',
  }
];

export class AuthService {
  private static getStoredAccounts(): StoredAccount[] {
    try {
      const data = localStorage.getItem(STORAGE_USERS_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load accounts:', e);
    }
    // initialize defaults
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
    return DEFAULT_ACCOUNTS;
  }

  private static saveStoredAccounts(accounts: StoredAccount[]): void {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(accounts));
  }

  public static getCurrentUser(): User | null {
    try {
      const data = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load current user:', e);
    }
    return null;
  }

  public static login(email: string, password: string): { success: boolean; error?: string; user?: User } {
    const accounts = this.getStoredAccounts();
    const found = accounts.find(
      (a) => a.user.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!found) {
      return { success: false, error: 'No account registered with this email address.' };
    }

    if (found.passwordHash !== password) {
      return { success: false, error: 'Incorrect password. Try again or reset password.' };
    }

    localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(found.user));
    return { success: true, user: found.user };
  }

  public static signup(
    name: string,
    email: string,
    role: UserRole,
    password: string
  ): { success: boolean; error?: string; user?: User } {
    const accounts = this.getStoredAccounts();
    const trimmedEmail = email.trim().toLowerCase();

    if (accounts.some((a) => a.user.email.toLowerCase() === trimmedEmail)) {
      return { success: false, error: 'An account with this email address already exists.' };
    }

    const newUser: User = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      email: trimmedEmail,
      role,
      department: 'Campus Dining Services',
      createdAt: new Date().toISOString().split('T')[0],
    };

    // Initialize completely fresh, empty data for the new user
    UserDataService.initNewUserData(newUser.id);

    const updated = [...accounts, { user: newUser, passwordHash: password }];
    this.saveStoredAccounts(updated);
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(newUser));

    return { success: true, user: newUser };
  }

  public static resetPassword(email: string, newPassword: string): { success: boolean; error?: string } {
    const accounts = this.getStoredAccounts();
    const trimmedEmail = email.trim().toLowerCase();
    const index = accounts.findIndex((a) => a.user.email.toLowerCase() === trimmedEmail);

    if (index === -1) {
      return { success: false, error: 'No registered user found with this email address.' };
    }

    accounts[index].passwordHash = newPassword;
    this.saveStoredAccounts(accounts);

    // If active user is this email, update active session
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.email.toLowerCase() === trimmedEmail) {
      localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(accounts[index].user));
    }

    return { success: true };
  }

  public static logout(): void {
    localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
  }
}
