'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Container, Text } from '@components/ui'
import type { FAQItem } from './faq-data'

interface FAQAccordionProps {
  items: FAQItem[]
}

export default function FAQAccordion({ items }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="space-y-5 md:max-w-2xl mx-auto">
      {items.map((item, index) => (
        <button
          key={index}
          onClick={() => toggleAccordion(index)}
          className="w-full"
          data-testid={`faq-item-${index}`}
        >
          <Container variant="box">
            <div className="w-full  flex items-center justify-between">
              <Text variant="bold">{item.question}</Text>
              <ChevronDown
                className={`w-5 h-5 transition-transform ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
              />
            </div>

            {openIndex === index && (
              <Text className="pt-2 text-justify leading-snug">
                {item.answer}
              </Text>
            )}
          </Container>
        </button>
      ))}
    </section>
  )
}
