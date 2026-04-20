import React, { useState } from 'react';
import { AlertCircle, Loader } from 'lucide-react';
import { useAuth } from "../../AuthContext";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";

// Login Component
const AdminLogin = () => {
  const { signInWithGoogle, sendOtp, verifyOtp, user, isAdmin, loading } = useAuth();
  const [error, setError] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [countryCode, setCountryCode] = useState('+233');

  const countryCodes = [
    { code: '+233', name: 'GH', flag: '🇬🇭' },
    { code: '+234', name: 'NG', flag: '🇳🇬' },
    { code: '+1', name: 'US', flag: '🇺🇸' },
  ];

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

  const handlePhoneLogin = async () => {
    if (!phoneNumber || phoneNumber.length < 5) {
      setError('Please enter a valid phone number.');
      return;
    }
    setIsSendingOtp(true);
    setError('');
    try {
      const fullPhone = phoneNumber.startsWith('+') ? phoneNumber : `${countryCode}${phoneNumber.replace(/^0/, '')}`;
      await sendOtp(fullPhone, 'admin-recaptcha');
      setShowOtpInput(true);
    } catch (err) {
      console.error('Admin phone OTP error:', err);
      setError('Failed to send verification code.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit code.');
      return;
    }
    setIsVerifyingOtp(true);
    setError('');
    try {
      await verifyOtp(otp);
    } catch (err) {
      console.error('Admin OTP verification error:', err);
      setError('Incorrect or expired code.');
    } finally {
      setIsVerifyingOtp(false);
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

          <div className="space-y-6">
            {showOtpInput ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <input 
                  type="text" 
                  placeholder="Verification Code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0,6))}
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 focus:border-green-500 rounded-xl outline-none text-center text-xl font-black tracking-widest transition-all"
                />
                <button
                  onClick={handleVerifyOtp}
                  disabled={isVerifyingOtp || loading}
                  className="w-full py-3.5 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 transition-all flex items-center justify-center gap-3 disabled:opacity-60"
                >
                  {isVerifyingOtp ? <Loader size={20} className="animate-spin" /> : "Verify Code"}
                </button>
                <button 
                  onClick={() => setShowOtpInput(false)}
                  className="text-xs text-gray-400 font-bold hover:text-green-600 transition-colors uppercase tracking-widest"
                >
                  Change Phone Number
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <select 
                      value={countryCode} 
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="bg-gray-50 border-2 border-gray-100 rounded-xl px-2 font-bold text-sm outline-none focus:border-green-500 transition-all"
                    >
                      {countryCodes.map(c => (
                        <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                      ))}
                    </select>
                    <input 
                      type="tel" 
                      placeholder="Admin Phone Number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      className="flex-1 px-4 py-3.5 bg-gray-50 border-2 border-gray-100 focus:border-green-500 rounded-xl outline-none font-bold transition-all"
                    />
                  </div>
                  <button
                    onClick={handlePhoneLogin}
                    disabled={isSendingOtp || loading}
                    className="w-full py-3.5 bg-black text-white font-bold rounded-xl shadow-xl hover:bg-gray-900 transition-all flex items-center justify-center gap-3 disabled:opacity-60"
                  >
                    {isSendingOtp ? <Loader size={20} className="animate-spin" /> : "Sign in with Phone"}
                  </button>
                </div>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                  <div className="relative flex justify-center"><span className="bg-white px-4 text-[10px] font-black text-gray-300 uppercase tracking-widest">OR</span></div>
                </div>

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
              </>
            )}
          </div>
          
          <div id="admin-recaptcha" className="mt-4"></div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
