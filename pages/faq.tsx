import React, { useState } from 'react';
import { ChevronDown, Container } from 'lucide-react';
import { Layout } from '@components/common'
import { GetStaticPropsContext } from 'next';

interface FAQItem {
    question: string;
    answer: string;
}

const faqData: FAQItem[] = [
    {
        question: 'What shipping methods do you offer?',
        answer: 'We offer standard and express shipping options. Orders typically ship within 2-3 business days. You can track your order using the tracking number provided via email.'
    },
    {
        question: 'Do you offer returns or exchanges?',
        answer: 'Yes, we accept returns within 30 days of purchase. Items must be in original condition. Please contact our support team to initiate a return.'
    },
    {
        question: 'Are your products handmade?',
        answer: 'All our pottery pieces are handcrafted by curly artisans. Each piece is unique and may vary slightly in color and texture.'
    },
    {
        question: 'How should I care for my pottery?',
        answer: 'Hand wash your pottery with mild soap and warm water. Avoid sudden temperature changes and dishwashers. Apply food-safe glaze sealant periodically for longevity.'
    },
    {
        question: 'Do you offer custom orders?',
        answer: 'Yes! We accept custom pottery orders. Please email us with your specifications and we\'ll provide a quote and timeline.'
    }
];

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

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleAccordion = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="bg-gradient-to-r from-accent-4 to-accent-9">
            <section className="pt-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-4xl font-bold text-primary mb-4">
                        Frequently Asked Questions
                    </h1>
                    <p className="text-lg  text-primary-2">
                        Find answers to common questions about our pottery and services.
                    </p>
                </div>
            </section>

            <section className="sm:py-8 md:py-16 px-4 sm:px-6 lg:px-12">
                <div className="max-w-3xl mx-auto space-y-6">
                    {faqData.map((item, index) => (
                        <div key={index} className="bg-accent-0 rounded-lg shadow">
                            <button
                                onClick={() => toggleAccordion(index)}
                                className="w-full px-6 py-4 flex items-center justify-between  transition-colors"
                            >
                                <h3 className="text-lg font-semibold text-left">
                                    {item.question}
                                </h3>
                                <ChevronDown
                                    className={`w-5 h-5 transition-transform ${openIndex === index ? 'transform rotate-180' : ''
                                        }`}
                                />
                            </button>

                            {openIndex === index && (
                                <div className="px-6 pb-4 border-t rounded-b-lg border-card bg-accent-0">
                                    <p className="text-primary">{item.answer}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>
        </div>

    );
}

FAQ.Layout = Layout