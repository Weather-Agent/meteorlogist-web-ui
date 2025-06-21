import { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged } from '../services/authService';
import { CivicAuthProvider, useUser } from "@civic/auth/react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const civicClientId = import.meta.env.VITE_CIVIC_CLIENT_ID;

  return (
    <CivicAuthProvider
      clientId={civicClientId}
      onSignIn={(error) => {
        if (!error) {
          console.log('Successfully signed in with Civic');
        } else {
          console.error('Error signing in with Civic:', error);
        }
      }}
      onSignOut={() => {
        console.log('Signed out from Civic');
      }}
    >
      <InnerAuthProvider>
        {children}
      </InnerAuthProvider>
    </CivicAuthProvider>
  );
};

const InnerAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const civicAuth = useUser();

  useEffect(() => {
    if (civicAuth.user) {
      setUser({
        ...civicAuth.user,
        id: civicAuth.user.id,
        email: civicAuth.user.email || '',
        name: civicAuth.user.name || '',
        photoURL: civicAuth.user.picture || '',
      });
      setLoading(false);
    } else {
      const unsubscribe = onAuthStateChanged((legacyUser) => {
        setUser(legacyUser);
        setLoading(false);
      });

      return unsubscribe;
    }
  }, [civicAuth.user, civicAuth.isLoading]);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    signIn: civicAuth.signIn,
    signOut: civicAuth.signOut,
    authStatus: civicAuth.authStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
