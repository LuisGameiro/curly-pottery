'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Text, Button, Input } from '@components/ui'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import InputCheckbox from '@components/ui/Input/InputCheckbox'
import { useRouter } from 'next/navigation'
import { registerUser } from '@actions/customer.actions'
export default function RegisterForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password2: '',
    firstName: '',
    lastName: '',
    phone: '',
    acceptsMarketing: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.password2) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    const formDataValues = new FormData(e.currentTarget)
    try {
      const result = await registerUser(formDataValues)

      if (!result.success) {
        setError(result.message)
        setLoading(false)
      } else {
        const email = formDataValues.get('email') as string
        const password = formDataValues.get('password') as string

        const signInResult = await signIn('credentials', {
          email,
          password,
          redirect: false,
        })

        if (signInResult?.error) {
          router.push('/auth/login?registered=true')
        } else {
          router.push('/user')
        }
      }
    } catch (err) {
      console.error('Registration failed', err)
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <section
      className="space-y-5 md:max-w-lg mx-auto"
      data-testid="register-form"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="firstName"
          label="First Name"
          type="text"
          placeholder="Jane"
          value={formData.firstName}
          onChange={handleChange}
          required
          data-testid="register-firstname-input"
        />

        <Input
          name="lastName"
          label="Last Name"
          type="text"
          placeholder="Doe"
          value={formData.lastName}
          onChange={handleChange}
          required
          data-testid="register-lastname-input"
        />
        <Input
          name="email"
          label="Email"
          type="email"
          placeholder="jane@example.com"
          value={formData.email}
          onChange={handleChange}
          required
          data-testid="register-email-input"
        />

        <Input
          name="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          required
          data-testid="register-password-input"
        />

        <Input
          name="password2"
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          value={formData.password2}
          onChange={handleChange}
          required
        />

        <InputCheckbox
          id="marketing"
          name="acceptsMarketing"
          checked={formData.acceptsMarketing}
          onChange={handleChange}
          label="I'd like to receive updates on new collections, glaze drops, and special offers."
        />

        <div className="h-8">
          {error && (
            <Text
              className="text-red text-xs text-center font-medium"
              data-testid="register-error-message"
            >
              {error}
            </Text>
          )}
        </div>

        <Button
          type="submit"
          width="100%"
          loading={loading}
          color="success"
          data-testid="register-submit-btn"
        >
          Create Account <ArrowRight size={16} className="ml-2" />
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Text className="text-sm">
          Already have an account?{' '}
          <Link
            href="/auth/login"
            className="font-bold text-secondary hover:underline"
          >
            Log in
          </Link>
        </Text>
      </div>
    </section>
  )
}
