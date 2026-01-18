import { Container, Text } from "@components/ui";

export default function PrivacyPolicy() {
  const lastUpdated = "January 18, 2026";

  return (
    <Container className="p-10">
      <header className="justify-center text-center mx-auto mb-10">
        <Text variant="heading">Privacy Policy</Text>
        <Text variant="body" className="mx-auto">
          How Curly Pottery handles and protects your personal data
        </Text>
        <p className="text-sm text-gray-500 mt-2">Last Updated: {lastUpdated}</p>
      </header>

      <section className="space-y-5 md:max-w-2xl mx-auto">
        <Text variant="sectionHeading">1. Data Controller</Text>
        <Text variant="body">
          Curly Pottery is the data controller for the personal information collected through this website. 
          For any GDPR-related inquiries, please contact us at: <strong>privacy@curlypottery.com</strong>.
        </Text>

        <Text variant="sectionHeading">2. Information We Collect</Text>
        <Text variant="body">
          In compliance with GDPR, we only collect data that is necessary for our service:
        </Text>
        <ul className="space-y-3 text-primary-2 ml-4">
          <li className="list-disc"><strong>Identity Data:</strong> Name and contact details for shipping handcrafted ceramics.</li>
          <li className="list-disc"><strong>Technical Data:</strong> IP address and browsing behavior to optimize your experience.</li>
          <li className="list-disc"><strong>Transaction Data:</strong> Details about payments and products you have purchased.</li>
        </ul>

        <Text variant="sectionHeading">3. Your GDPR Rights</Text>
        <Text variant="body">
          Under the General Data Protection Regulation, you have the following rights:
        </Text>
        <ul className="space-y-3 text-primary-2 mb-2">
          <li className="flex items-start">
            <span className="text-secondary mr-3">✓</span>
            <span><strong>Right to Access:</strong> Request a copy of your personal data.</span>
          </li>
          <li className="flex items-start">
            <span className="text-secondary mr-3">✓</span>
            <span><strong>Right to Erasure:</strong> Request that we delete your data ("Right to be forgotten").</span>
          </li>
          <li className="flex items-start">
            <span className="text-secondary mr-3">✓</span>
            <span><strong>Right to Rectification:</strong> Ask us to correct inaccurate information.</span>
          </li>
        </ul>
      </section>
    </Container>
  );
}