"use client";

import Layout from "@components/common/Layout";
import { Text, Button, Input, Container } from "@components/ui";
import InputTextArea from "@components/ui/Input/InputTextArea";
import React, { useState } from "react";

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
  const [message, setMessage] = useState("");

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
    setStatus("loading");
    setMessage("");

    try {
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
    <Container className="p-10">
      <header className="justify-center text-center mx-auto mb-4">
        <Text variant="heading">Contact Us</Text>
        <Text>
          We'd love to hear from you! Please reach out using the information
          below or fill out the contact form.
        </Text>
      </header>

      <section className=" lg:max-w-4xl mx-auto px-4 sm:px-8  md:flex ">
        <section className="w-full">
          <Text variant="sectionHeading">Our Details</Text>

          <ul className=" space-y-4">
            <li>
              📧 Email:{" "}
              <a
                href="mailto:info@curlypottery.com"
                className="hover:text-secondary/60"
              >
                info@curlypottery.com
              </a>
            </li>
            <li>
              📞 Phone:{" "}
              <a href="tel:+1234567890" className="hover:text-secondary/60">
                +1 (234) 567-890
              </a>
            </li>
            <li className="hover:text-secondary/60">📍 Address: London, UK</li>
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
