import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { CheckCircle, ShieldAlert, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebaseConfig';
import SEO from '../../Components/SEO';
import { useToast } from '../../Contexts/ToastContext';
import html2canvas from 'html2canvas';

function PaymentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const cardRef = useRef(null);

  const handleDownloadCard = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0c2a17'
      });
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      const link = document.createElement('a');
      link.download = `Fathers_Day_Voucher_${formData.fatherName?.replace(/\s+/g, '_') || 'Gift'}.jpg`;
      link.href = dataUrl;
      link.click();
      showToast('Gift Voucher downloaded!', 'success');
    } catch (err) {
      console.error('Failed to generate image:', err);
      showToast('Failed to download voucher card. Please try again.', 'error');
    }
  };

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
  const isFathersDay = !!formData.isFathersDayBooking;

  if (isFathersDay) {
    const searchParams = new URLSearchParams(location.search);
    const reference = searchParams.get('reference') || searchParams.get('trxref') || 'N/A';

    return (
      <>
        <SEO title="Gift Confirmed" description="Thank you for gifting Diet With Dee!" url="/paymentSuccess" noindex />
        <div className="min-h-screen bg-zinc-50 py-16 flex items-center justify-center p-4">
          <div className="max-w-xl w-full border border-zinc-200 bg-white shadow-sm rounded-none overflow-hidden space-y-6">
            
            {/* Header Section */}
            <div className="bg-zinc-950 p-8 text-center border-b border-zinc-200 text-white rounded-none">
              <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-none flex items-center justify-center mx-auto mb-4 shadow-sm">
                <CheckCircle className="text-amber-500" size={32} />
              </div>
              <div className="inline-block bg-zinc-800 text-zinc-300 text-[10px] font-bold px-3 py-1 rounded-none tracking-widest uppercase mb-2 border border-zinc-700">
                Father's Day Gift
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Gift Verified Successfully!</h1>
              <p className="text-zinc-400 text-xs mt-1">Thank you for giving the gift of healthy living.</p>
            </div>

            {/* Body Section */}
            <div className="px-8 pb-8 space-y-6">
              
              {/* Card Preview Container */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 text-left">Your Gift Voucher Preview</h3>
                
                {/* Visual Voucher representation */}
                <div 
                  ref={cardRef} 
                  className="w-full bg-gradient-to-br from-[#0c2a17] to-[#041108] border border-amber-500/40 p-6 text-white text-left relative overflow-hidden select-none"
                  style={{ minHeight: '260px' }}
                >
                  {/* Decorative corner patterns */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-amber-500/30"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-amber-500/30"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-amber-500/30"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-amber-500/30"></div>

                  <div className="space-y-6">
                    <div className="flex justify-between items-start border-b border-zinc-800 pb-3">
                      <div>
                        <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest leading-none">Gift Voucher</h4>
                        <h2 className="text-xl font-bold tracking-tight font-serif mt-1.5">Premium Nutrition Consultation</h2>
                      </div>
                      <div className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold border border-zinc-800 px-2 py-0.5">
                        Diet With Dee
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <span className="text-[9px] text-zinc-400 uppercase tracking-wider block leading-none">Presented To</span>
                        <span className="text-lg font-bold text-amber-100">{formData.fatherName}</span>
                      </div>

                      <div className="flex justify-between items-end">
                        <div>
                          <span className="text-[9px] text-zinc-400 uppercase tracking-wider block leading-none">Gifted By</span>
                          <span className="text-sm font-semibold text-zinc-200">{formData.buyerName}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-zinc-400 uppercase tracking-wider block leading-none">Ref Code</span>
                          <span className="text-xs font-mono font-bold text-amber-500">{reference?.substring(0, 8).toUpperCase()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-zinc-900 pt-3 flex justify-between items-center text-[8px] text-zinc-500 font-semibold uppercase tracking-wider">
                      <span>Accra, Ghana</span>
                      <span>Health, Vitality, Longevity</span>
                    </div>
                  </div>
                </div>

                {/* Download Button */}
                <button
                  onClick={handleDownloadCard}
                  className="w-full h-10 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs rounded-none transition-colors tracking-wide cursor-pointer flex items-center justify-center gap-1.5 border-none"
                >
                  Download Gift Voucher Card
                </button>
              </div>

              {/* Gift Outreach details */}
              <div className="border border-zinc-200 p-5 space-y-4 rounded-none">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 text-left">Outreach Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-left">
                  <div className="space-y-1">
                    <span className="text-zinc-400 font-semibold block">Giver / Buyer</span>
                    <span className="text-zinc-950 font-bold block">{formData.buyerName}</span>
                    <span className="text-zinc-500 block">{formData.buyerPhone}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-zinc-400 font-semibold block">Recipient Father</span>
                    <span className="text-zinc-950 font-bold block">{formData.fatherName}</span>
                    <span className="text-zinc-500 block">{formData.fatherPhone}</span>
                  </div>
                </div>
                
                {formData.isSurprise && (
                  <div className="bg-amber-50 border border-amber-200 p-3 flex items-center gap-2 text-xs text-amber-900 text-left font-semibold">
                    <span>🤫 Surprise Request:</span>
                    <span className="font-normal text-zinc-700">We will hold any WhatsApp outreach to the father until Father's Day morning.</span>
                  </div>
                )}
              </div>

              {/* What's next box */}
              <div className="border-l-2 border-amber-500 bg-amber-50/50 p-4 space-y-1 text-left">
                <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wide">Next Steps</h4>
                <p className="text-xs text-zinc-700 leading-relaxed">
                  Our team will reach out directly to coordinate scheduling.
                  {formData.isSurprise 
                    ? " We will coordinate with you first before contacting the father on Father's Day morning." 
                    : ` We will contact ${formData.fatherName} within the next 24 hours.`}
                </p>
              </div>

              {/* Back to Homepage Button */}
              <div className="pt-4 border-t border-zinc-100 flex flex-col gap-2">
                <button
                  onClick={() => navigate('/')}
                  className="w-full h-10 bg-zinc-900 hover:bg-zinc-900/90 text-zinc-50 font-bold text-xs rounded-none transition-colors tracking-wide cursor-pointer flex items-center justify-center border-none"
                >
                  Back to Homepage
                </button>
                <div className="text-center text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
                  Accra, Ghana • Diet With Dee
                </div>
              </div>

            </div>
          </div>
        </div>
      </>
    );
  }

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
