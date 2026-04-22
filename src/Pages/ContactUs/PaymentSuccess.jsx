import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { CheckCircle, ShieldAlert, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebaseConfig';
import SEO from '../../Components/SEO';
import { useToast } from '../../Contexts/ToastContext';

function PaymentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const [status, setStatus] = useState('verifying'); // verifying, processing, confirmed, error
  const [errorMessage, setErrorMessage] = useState('');
  const [verifiedConsultationType, setVerifiedConsultationType] = useState(null);

  // Pull saved data from localStorage safely
  const formData = useMemo(() => {
    try {
      const raw = localStorage.getItem('consultationFormData');
      return raw ? JSON.parse(raw) : { name: '', email: '', phone: '', message: '', consultationType: 'initial' };
    } catch {
      return { name: '', email: '', phone: '', message: '', consultationType: 'initial' };
    }
  }, []);

  const userResults = useMemo(() => {
    try {
      const raw = localStorage.getItem('userResults');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }, []);

  const processPaymentSequence = useCallback(async () => {
    try {
      setStatus('verifying');
      setErrorMessage('');

      const searchParams = new URLSearchParams(location.search);
      const reference = searchParams.get('reference') || searchParams.get('trxref');

      if (!reference) {
          setStatus('error');
          setErrorMessage('No payment reference found. Please return to the booking page.');
          return;
      }

      // Step 1: Verify Transaction
      const verifyFn = httpsCallable(functions, 'verifyPaystackTransaction');
      const verifyResult = await verifyFn({ reference });

      if (!verifyResult.data.success) {
        setStatus('error');
        const errorMsg = verifyResult.data.message || 'Payment verification failed.';

        // Provide specific error messages based on common Paystack error codes
        if (errorMsg.includes('cancelled') || errorMsg.includes('abandoned')) {
          setErrorMessage('Payment was cancelled. You can try again when ready.');
          showToast('Payment was cancelled', 'info');
        } else if (errorMsg.includes('declined') || errorMsg.includes('failed')) {
          setErrorMessage('Payment was declined by your bank. Please try a different payment method or contact your bank.');
          showToast('Payment declined by bank', 'error');
        } else {
          setErrorMessage(errorMsg);
          showToast('Payment verification failed', 'error');
        }
        return;
      }

      // Step 2: Process Booking (Save to Firestore & Send Emails)
      setStatus('processing');
      const processBookingFn = httpsCallable(functions, 'processBooking');

      // Derive type from amount to be robust against extra charges/fees
      const actualAmount = verifyResult.data.amount / 100;
      const verifiedType = actualAmount < 600 ? 'followup' : 'initial';
      setVerifiedConsultationType(verifiedType);

      const payload = {
          formData,
          userResults,
          reference,
          amount: actualAmount,
          consultationType: verifiedType
      };

      const processResult = await processBookingFn(payload);
      
      if (processResult.data.success) {
        // Clear sensitive local storage
        try {
            localStorage.removeItem('consultationFormData');
        } catch(e){}

        // Add a small "satisfaction" delay so the user sees the steps completing
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setStatus('confirmed');
        showToast('Booking confirmed successfully!', 'success');
      } else {
         setStatus('error');
         setErrorMessage('We verified your payment but hit an issue finalizing the booking. Please contact support.');
         showToast('Booking processing failed. Please contact support.', 'error');
      }

    } catch (error) {
      console.error('Payment sequence error:', error);
      setStatus('error');
      setErrorMessage('A network error occurred while verifying your payment. Please try again.');
      showToast('Network error during payment verification. Please try again.', 'error');
    }
  }, [location.search, formData, userResults, showToast]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mock') === 'success' && status === 'verifying') {
      const t1 = setTimeout(() => {
        setVerifiedConsultationType('initial');
        setStatus('processing');
        const t2 = setTimeout(() => {
          setStatus('confirmed');
          showToast('Booking confirmed successfully!', 'success');
        }, 2000);
        return () => clearTimeout(t2);
      }, 2000);
      return () => clearTimeout(t1);
    }

    if (status === 'confirmed') return;
    processPaymentSequence();
  }, [processPaymentSequence, status, showToast]);

  const isFollowUp = (verifiedConsultationType || formData.consultationType) === 'followup';

  if (status === 'verifying' || status === 'processing') {
    const steps = [
      { id: 'connecting', label: 'Connecting', completed: true },
      { id: 'verifying', label: 'Verifying Payment', completed: status === 'processing' },
      { id: 'processing', label: 'Processing Booking', completed: status === 'confirmed' },
      { id: 'sending', label: 'Sending Confirmation', completed: status === 'confirmed' },
    ];

    const currentStepIndex = status === 'verifying' ? 1 : 2;

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-10 text-center max-w-md w-full border border-green-100 space-y-8">
          <Loader2 className="w-16 h-16 text-green-600 animate-spin mx-auto" />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {status === 'verifying' ? 'Verifying Payment...' : 'Finalising Booking...'}
            </h2>
            <p className="text-gray-600 mt-2">
              {status === 'verifying' 
                ? 'Please wait, securely connecting to Paystack.' 
                : 'Payment received. Generating your booking confirmation...'}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <span>Step {currentStepIndex} of 4</span>
              <span className="text-gray-300">~10-15 seconds</span>
            </div>
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    step.completed 
                      ? 'bg-green-500 text-white' 
                      : index === currentStepIndex 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-gray-100 text-gray-400'
                  }`}>
                    {step.completed ? '✓' : index + 1}
                  </div>
                  <span className={`text-sm font-medium ${
                    step.completed 
                      ? 'text-green-600' 
                      : index === currentStepIndex 
                        ? 'text-gray-800' 
                        : 'text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-red-100 text-center space-y-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="text-red-600" size={40} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Verification Failed</h1>
            <p className="text-gray-600">
              {errorMessage}
            </p>
          </div>
          <div className="pt-4 space-y-3">
            <button
              onClick={processPaymentSequence}
              className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
            >
              <RefreshCw size={18} />
              Try Again
            </button>
            <button
              onClick={() => navigate('/contactUs')}
              className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-700 font-bold rounded-xl hover:bg-red-100 transition-colors"
            >
              <ArrowLeft size={18} />
              Return to Booking
            </button>
          </div>
        </div>
      </div>
    );
  }

  // status === 'confirmed'
  return (
    <><SEO title="Booking Confirmed" description="Thank you for booking with Diet With Dee!" url="/paymentSuccess" noindex />
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-12 flex items-center justify-center p-6">
      <div className="container mx-auto max-w-2xl">
        <div className="bg-white rounded-3xl shadow-2xl border border-green-50 overflow-hidden">
          
          {/* Header Section */}
          <div className="bg-green-600 p-8 text-center relative overflow-hidden">
             {/* Decorative circles */}
             <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-green-500 opacity-50"></div>
             <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 rounded-full bg-green-700 opacity-50"></div>
             
             <div className="relative z-10">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <CheckCircle className="text-green-600" size={48} />
                </div>
                {isFollowUp ? (
                  <div className="inline-block bg-green-800 text-green-100 text-xs font-bold px-4 py-1.5 rounded-full tracking-widest uppercase mb-3 shadow-sm border border-green-500/30">Follow-Up Consultation</div>
                ) : (
                  <div className="inline-block bg-green-800 text-green-100 text-xs font-bold px-4 py-1.5 rounded-full tracking-widest uppercase mb-3 shadow-sm border border-green-500/30">Initial Consultation</div>
                )}
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Booking Confirmed!</h1>
                <p className="text-green-50 text-lg font-medium">Thank you, {formData?.name?.split(' ')[0] || 'friend'}. We've received your payment safely.</p>
             </div>
          </div>

          {/* Body Section */}
          <div className="p-8 md:p-10 text-center space-y-8 relative">
            
            {/* What's next box */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                 What's Next?
              </div>
              <p className="text-gray-700 text-lg leading-relaxed mt-2">
                My team will reach out to you directly via phone or email within the next <strong>24 hours</strong> to schedule the exact date and time for our session.
              </p>
            </div>

            <div className="flex flex-col md:flex-row justify-center items-center gap-6 text-sm text-gray-600 bg-gray-50 rounded-xl p-4">
               <div>
                  <span className="block font-bold text-gray-900 mb-1">Consultation Hours</span>
                  Tuesday – Sunday<br/>10:00 AM – 3:00 PM
               </div>
               <div className="hidden md:block w-px h-12 bg-gray-200"></div>
               <div>
                  <span className="block font-bold text-gray-900 mb-1">Confirmation Email</span>
                  Sent to:<br/><span className="bg-white px-2 py-0.5 rounded border border-gray-200 font-medium">{formData?.email || 'your email'}</span>
               </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex flex-col items-center">
               <div className="max-w-md bg-green-50 rounded-2xl p-6 mb-8 border border-green-100 shadow-sm">
                 <h3 className="font-bold text-green-800 mb-2">💡 Pro Tip for Your Journey</h3>
                 <p className="text-gray-700 text-sm leading-relaxed">
                   While waiting for our session, we highly recommend <strong>creating an account</strong> in our <strong>My Journey</strong> portal. It makes it much easier to track your progress, save your assessment results, and access personalised nutrition content tailored just for you!
                 </p>
               </div>
               
               <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                 <button
                   onClick={() => navigate('/my-journey')}
                   className="px-10 py-4 bg-orange-500 text-white font-bold rounded-xl shadow-lg hover:bg-orange-700 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                 >
                   Go to My Journey
                 </button>
                 <button
                   onClick={() => navigate('/')}
                   className="px-10 py-4 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-all duration-300"
                 >
                   Back to Homepage
                 </button>
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default PaymentSuccess;
