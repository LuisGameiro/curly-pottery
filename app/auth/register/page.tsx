'use client'

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Container, Text, Button, Input } from '@components/ui';
import Link from 'next/link';
import { UserPlus, ArrowRight, CheckCircle } from 'lucide-react';
import Layout from '@components/common/Layout';
import InputCheck from '@components/ui/Input/InputCheck';
import { useRouter } from 'next/router';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    password2: "",
    name: "",
    phone: "",
    acceptsMarketing: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    });


    if (res.ok) {
      // Automatically log in after registration
      signIn('credentials', {
        email: data.email as string,
        password: data.password as string,
        callbackUrl: '/user/profile',
      });

      router.push("/auth/login?registered=true");
    } else {
      const { message } = await res.json();
      setError(message || 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <Container >
      <header>
        <div className='justify-center text-center mx-auto'>
          <Text variant="heading">Create Account</Text>
          <Text variant='subHeading'>Join us for a faster checkout experience</Text>
        </div>
      </header>
      <main className='space-y-5 xl:max-w-xl mx-auto'>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <Input
            name="name"
            label="Name"
            placeholder="Jane"
            value={formData.name}
            onChange={handleChange}
            required />

          <Input
            name="email"
            label="Email Address"
            type="email"
            placeholder="jane@example.com"
            value={formData.email}
            onChange={handleChange}
            required />

          <Input name="password" label="Password" type="password"
            placeholder="••••••••" value={formData.password}
            onChange={handleChange} required />

          <Input name="password2" label="Confirm Password" type="password"
            placeholder="••••••••" value={formData.password2}
            onChange={handleChange} required />

          <InputCheck
            id="marketing"
            name="acceptsMarketing"
            value={formData.acceptsMarketing}
            onChange={handleChange}
            label='I’d like to receive updates on new collections, glaze drops, and special offers.'
          />

          <div className='h-12'>
            {error && <Text className="text-red-500 text-xs text-center font-medium">{error}</Text>}
          </div>
          
          <Button type="submit" width="100%" loading={loading} color="success">
            Create Account <ArrowRight size={16} className="ml-2" />
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t text-center">
          <Text className="text-sm">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-bold text-primary hover:underline">
              Log in
            </Link>
          </Text>
        </div>
      </main>

    </Container>
  );
}

RegisterPage.Layout = Layout;
