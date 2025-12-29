import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Container, Text, Button, Input } from '@components/ui';
import Link from 'next/link';
import { UserPlus, ArrowRight, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
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
        callbackUrl: '/profile',
      });
    } else {
      const { message } = await res.json();
      setError(message || 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <Container >
      <div className="bg-white p-8 rounded-3xl border shadow-sm">
        <div className="text-center mb-8">

          <Text variant="heading">Create Account</Text>
          <Text variant='subHeading'>Join us for a faster checkout experience</Text>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input name="firstName" label="First Name" placeholder="Jane" required />
            <Input name="lastName" label="Last Name" placeholder="Doe" required />
          </div>
          
          <Input name="email" label="Email Address" type="email" placeholder="jane@example.com" required />
          <Input name="password" label="Password" type="password" placeholder="••••••••" required />

          <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <input 
              type="checkbox" 
              name="acceptsMarketing" 
              id="marketing" 
              className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" 
            />
            <label htmlFor="marketing" className="text-xs text-slate-600 leading-tight">
              I’d like to receive updates on new collections, glaze drops, and special offers.
            </label>
          </div>

          {error && <Text className="text-red-500 text-xs text-center font-medium">{error}</Text>}

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
      </div>
    </Container>
  );
}