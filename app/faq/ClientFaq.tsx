'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Container, Text } from '@components/ui'
interface FAQItem {
  question: string
  answer: string
}

const faqData: FAQItem[] = [
  {
    question: 'How is my order shipped?',
    answer:
      'We ship via Royal Mail and tracking numbers should always be sent when your order is mailed. \
      If you didn’t get a tracking number, feel free to reach out! Orders ship within 3-5 business days of purchase.',
  },
  {
    question: 'What is the return policy?',
    answer:
      'We are unable to offer refund or return for purchased goods. However, if you have any problems with your order \
      please get in touch within 3 days and we will do our best to help. ',
  },
  {
    question: 'What if my item arrives broken during shipping?',
    answer:
      'Every piece is packed with care so that it arrives in good condition to you. However, if your order arrived damaged, \
      please take clear photos of the piece and packaging and contact us within 3 days from delivery at curly.pottery@gmail.com.\
       We’ll do our best to help.',
  },
  {
    question: 'How should I care for my pottery?',
    answer:
      'All Curly Pottery is handmade and hand painted with the most care and passion. Treat ceramics the same as any glass object.\
       They can break if dropped or knocked against any hard surface, avoid exposing your pottery to extreme  or sudden temperature\
        changes and avoid abrasive materials like metal or harsh sponges. ',
  },
  {
    question: 'Are the items microwave and dishwasher safe?',
    answer:
      'Yes, our pottery is microwave and dishwasher safe (unless stated otherwise in listings) but to give them a long life avoid\
       putting them in the microwave and use a gentle dishwasher program. ',
  },
  {
    question: 'Can I put the ceramics in the oven?',
    answer:
      'No, Curly Pottery is not oven safe. Do not place the pottery in an oven nor over a flame or on a hob as the item will crack\
       and break. ​',
  },
  {
    question: 'Can I fix a broken ceramic item?​',
    answer:
      'Yes, you can repair an item if broken but only to be used as a decorative piece as it will impact the safety of the\
       product. The pottery will lose its functionality and durability, and you won’t be able to use it in contact with food.',
  },
  {
    question: 'Will my handmade piece look exactly like the picture online?',
    answer:
      'All our pottery is handcrafted from beginning to end. Each piece is unique and may vary slightly in color,\
       shape and size due to the inherent unpredictability of firing and glazing, natural properties of clay and the subtle\
        differences that appear in the handmade crafting process. These slight variations are not flaws, but rather the unique\
         characteristics that give handmade pottery its value and charm.​',
  },
  // {
  //   question: "?",
  //   answer: ""
  // },
]

export default function ClientFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="space-y-5 md:max-w-4xl mx-auto">
      {faqData.map((item, index) => (
        <button
          key={index}
          onClick={() => toggleAccordion(index)}
          className="w-full"
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
              <Text className="pt-4  text-justify  text-">{item.answer}</Text>
            )}
          </Container>
        </button>
      ))}
    </section>
  )
}
