import Layout from '@components/common/Layout';
import { Button } from '@components/ui';
import { GetStaticPropsContext } from 'next';
import React, { useState } from 'react';

interface FormData {
    name: string;
    email: string;
    message: string;
}

export async function getStaticProps({
    preview,
    locale,
    locales,
}: GetStaticPropsContext) {
    const config = { locale, locales }

    return {
        props: {
        },
        revalidate: 2000,
    }
}

export default function Contacts() {
const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        message: '',
    });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            // 2. Send data to your Next.js API Route
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                setMessage(data.message || 'Thank you for your message! We will be in touch soon.');
                // Clear the form after success
                setFormData({ name: '', email: '', message: '' });
            } else {
                setStatus('error');
                setMessage(data.error || 'There was an error sending your message. Please try again.');
            }
        } catch (error) {
            console.error('Submission error:', error);
            setStatus('error');
            setMessage('An unexpected error occurred. Please check your connection.');
        }
    };
    
    return (
        <main className="bg-gradient-to-r from-accent-4 to-accent-9">
            <section className="pt-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-4xl font-bold text-primary mb-4">Contact Us</h1>
                    <p className="text-lg  text-primary-2">
                        We'd love to hear from you! Please reach out using the information below or fill out the contact form.
                    </p>
                </div>
            </section>

            <section className="sm:py-8 md:py-8 px-4 sm:px-6 lg:px-12">
                <div className="max-w-3xl mx-auto space-y-6">
                    <h2 className="text-2xl font-bold text-primary my-2 mt-6">Our Details</h2>
                    <ul className="text-primary-2 space-y-2">
                            <li>📧 Email: <a href="mailto:info@curlypottery.com" className="hover:text-primary-5">info@curlypottery.com</a></li>
                            <li>📞 Phone: <a href="tel:+1234567890" className="hover:text-primary-5">+1 (234) 567-890</a></li>
                            <li>📍 Address: 123 Pottery Lane, Claytown, USA</li>
                        </ul>
                </div>

            </section>

            <section className="sm:py-8 md:py-8 px-4 sm:px-6 lg:px-12 ">
                <div className="max-w-3xl mx-auto space-y-6">
                    <h2 className="text-2xl font-bold text-primary my-2 mt-6">Contact Form</h2>
                   <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="name" className='block text-primary-2 font-medium mb-1'>Full Name:</label>
                                <input
                                    className='w-full p-3 border border-gray-300 rounded-md bg-white text-gray-800 focus:ring-2 focus:ring-accent-5 focus:border-accent-5 transition duration-150 ease-in-out'
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className='block text-primary-2 font-medium mb-1' >Email Address:</label>
                                <input
                                    className='w-full p-3 border border-gray-300 rounded-md bg-white text-gray-800 focus:ring-2 focus:ring-accent-5 focus:border-accent-5 transition duration-150 ease-in-out'
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="message" className='block text-primary-2 font-medium mb-1'>Your Message:</label>
                                <textarea
                                    className='w-full p-3 border border-gray-300 rounded-md bg-white text-gray-800 focus:ring-2 focus:ring-accent-5 focus:border-accent-5 transition duration-150 ease-in-out'
                                    id="message"
                                    name="message"
                                    rows={5}
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <Button
                                type="submit"
                                // Disable button while loading or on success/error to prevent double submission
                                disabled={status === 'loading' || status === 'success'}
                            >
                                {status === 'loading' ? 'Sending...' : 'Send Message'}
                            </Button>
                        </form>
                </div>
            </section>
        </main>
    );
};


Contacts.Layout = Layout