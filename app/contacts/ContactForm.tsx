'use client'

import { Text, Button, Input } from '@components/ui'
import InputTextArea from '@components/ui/Input/InputTextArea'
import { ContactFormEmail } from '@lib/emails/ContactFormEmail'
import { sendEmail } from '@actions/email.actions'
import React, { useState } from 'react'
import { toast } from 'sonner'

interface FormData {
  name: string
  email: string
  message: string
}

export default function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: '',
  })
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      setStatus('loading')

      const response = await sendEmail({
        to: 'curly.pottery@gmail.com',
        subject: 'New Message',
        body: ContactFormEmail(formData),
      })

      if (response.data) {
        setStatus('success')
        toast('Thank you for your message! We will be in touch soon.')
        setFormData({ name: '', email: '', message: '' })
      } else {
        setStatus('error')
        toast('There was an error sending your message. Please try again.')
      }
    } catch (error) {
      console.error('Submission error:', error)
      setStatus('error')

      toast('An unexpected error occurred. Please check your connection.')
    }
  }

  return (
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
            disabled={status === 'loading' || status === 'success'}
          >
            {status === 'loading' ? 'Sending...' : 'Send Message'}
          </Button>
        </div>
      </form>
    </section>
  )
}
