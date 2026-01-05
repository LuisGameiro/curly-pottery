"use client";

import React, { useState } from "react";
import { ChevronDown, Container } from "lucide-react";
import { Text } from "@components/ui";

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "What shipping methods do you offer?",
    answer:
      "We offer standard and express shipping options. Orders typically ship within 2-3 business days. You can track your order using the tracking number provided via email.",
  },
  {
    question: "Do you offer returns or exchanges?",
    answer:
      "Yes, we accept returns within 30 days of purchase. Items must be in original condition. Please contact our support team to initiate a return.",
  },
  {
    question: "Are your products handmade?",
    answer:
      "All our pottery pieces are handcrafted by curly artisans. Each piece is unique and may vary slightly in color and texture.",
  },
  {
    question: "How should I care for my pottery?",
    answer:
      "Hand wash your pottery with mild soap and warm water. Avoid sudden temperature changes and dishwashers. Apply food-safe glaze sealant periodically for longevity.",
  },
  {
    question: "Do you offer custom orders?",
    answer:
      "Yes! We accept custom pottery orders. Please email us with your specifications and we'll provide a quote and timeline.",
  },
];
export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <main className="bg-gradient-to-r from-background to-accent-1 py-8 ">
      <div className="px-2 sm:px-6 lg:px-12 max-w-3xl mx-auto space-y-8">

        <section className=" text-center">
          <Text variant="heading">Frequently Asked Questions</Text>
          <Text variant="body">Find answers to common questions about our pottery and services.</Text>
        </section>

        <section className="space-y-6 prose prose-lg">
          {faqData.map((item, index) => (
            <div key={index} className="bg-accent-0 rounded-lg shadow">
              <button
                onClick={() => toggleAccordion(index)}
                className="w-full px-6 pt-4 pb-2 flex items-center justify-between"
              >
                <Text variant="sectionHeading">
                  {item.question}
                </Text>
                <ChevronDown
                  className={`w-5 h-5 transition-transform ${openIndex === index ? "rotate-180" : ""
                    }`}
                />
              </button>

              {openIndex === index && (
                <div className="px-6 py-4 border-t rounded-b-lg border-border bg-accent-0">
                  <Text variant="body">{item.answer}</Text>
                </div>
              )}
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
