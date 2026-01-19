import { Container, Text } from "@components/ui";

export const metadata = {
  title: "About - Curly Pottery",
  description:
    "Learn about Curly Pottery, our story, mission, and why we are passionate about handcrafted ceramics.",
};

export default function About() {
  return (
    <Container className="p-10">
      <header className="justify-center text-center mx-auto mb-10">
        <Text variant="heading">About Curly Pottery</Text>
        <Text variant="body" className="mx-auto">
          Handcrafted ceramic pieces made with passion and creativity
        </Text>
      </header>

      <section className="space-y-5 md:max-w-lg mx-auto">
        <Text variant="sectionHeading">Our Story </Text>
        <Text variant="body" className="text-justify">
          At Curly Pottery, we believe in creating beautiful, functional
          ceramics that bring joy to everyday life. Each piece is carefully
          handcrafted with attention to detail and quality.
        </Text>
        <Text variant="sectionHeading">Our Mission </Text>

        <Text variant="body">
          We are dedicated to producing sustainable, artisanal pottery that
          celebrates the beauty of natural materials and traditional
          craftsmanship.
        </Text>

        <Text variant="sectionHeading"> Why Choose Us</Text>

        <ul className="space-y-3 text-priamry-2 mb-2">
          <li className="flex items-start">
            <span className="text-secondary mr-3">✓</span>
            <span>100% handmade by experienced artisans</span>
          </li>
          <li className="flex items-start">
            <span className="text-secondary mr-3">✓</span>
            <span>Sustainable and eco-friendly materials</span>
          </li>
          <li className="flex items-start">
            <span className="text-secondary mr-3">✓</span>
            <span>Unique designs that are one-of-a-kind</span>
          </li>
        </ul>
      </section>
    </Container>
  );
}
