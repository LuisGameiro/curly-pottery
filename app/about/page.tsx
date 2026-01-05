import { Text } from "@components/ui";

export default function About() {
  return (
    <main className="bg-gradient-to-r from-background to-accent-1 py-8 ">
      <div className="px-2 sm:px-6 lg:px-12 max-w-3xl mx-auto space-y-8">
        <section className=" text-center">
          <Text variant="heading">About Curly Pottery</Text>
          <Text variant="body">
            Handcrafted ceramic pieces made with passion and creativity
          </Text>
        </section>

        <section className="space-y-6 prose prose-lg">
          <Text variant="sectionHeading">Our Story </Text>
          <Text variant="body">
            At Curly Pottery, we believe in creating beautiful, functional
            ceramics that bring joy to everyday life. Each piece is carefully
            handcrafted with attention to detail and quality.
          </Text>
          <Text variant="sectionHeading">Our Mission </Text>

          <Text variant="body">
            We're dedicated to producing sustainable, artisanal pottery that
            celebrates the beauty of natural materials and traditional
            craftsmanship.
          </Text>

          <Text variant="sectionHeading">   Why Choose Us</Text>

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
      </div>
    </main>
  );
}

