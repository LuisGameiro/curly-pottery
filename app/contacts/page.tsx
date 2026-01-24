import { Text, Container } from "@components/ui";
import ContactForm from "./ContactForm";
import constructMetadata from "@components/common/SEO";

export const metadata = constructMetadata({
  title: "Contact Us",
  description:
    "Get in touch with Curly Pottery for inquiries, custom orders, or any questions you may have. We are here to help and look forward to hearing from you.",
});

const contacts = {
  email: "curly.pottery@gmail.com",
  instagram: "curly_pottery",
  address: "london, uk",
};

export default function Contacts() {
  return (
    <Container className="p-10">
      <header className="justify-center text-center mx-auto mb-8">
        <Text variant="heading">Contact Us</Text>
        <Text className="mx-auto">
          We would love to hear from you! Please reach out using the information
          below or fill out the contact form.
        </Text>
      </header>

      <section className="grid gap-8 mx-auto px-4 sm:px-8 md:flex lg:max-w-4xl">
        <section className="w-full">
          <Text variant="sectionHeading">Our Details</Text>

          <ul className="space-y-4">
            <li>
              📧 Email:{" "}
              <a
                href={`mailto:${contacts.email}`}
                className="hover:text-secondary/60"
              >
                {contacts.email}
              </a>
            </li>
            <li>
              📸 instagram:{" "}
              <a
                href={
                  new URL(`https://www.instagram.com/${contacts.instagram}`)
                    .href
                }
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-secondary/60"
              >
                @{contacts.instagram}
              </a>
            </li>
            {/* <li>
              📞 Phone:{" "}
              <a href="tel:+1234567890" className="hover:text-secondary/60">
                +1 (234) 567-890
              </a>
            </li> */}
            <li className="hover:text-secondary/60">
              📍 Address: {contacts.address}
            </li>
          </ul>
        </section>

        <ContactForm />
      </section>
    </Container>
  );
}
