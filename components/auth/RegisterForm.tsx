'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Text, Button, Input } from '@components/ui'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import InputCheckbox from '@components/ui/Input/InputCheckbox'
import { useRouter } from 'next/navigation'
import { registerUser } from 'actions/auth.actions'

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

    const formData = new FormData(e.currentTarget)
    const result = await registerUser(formData)

    if (!result.success) {
      setError(result.message)
      setLoading(false)
    } else {
      const email = formData.get('email') as string
      const password = formData.get('password') as string

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
  }

  return (
    <section className="space-y-5 md:max-w-lg mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="firstName"
          label="First Name"
          type="text"
          placeholder="Jane"
          value={formData.firstName}
          onChange={handleChange}
          required
        />

        <Input
          name="lastName"
          label="Last Name"
          type="text"
          placeholder="Doe"
          value={formData.lastName}
          onChange={handleChange}
          required
        />
        <Input
          name="email"
          label="Email"
          type="email"
          placeholder="jane@example.com"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <Input
          name="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          required
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
          label="I’d like to receive updates on new collections, glaze drops, and special offers."
        />

        <div className="h-8">
          {error && (
            <Text className="text-red text-xs text-center font-medium">
              {error}
            </Text>
          )}
        </div>

        <Button type="submit" width="100%" loading={loading} color="success">
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
