"use client";

import { Layout } from "@components/common";
import { Text, Button, Input, Container } from "@components/ui";
import InputTextArea from "@components/ui/Input/InputTextArea";
import { ContactFormEmail } from "@lib/emails/ContactFormEmail";
import { sendEmail } from "actions/email.actions";
import React, { useState } from "react";
import { toast } from "sonner";

const contacts = {
  email: "curly.pottery@gmail.com",
  instagram: "curly_pottery",
  address: "london, uk",
};

interface FormData {
  name: string;
  email: string;
  message: string;
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setStatus("loading");

      const response = await sendEmail(
        "curly.pottery@gmail.com",
        "New Message",
        ContactFormEmail(formData),
      );
      console.log(response);

      if (response.data) {
        setStatus("success");
        toast("Thank you for your message! We will be in touch soon.");
        setFormData({ name: "", email: "", message: "" });
      } else {
        setStatus("error");
        toast("There was an error sending your message. Please try again.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setStatus("error");

      toast("An unexpected error occurred. Please check your connection.");
    }
  };

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

        <section className="w-full">
          <Text variant="sectionHeading">Contact Form</Text>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Name"
              value={formData.name}
              onChange={handleChange}
              required
              type="text"
              id="name"
              name="name"
            />
            <Input
              label="Email"
              value={formData.email}
              onChange={handleChange}
              required
              type="email"
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
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="secondary"
                disabled={status === "loading" || status === "success"}
              >
                {status === "loading" ? "Sending..." : "Send Message"}
              </Button>
            </div>
          </form>
        </section>
      </section>
    </Container>
  );
}

Contacts.Layout = Layout;
