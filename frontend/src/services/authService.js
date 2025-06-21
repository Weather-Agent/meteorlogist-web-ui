const API_URL = 'http://localhost:8000/api';

let currentUser = null;
let currentToken = null;
let authListeners = [];

const initAuth = () => {
  try {
    const savedUser = localStorage.getItem('auth_user');
    const savedToken = localStorage.getItem('auth_token');
    
    if (savedUser && savedToken) {
      currentUser = JSON.parse(savedUser);
      currentToken = savedToken;
      
      validateToken(savedToken).catch(() => {
        logout();
      });
    }
  } catch (e) {
    console.error('Error loading auth state:', e);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
  }
};

initAuth();

const notifyListeners = () => {
  authListeners.forEach(listener => {
    try {
      listener(currentUser);
    } catch (e) {
      console.error('Error in auth listener:', e);
    }
  });
};

const persistAuth = (user, token) => {
  if (user && token) {
    localStorage.setItem('auth_user', JSON.stringify(user));
    localStorage.setItem('auth_token', token);
    currentUser = user;
    currentToken = token;
  } else {
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
    currentUser = null;
    currentToken = null;
  }
};

const validateToken = async (token) => {
  try {
    console.log(`Validating token: ${token.substring(0, 10)}...`);
    
    const response = await fetch(`${API_URL}/auth/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token })
    });
    
    if (!response.ok) {
      console.warn(`Token validation failed with status: ${response.status}`);
      throw new Error('Invalid token');
    }
    
    const data = await response.json();
    console.log(`Token validation result: ${data.valid ? 'valid' : 'invalid'}`);
    
    if (data.valid && data.user) {
      currentUser = data.user;
    }
    
    return data.valid;
  } catch (e) {
    console.error('Error validating token:', e);
    
    if (e.message.includes("Failed to fetch") || e.message.includes("NetworkError")) {
      console.warn("Network error during token validation, maintaining session temporarily");
      return true;
    }
    
    return false;
  }
};

export const registerWithEmail = async (email, password, name) => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Registration failed');
    }
    
    const data = await response.json();
    persistAuth(data.user, data.token);
    notifyListeners();
    
    return data.user;
  } catch (e) {
    console.error('Registration error:', e);
    throw e;
  }
};

export const loginWithEmail = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Login failed');
    }
    
    const data = await response.json();
    persistAuth(data.user, data.token);
    notifyListeners();
    
    return data.user;
  } catch (e) {
    console.error('Login error:', e);
    throw e;
  }
};

export const logout = () => {
  persistAuth(null, null);
  notifyListeners();
};

export const getCurrentUser = () => {
  return currentUser;
};

export const getAuthToken = () => {
  return currentToken;
};

export const isAuthenticated = () => {
  return currentUser !== null;
};

export const onAuthStateChanged = (listener) => {
  authListeners.push(listener);
  listener(currentUser);
  return () => {
    authListeners = authListeners.filter(l => l !== listener);
  };
};
