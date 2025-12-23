import Layout from "@components/common/Layout";
import { GetStaticPropsContext } from "next";
import { Text } from "@components/ui";

export async function getStaticProps({
  preview,
  locale,
  locales,
}: GetStaticPropsContext) {
  const config = { locale, locales };

  return {
    props: {},
    revalidate: 2000,
  };
}

export default function About() {
  return (
    <main className="bg-gradient-to-r from-background to-accent-1">
      <section className="pt-8 px-2 sm:px-6 lg:px-8 max-w-3xl mx-auto text-center">
        <Text variant='pageHeading'>
          About Curly Pottery
        </Text>
        <Text variant='body'>
          Handcrafted ceramic pieces made with passion and creativity
        </Text>
      </section>

      <section className="sm:py-8 md:py-16 px-4 sm:px-6 lg:px-12">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="prose prose-lg max-w-none">
            <Text variant='sectionHeading'>
              Our Story  </Text>
            <Text variant='body'>
              At Curly Pottery, we believe in creating beautiful, functional
              ceramics that bring joy to everyday life. Each piece is carefully
              handcrafted with attention to detail and quality.
            </Text>
            <h2 className="text-2xl font-bold text-primary my-2 mt-6">
              Our Mission
            </h2>
            <p >
              We're dedicated to producing sustainable, artisanal pottery that
              celebrates the beauty of natural materials and traditional
              craftsmanship.
            </p>

            <h2 className="text-2xl font-bold text-primary my-2 mt-6">
              Why Choose Us
            </h2>
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
          </div>
        </div>
      </section>
    </main>
  );
}

About.Layout = Layout;
