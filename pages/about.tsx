import Layout from "@components/common/Layout";
import { GetStaticPropsContext } from "next";
import React from "react";

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
    <main className="bg-gradient-to-r from-accent-4 to-accent-9">
      <section className="pt-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-primary mb-4">
            About Curly Pottery
          </h1>
          <p className="text-lg  text-primary-2">
            Handcrafted ceramic pieces made with passion and creativity
          </p>
        </div>
      </section>

      <section className="sm:py-8 md:py-16 px-4 sm:px-6 lg:px-12">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-primary my-2">Our Story</h2>
            <p className="text-primary-2 ">
              At Curly Pottery, we believe in creating beautiful, functional
              ceramics that bring joy to everyday life. Each piece is carefully
              handcrafted with attention to detail and quality.
            </p>

            <h2 className="text-2xl font-bold text-primary my-2 mt-6">
              Our Mission
            </h2>
            <p className="text-primary-2 mb-6">
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
