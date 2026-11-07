// Admin authentication store (in-memory, session-based)
// In production replace with a real auth backend (JWT, Supabase Auth, etc.)

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';
const SESSION_KEY = 'tl_admin_session';

export type AdminSession = {
  username: string;
  loginAt: string;
};

export const adminAuth = {
  login(username: string, password: string): boolean {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const session: AdminSession = {
        username,
        loginAt: new Date().toISOString(),
      };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return true;
    }
    return false;
  },

  logout() {
    sessionStorage.removeItem(SESSION_KEY);
  },

  getSession(): AdminSession | null {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return this.getSession() !== null;
  },
};

