import Layout from "@components/common/Layout";
import { Container, Text, Button, Input } from '@components/ui';
import InputTextArea from "@components/ui/Input/InputTextArea";
import { GetStaticPropsContext } from "next";
import React, { useState } from "react";

interface FormData {
  name: string;
  email: string;
  message: string;
}

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

export default function Contacts() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      // 2. Send data to your Next.js API Route
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage(
          data.message ||
          "Thank you for your message! We will be in touch soon.",
        );
        // Clear the form after success
        setFormData({ name: "", email: "", message: "" });
      } else {
        setStatus("error");
        setMessage(
          data.error ||
          "There was an error sending your message. Please try again.",
        );
      }
    } catch (error) {
      console.error("Submission error:", error);
      setStatus("error");
      setMessage("An unexpected error occurred. Please check your connection.");
    }
  };

  return (
    <Container >
      <header>
        <div className="max-w-lg mx-auto text-center">

          <Text variant="heading">Contact Us</Text>

          <Text>
            We'd love to hear from you! Please reach out using the information
            below or fill out the contact form.
          </Text>
        </div>
      </header>

      <main className="sm:py-8 md:py-8 px-4 sm:px-6 mx-auto lg:px-12 w-full flex">
        <section >
          <Text variant='sectionHeading'>
            Our Details            
          </Text>

          <ul className="text-primary-2 space-y-2">
            <li>
              📧 Email:{" "}
              <a
                href="mailto:info@curlypottery.com"
                className="hover:text-primary-5"
              >
                info@curlypottery.com
              </a>
            </li>
            <li>
              📞 Phone:{" "}
              <a href="tel:+1234567890" className="hover:text-primary-5">
                +1 (234) 567-890
              </a>
            </li>
            <li>📍 Address: 123 Pottery Lane, Claytown, USA</li>
          </ul>
        </section>

        <section >
          <Text variant='sectionHeading'>
            Contact Form
          </Text>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="name"
              value={formData.name}
              onChange={handleChange}
              required
              type="text"
              id="name"
              name="name"
            />
            <Input
              label="email"
              value={formData.email}
              onChange={handleChange}
              required
              type="text"
              id="email"
              name="email"
            />
            <InputTextArea
              label="Your Message:"
              value={formData.message}
              onChange={handleChange}
              required
              id="message"
              name="message"
              rows={5}

            />


            <Button
              type="submit"
              variant="secondary"
              // Disable button while loading or on success/error to prevent double submission
              disabled={status === "loading" || status === "success"}
            >
              {status === "loading" ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </section>
      </main>
    </Container>

  );
}

Contacts.Layout = Layout;
