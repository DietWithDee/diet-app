import React, { useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, Sparkles, ArrowLeft, ArrowRight, HelpCircle } from 'lucide-react';
import SEO from '../../Components/SEO';
import { plans } from '../../utils/plansData';

function CheckoutSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Parse plan id from query parameters
  const plan = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    const planId = searchParams.get('plan');
    if (!planId) return null;
    return plans.find(p => p.id === planId);
  }, [location.search]);

  return (
    <>
      <SEO 
        title={plan ? `Checkout: ${plan.title}` : "Checkout Success"}
        description="Your secure checkout has been opened in a new tab. Please complete your payment to download your custom diet guide."
        noindex
      />
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-24 px-4 flex items-center justify-center relative overflow-hidden">
        {/* Floating background blobs for premium feel */}
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-green-200/40 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-emerald-200/40 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto max-w-2xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className="bg-white rounded-3xl shadow-2xl border border-green-100 overflow-hidden"
          >
            {/* Elegant Header with Icon */}
            <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-6 -mt-6 w-28 h-28 rounded-full bg-white/10 blur-md"></div>
              <div className="absolute bottom-0 left-0 -ml-6 -mb-6 w-24 h-24 rounded-full bg-white/10 blur-md"></div>

              <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-xl relative">
                  <div className="absolute inset-0 bg-green-100 rounded-full scale-125 opacity-25"></div>
                  <CreditCard className="text-green-600" size={38} />
                </div>
                <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Checkout Opened!</h1>
                <p className="text-green-50 text-md max-w-md mx-auto">
                  We've successfully opened the secure Paystack payment gateway in a new tab.
                </p>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-8 md:p-10 space-y-8 flex flex-col items-center">
              {/* Plan Showcase Box */}
              {plan ? (
                <motion.div 
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  className="w-full bg-gradient-to-r from-green-50/50 to-emerald-50/50 border border-green-100 rounded-2xl p-5 flex items-center gap-5 shadow-sm"
                >
                  <div className={`w-20 h-20 rounded-xl bg-gradient-to-br ${plan.gradient} p-2 flex items-center justify-center shrink-0 shadow`}>
                    <img src={plan.img} alt={plan.title} className="h-full w-full object-contain rounded-lg" />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="text-[10px] font-black uppercase tracking-wider text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full inline-block mb-1">
                      Selected Plan
                    </span>
                    <h3 className="text-xl font-bold text-gray-800 leading-snug">{plan.title}</h3>
                    <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">{plan.Subtitle}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-2xl font-black text-green-700">{plan.price}</span>
                  </div>
                </motion.div>
              ) : (
                <div className="w-full bg-green-50/50 border border-green-100 rounded-2xl p-4 text-center">
                  <p className="text-gray-600 text-sm font-medium">Ready to complete your secure payment.</p>
                </div>
              )}

              {/* Step-by-Step Instructions */}
              <div className="bg-gray-50 rounded-2xl p-6 w-full border border-gray-100 text-left space-y-4 shadow-inner">
                <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider text-center border-b border-gray-200 pb-3 flex items-center justify-center gap-2">
                  <span>💡</span> What to Expect Next
                </h4>
                
                <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
                  <div className="flex gap-4">
                    <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 font-bold shrink-0 flex items-center justify-center text-xs">
                      1
                    </span>
                    <p className="pt-0.5">
                      <strong>Complete Checkout:</strong> Finish your payment securely on the opened Paystack tab.
                    </p>
                  </div>
                  
                  <div className="flex gap-4">
                    <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 font-bold shrink-0 flex items-center justify-center text-xs">
                      2
                    </span>
                    <p className="pt-0.5">
                      <strong>Instant Download:</strong> Click the direct <strong>Download</strong> button on the Paystack success page to save your PDF guide instantly.
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 font-bold shrink-0 flex items-center justify-center text-xs">
                      3
                    </span>
                    <p className="pt-0.5">
                      <strong>Check Your Inbox:</strong> Paystack will also send an automated email containing your receipt and a secure link to redownload your plan anytime.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action CTAs */}
              <div className="w-full space-y-3.5 pt-4">
                {/* 1st CTA: Back to Plans (Primary Button) */}
                <button
                  onClick={() => navigate('/plans')}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-[#F6841F] text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all text-base flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ArrowLeft size={18} />
                  Back to Plans
                </button>

                {/* 2nd CTA: Go to My Journey Portal (Secondary Button) */}
                <button
                  onClick={() => navigate('/my-journey')}
                  className="w-full py-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 active:scale-[0.99] transition-all text-base flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles size={18} className="text-orange-500" />
                  Go to My Journey Portal
                  <ArrowRight size={16} className="text-gray-400" />
                </button>
              </div>

              {/* Help & Support Footer */}
              <div className="pt-6 border-t border-gray-100 w-full text-center space-y-1">
                <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                  <HelpCircle size={14} className="text-gray-400" />
                  Questions or issues? Reach out to Nana Ama at
                </p>
                <a href="mailto:dietwdee@gmail.com" className="text-green-600 text-xs font-bold hover:underline">
                  dietwdee@gmail.com
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}

export default CheckoutSuccess;
