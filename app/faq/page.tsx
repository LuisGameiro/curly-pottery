"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Container, Text } from "@components/ui";

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
    <Container className="p-10">
      <header className="justify-center text-center mx-auto mb-4">
        <Text variant="heading">Frequently Asked Questions</Text>
        <Text variant="body">
          Find answers to common questions about our pottery and services.
        </Text>
      </header>

      <section className="space-y-5 md:max-w-lg mx-auto">
        {faqData.map((item, index) => (
          <Container key={index} variant="box">
            <button
              onClick={() => toggleAccordion(index)}
              className="w-full  flex items-center justify-between"
            >
              <Text variant="bold">{item.question}</Text>
              <ChevronDown
                className={`w-5 h-5 transition-transform ${
                  openIndex === index ? "rotate-180" : ""
                }`}
              />
            </button>

            {openIndex === index && (
              <div className="pt-4 ">
                <Text variant="body">{item.answer}</Text>
              </div>
            )}
          </Container>
        ))}
      </section>
    </Container>
  );
}
