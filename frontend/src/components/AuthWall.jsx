import { useUser } from "@civic/auth/react";
import { useState, useEffect } from 'react';
import './authWall.css';

const AuthWall = ({ children }) => {
  const { user, isLoading, authStatus, signIn } = useUser();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (authStatus === 'authenticated' && !isLoading) {
      setShowContent(true);
    } else {
      setShowContent(false);
    }
  }, [authStatus, isLoading]);

  // Generate random floating particles
  const renderParticles = () => {
    const particles = [];
    const particleCount = 15;
    
    for (let i = 0; i < particleCount; i++) {
      const size = Math.floor(Math.random() * 80) + 30; // between 30px and 110px
      const left = `${Math.floor(Math.random() * 100)}%`;
      const top = `${Math.floor(Math.random() * 100)}%`;
      const delay = Math.random() * 5;
      const duration = Math.random() * 10 + 10; // between 10s and 20s
      
      particles.push(
        <div 
          key={i}
          className="floating-particle"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            left,
            top,
            animationDelay: `${delay}s`,
            animationDuration: `${duration}s`
          }}
        />
      );
    }
    
    return particles;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen animated-bg text-white">
        {renderParticles()}
        <div className="text-center z-10">
          <div className="text-blue-300 text-3xl font-bold mb-2">AI Meteorologist</div>
          <div className="text-xl font-medium mt-4">Preparing your weather experience...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen animated-bg text-white px-4">
        {renderParticles()}
        
        {/* App title and subtitle */}
        <div className="text-center mb-8 max-w-md w-full z-10">
          <h1 className="text-4xl sm:text-5xl font-bold mb-2 text-blue-300">AI Meteorologist</h1>
          <p className="text-base sm:text-xl text-slate-300">Your advanced weather tracking and visualization platform</p>
        </div>

        {/* Login Panel */}
        <div className="w-full max-w-md auth-card rounded-xl p-6 sm:p-8 z-10">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center text-white">Welcome</h2>
          <p className="text-slate-400 text-sm sm:text-base mb-5 sm:mb-6 text-center">
            Please sign in to access your personalized weather dashboard and emergency alerts.
          </p>

          <button
            onClick={() => signIn()}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-sm sm:text-base transition-colors flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0110 4.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.917.678 1.846 0 1.334-.012 2.41-.012 2.737 0 .267.18.578.688.48C17.137 18.163 20 14.418 20 10c0-5.522-4.478-10-10-10z" clipRule="evenodd" />
            </svg>
            Sign In with Civic
          </button>

          <p className="text-xs text-slate-500 mt-6 text-center">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    );
  }

  return showContent ? children : null;
};

export default AuthWall;
