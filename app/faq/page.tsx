import { Container, Text } from "@components/ui";
import ClientFAQ from "./ClientFaq";
import constructMetadata from "@components/common/SEO/SEO";

export const metadata = constructMetadata({
  title: "FAQ - Frequently Asked Questions",
  description:
    "Find answers to frequently asked questions about Curly Pottery, including shipping, returns, care instructions, and more. We are here to help you with any inquiries you may have.",
});

export default function FAQ() {
  return (
    <Container className="p-10">
      <header className="justify-center text-center mx-auto mb-10">
        <Text variant="heading">Frequently Asked Questions</Text>
        <Text variant="body" className="mx-auto">
          Find answers to common questions about our pottery and services.
        </Text>
      </header>

      <ClientFAQ />
    </Container>
  );
}
