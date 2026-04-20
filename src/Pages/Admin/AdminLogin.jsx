import React, { useState } from 'react';
import { AlertCircle, Loader } from 'lucide-react';
import { useAuth } from "../../AuthContext";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";

// Login Component
const AdminLogin = () => {
  const { signInWithGoogle, user, isAdmin, loading } = useAuth();
  const [error, setError] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);

  // If they are logged in but not an admin, show a message
  if (user && !isAdmin && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-red-100 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-red-500" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            Your account ({user.email}) does not have admin privileges.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all font-inter"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const handleGoogleLogin = async () => {
    setIsSigningIn(true);
    setError('');
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Admin login error:', err);
      setError('Failed to sign in. Please try again.');
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-green-100 text-center">
          <div className="mb-8">
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-emerald-600 mb-2 font-transcity">
              DietWithDee
            </h1>
            <p className="text-gray-500 font-medium">Admin Portal</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm mb-6 flex items-center justify-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={isSigningIn || loading}
            className="w-full py-3.5 bg-white border-2 border-gray-100 text-gray-800 font-bold rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3 disabled:opacity-60"
          >
            {isSigningIn || loading ? (
              <Loader className="animate-spin text-gray-400" size={20} />
            ) : (
              <>
                <FcGoogle size={24} />
                <span>Continue with Google</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
