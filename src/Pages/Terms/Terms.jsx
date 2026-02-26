import React from 'react';
import SEO from '../../Components/SEO';

function Terms() {
    return (
        <>
            <SEO
                title="Terms and Conditions | DietWithDee"
                description="Read the terms and conditions for using DietWithDee.org services."
                url="/terms"
            />
            <div className='py-20 bg-gradient-to-b from-white to-green-50 min-h-screen'>
                <div className='container mx-auto px-6 lg:px-12 max-w-4xl'>
                    <div className='space-y-8'>
                        <header className='space-y-4'>
                            <h1 className='text-4xl lg:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-green-700 via-emerald-600 to-green-600 leading-tight font-black'>
                                Terms and Conditions
                            </h1>
                            <div className='w-20 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full'></div>
                        </header>

                        <div className='prose prose-lg max-w-none text-gray-700 space-y-6'>
                            <section>
                                <h2 className='text-2xl font-bold text-green-800 mb-3'>Acceptance of Terms</h2>
                                <p>By accessing or using <span className='font-semibold'>dietwithdee.org</span>, you agree to comply with and be bound by these Terms and Conditions. If you do not agree, you should not use the platform.</p>
                            </section>

                            <section>
                                <h2 className='text-2xl font-bold text-green-800 mb-3'>Nature of Services</h2>
                                <ul className='list-disc pl-6 space-y-2'>
                                    <li>Diet with Dee is a digital nutrition and wellness platform providing dietetic services, nutrition education, and digital health tools.</li>
                                    <li>Services are delivered by licensed dietitians and qualified health professionals where applicable and are intended for guidance and education.</li>
                                    <li>The platform does not provide medical diagnosis, treatment, or emergency medical care.</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className='text-2xl font-bold text-green-800 mb-3'>Health and Medical Disclaimer</h2>
                                <p>All content and services provided on this platform are for nutritional guidance and educational purposes only and are not a substitute for medical advice, diagnosis, or treatment.</p>
                                <p className='mt-2 font-semibold italic text-green-700 underline'>Users are encouraged to consult a qualified medical professional before making significant health decisions.</p>
                            </section>

                            <section>
                                <h2 className='text-2xl font-bold text-green-800 mb-3'>User Accounts and Responsibilities</h2>
                                <p>Users are required to provide accurate and truthful information when creating accounts or using tools on the platform. You are responsible for maintaining the confidentiality of your login credentials and for all activities conducted under your account. Account sharing is prohibited. Accounts may be suspended or terminated where misuse, fraud, or policy violations occur.</p>
                            </section>

                            <section>
                                <h2 className='text-2xl font-bold text-green-800 mb-3'>Accuracy of Health Information</h2>
                                <p>Nutrition guidance, BMI outputs, and recommendations depend on the information provided by users. Diet with Dee is not responsible for inaccurate results or guidance arising from incomplete, misleading, or false information.</p>
                            </section>

                            <section>
                                <h2 className='text-2xl font-bold text-green-800 mb-3'>Use of BMI Tools</h2>
                                <p>BMI calculators and related tools are provided for informational purposes only and should not be interpreted as medical diagnosis. Professional medical advice should be sought before acting on any results.</p>
                            </section>

                            <section>
                                <h2 className='text-2xl font-bold text-green-800 mb-3'>Consultations</h2>
                                <p>Consultations may be booked as single sessions or through subscription packages. Missed appointments without prior notice will be forfeited. Rescheduling is permitted with at least 24 hours’ notice unless otherwise specified at the time of booking. Subscription services renew automatically unless cancelled before the renewal date.</p>
                            </section>

                            <section>
                                <h2 className='text-2xl font-bold text-green-800 mb-3'>Payments and Digital Products</h2>
                                <p>Payments are securely processed through third-party providers. Downloadable nutrition plans and other digital products are non-refundable once purchased, accessed, or downloaded. Consultation fees are non-refundable once the service has been delivered. Missed sessions without proper notice are not eligible for refunds. Digital plans and materials may not be redistributed, resold, copied, or shared.</p>
                            </section>

                            <section>
                                <h2 className='text-2xl font-bold text-green-800 mb-3'>Intellectual Property</h2>
                                <p>All content, nutrition plans, branding, tools, designs, and materials on this platform remain the property of Diet with Dee. Unauthorized reproduction, distribution, or commercial use is prohibited.</p>
                            </section>

                            <section>
                                <h2 className='text-2xl font-bold text-green-800 mb-3'>Account Suspension or Termination</h2>
                                <p>Diet with Dee reserves the right to suspend or terminate user accounts where misuse, fraudulent activity, policy breaches, or harmful conduct is identified.</p>
                            </section>

                            <section>
                                <h2 className='text-2xl font-bold text-green-800 mb-3'>Limitation of Liability</h2>
                                <p>Diet with Dee shall not be liable for health outcomes, decisions made based on BMI results, or interpretations of website content. To the fullest extent permitted by law, total liability shall not exceed the amount paid by the user for the specific service in question.</p>
                            </section>

                            <section>
                                <h2 className='text-2xl font-bold text-green-800 mb-3'>Indemnification</h2>
                                <p>Users agree to indemnify and hold harmless Diet with Dee from any claims, damages, or liabilities arising from misuse of services, inaccurate information provided by the user, or violations of these Terms.</p>
                            </section>

                            <section>
                                <h2 className='text-2xl font-bold text-green-800 mb-3'>Governing Law</h2>
                                <p>These Terms are governed by the laws of <span className='font-semibold'>Ghana</span>. Any disputes arising from the use of this platform shall be subject to the applicable legal processes within Ghana.</p>
                            </section>

                            <section>
                                <h2 className='text-2xl font-bold text-green-800 mb-3'>Changes to Terms</h2>
                                <p>We reserve the right to modify these Terms at any time. Continued use of the platform constitutes acceptance of any updated version.</p>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Terms;
