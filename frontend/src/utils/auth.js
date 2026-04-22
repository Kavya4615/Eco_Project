const API_BASE = 'http://localhost:5000';

// ─── Register new user via Flask + SQLite ─────────────────────────────────────
export const registerUser = async (user) => {
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });

    const data = await res.json();
    return data; // { success: bool, message: string }
  } catch (err) {
    console.error('registerUser error:', err);
    return { success: false, message: 'Could not connect to server. Is the Flask backend running?' };
  }
};

// ─── Login via Flask + SQLite ─────────────────────────────────────────────────
export const loginUser = async (email, password) => {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data.success && data.user) {
      // Store the session locally (only who is logged in, not all users)
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      return data.user;
    }

    return null;
  } catch (err) {
    console.error('loginUser error:', err);
    return null;
  }
};

// ─── Session helpers (still localStorage-backed) ─────────────────────────────
export const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem('currentUser'));
  } catch {
    return null;
  }
};

export const logoutUser = () => {
  localStorage.removeItem('currentUser');
};