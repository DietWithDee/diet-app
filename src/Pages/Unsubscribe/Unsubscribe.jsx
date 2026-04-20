import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebaseConfig';
import { Mail, CheckCircle, XCircle, Loader, ArrowLeft, Heart } from 'lucide-react';

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const handleUnsubscribe = async () => {
    if (!email) {
      setStatus('error');
      setMessage('No email address provided. Please use the link from your email.');
      return;
    }

    setStatus('loading');
    try {
      const unsubscribeUser = httpsCallable(functions, 'unsubscribeUser');
      const result = await unsubscribeUser({ email: email.toLowerCase() });
      
      if (result.data.success) {
        setStatus('success');
        setMessage(`You have been successfully removed from our mailing list.`);
      } else {
        throw new Error('Unsubscribe failed');
      }
    } catch (error) {
      console.error('Unsubscribe error:', error);
      setStatus('error');
      setMessage('Could not complete your request. Please try again later or contact us directly.');
    }
  };

  useEffect(() => {
    if (!email) {
      setStatus('error');
      setMessage('No email address provided. Please use the link from your email.');
    }
  }, [email]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="max-width-md w-full bg-white rounded-3xl shadow-2xl border border-green-100 overflow-hidden animate-in fade-in zoom-in duration-500 max-w-lg">
        <div className="bg-green-600 p-8 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30 backdrop-blur-sm">
                <Mail className="text-white" size={32} />
            </div>
            <h1 className="text-2xl font-black text-white">Email Preferences</h1>
        </div>

        <div className="p-8 text-center">
          {status === 'idle' && (
            <div className="space-y-6 py-4">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-600">
                <Mail size={48} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Unsubscribe?</h2>
                <p className="text-gray-600">
                  Are you sure you want to stop receiving newsletters at <span className="font-bold text-green-700">{email}</span>?
                </p>
              </div>
              <div className="pt-6 border-t border-gray-100 space-y-3">
                <button 
                  onClick={handleUnsubscribe}
                  className="w-full px-6 py-4 bg-green-600 text-white font-black rounded-xl hover:bg-green-700 transition-all shadow-lg active:scale-95"
                >
                  Confirm Unsubscribe
                </button>
                <Link 
                  to="/" 
                  className="w-full px-6 py-3 bg-white text-gray-400 font-medium rounded-xl hover:text-gray-600 transition-all block text-sm"
                >
                  I changed my mind, keep me subscribed
                </Link>
              </div>
            </div>
          )}

          {status === 'loading' && (
            <div className="space-y-4 py-12">
              <Loader className="animate-spin text-green-600 mx-auto" size={48} />
              <p className="text-gray-600 font-medium">Updating your preferences...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-6 py-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                <CheckCircle size={48} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Unsubscribed</h2>
                <p className="text-gray-600">{message}</p>
                <p className="text-sm text-gray-400 mt-4 leading-relaxed">
                  We're sorry to see you go! You can always re-subscribe on our homepage if you change your mind.
                </p>
              </div>
              <div className="pt-6 border-t border-gray-100">
                <Link 
                  to="/" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-lg active:scale-95"
                >
                  <ArrowLeft size={18} /> Back to Homepage
                </Link>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-6 py-4">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600">
                <XCircle size={48} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Wait a moment</h2>
                <p className="text-gray-600">{message}</p>
              </div>
              <div className="pt-6 border-t border-gray-100 flex flex-col gap-3">
                <Link 
                  to="/contactUs" 
                  className="w-full px-6 py-3 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-900 transition-all shadow-lg active:scale-95 text-center"
                >
                  Contact Support
                </Link>
                <Link 
                  to="/" 
                  className="w-full px-6 py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all text-center"
                >
                   Return Home
                </Link>
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 py-4 px-8 text-center border-t border-gray-100">
            <p className="text-xs text-gray-400 flex items-center justify-center gap-1 font-medium">
                Made with <Heart size={10} className="text-red-400 fill-red-400" /> by Diet With Dee
            </p>
        </div>
      </div>
    </div>
  );
};

export default Unsubscribe;
