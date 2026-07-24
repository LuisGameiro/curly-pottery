import { faqData } from './faq-data'
import FAQAccordion from './FAQAccordion'

export default function ClientFAQ() {
  return (
    <section
      className="space-y-5 md:max-w-2xl mx-auto"
      data-testid="faq-accordion"
    >
      <FAQAccordion items={faqData} />
    </section>
  )
}
