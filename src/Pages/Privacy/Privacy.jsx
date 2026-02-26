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
                            <h1 className='text-4xl lg:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-green-700 via-emerald-600 to-green-600 leading-tight font-black'>
                                Privacy Policy
                            </h1>
                            <div className='w-20 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full'></div>
                            <p className='text-lg text-gray-700 font-medium'>Diet with Dee</p>
                        </header>

                        <div className='prose prose-lg max-w-none text-gray-700 space-y-6'>
                            <p>Diet with Dee is committed to protecting your personal and health information. This Privacy Policy explains what information we collect, how it is used, and how it is safeguarded when you access or use <span className='font-semibold text-green-700'>dietwithdee.org</span>.</p>

                            <section>
                                <h2 className='text-2xl font-bold text-green-800 mb-3'>Information We Collect</h2>
                                <p>We may collect personal information including your name, email address, account login credentials, and payment details (processed securely through third-party providers).</p>
                                <p className='mt-2'>To deliver nutrition services, we may also collect health-related information such as height, weight, BMI results, dietary history, allergies, medical conditions, and consultation notes.</p>
                            </section>

                            <section>
                                <h2 className='text-2xl font-bold text-green-800 mb-3'>How Your Information Is Used</h2>
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
                                <h2 className='text-2xl font-bold text-green-800 mb-3'>Data Storage and Security</h2>
                                <p>We implement reasonable administrative and technical safeguards to protect your information. However, no internet-based system can guarantee absolute security.</p>
                            </section>

                            <section>
                                <h2 className='text-2xl font-bold text-green-800 mb-3'>Third-Party Services</h2>
                                <p>We use trusted third-party providers for analytics, payment processing, and communication. These providers process limited information in accordance with their respective privacy policies. <strong>We do not sell or trade your personal or health information.</strong></p>
                            </section>

                            <section>
                                <h2 className='text-2xl font-bold text-green-800 mb-3'>Data Retention</h2>
                                <p>Your information is retained only for as long as necessary to provide services, maintain records, or comply with applicable legal obligations, unless you request deletion of your account.</p>
                            </section>

                            <section>
                                <h2 className='text-2xl font-bold text-green-800 mb-3'>Your Rights</h2>
                                <p>You may request access to, correction of, or deletion of your personal data by contacting us at:</p>
                                <p className='mt-2 text-xl font-bold text-green-700 underline'>dietwithdee@gmail.com</p>
                            </section>

                            <section>
                                <h2 className='text-2xl font-bold text-green-800 mb-3'>Policy Updates</h2>
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
