import React from 'react';
import SEO from '../../Components/SEO';

function Privacy() {
    return (
        <>
            <SEO
                title="Privacy Policy | DietWithDee"
                description="Privacy Policy for DietWithDee. Learn how we protect your personal and health information."
                url="/privacy"
            />
            <div className='py-20 bg-gradient-to-b from-white to-green-50 min-h-screen'>
                <div className='container mx-auto px-6 lg:px-12 max-w-4xl'>
                    <div className='space-y-8'>
                        <header className='space-y-4'>
                            <h1 className='text-4xl sm:text-5xl lg:text-6xl font-serif-cormorant font-normal text-stone-900 leading-[1.12] tracking-tight'>
                                Privacy Policy
                            </h1>
                            <div className='w-16 h-1 bg-[#F6841F] rounded-full'></div>
                            <p className='text-sm sm:text-base text-stone-600 font-light'>Diet with Dee</p>
                        </header>

                        <div className='prose prose-lg max-w-none text-stone-600 font-light space-y-6 leading-relaxed'>
                            <p>Diet with Dee is committed to protecting your personal and health information. This Privacy Policy explains what information we collect, how it is used, and how it is safeguarded when you access or use <span className='font-semibold'>dietwithdee.org</span>.</p>

                            <section>
                                <h2 className='text-2xl sm:text-3xl font-serif-cormorant font-normal text-stone-900 mb-3 tracking-tight'>Information We Collect</h2>
                                <p>We may collect personal information including your name, email address, account login credentials, and payment details (processed securely through third-party providers).</p>
                                <p className='mt-2'>To deliver nutrition services, we may also collect health-related information such as height, weight, BMI results, dietary history, allergies, medical conditions, and consultation notes.</p>
                            </section>

                            <section>
                                <h2 className='text-2xl sm:text-3xl font-serif-cormorant font-normal text-stone-900 mb-3 tracking-tight'>How Your Information Is Used</h2>
                                <p>Your information may be used to:</p>
                                <ul className='list-disc pl-6 space-y-2 mt-2'>
                                    <li>Provide consultations and personalized nutrition plans</li>
                                    <li>Generate BMI results and related health insights</li>
                                    <li>Maintain your account and service history</li>
                                    <li>Communicate service updates and relevant information</li>
                                    <li>Improve our services and user experience</li>
                                </ul>
                                <p className='mt-4'>We may use anonymized and aggregated data for research, analytics, and service improvement. This data does not identify individual users.</p>
                            </section>

                            <section>
                                <h2 className='text-2xl sm:text-3xl font-serif-cormorant font-normal text-stone-900 mb-3 tracking-tight'>Data Storage and Security</h2>
                                <p>We implement reasonable administrative and technical safeguards to protect your information. However, no internet-based system can guarantee absolute security.</p>
                            </section>

                            <section>
                                <h2 className='text-2xl sm:text-3xl font-serif-cormorant font-normal text-stone-900 mb-3 tracking-tight'>Third-Party Services</h2>
                                <p>We use trusted third-party providers for analytics, payment processing, and communication. These providers process limited information in accordance with their respective privacy policies. <strong>We do not sell or trade your personal or health information.</strong></p>
                            </section>

                            <section>
                                <h2 className='text-2xl sm:text-3xl font-serif-cormorant font-normal text-stone-900 mb-3 tracking-tight'>Data Retention</h2>
                                <p>Your information is retained only for as long as necessary to provide services, maintain records, or comply with applicable legal obligations, unless you request deletion of your account.</p>
                            </section>

                            <section>
                                <h2 className='text-2xl sm:text-3xl font-serif-cormorant font-normal text-stone-900 mb-3 tracking-tight'>Your Rights</h2>
                                <p>You may request access to, correction of, or deletion of your personal data by contacting us at:</p>
                                <p className='mt-2 text-lg font-medium text-stone-900 underline'>dietwithdee@gmail.com</p>
                            </section>

                            <section>
                                <h2 className='text-2xl sm:text-3xl font-serif-cormorant font-normal text-stone-900 mb-3 tracking-tight'>Policy Updates</h2>
                                <p>This Privacy Policy may be updated periodically. Continued use of the platform constitutes acceptance of any revised version.</p>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Privacy;
