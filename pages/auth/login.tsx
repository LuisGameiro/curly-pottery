
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Container, Text, Button, Input } from '@components/ui';
import Link from 'next/link';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import Layout from '@components/common/Layout';

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const target = e.currentTarget;
        const email = target.email.value;
        const password = target.password.value;

        const result = await signIn('credentials', {
            email,
            password,
            redirect: true,
            callbackUrl: '/profile',
        });

        if (result?.error) {
            setError('Invalid email or password');
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        signIn('google', { callbackUrl: '/profile' });
    };

    return (
        <Container >
            <header>
                <div className="text-center mb-8">
                    <Text variant="heading">Welcome Back</Text>
                    <Text className="text-muted-foreground">Log in to manage your orders</Text>
                </div>
            </header>

            <main>

                <Button
                    variant="ghost"
                    width="100%"
                    onClick={handleGoogleLogin}
                    className="flex items-center gap-3 border-slate-200 hover:bg-slate-50 normal-case mb-6"
                >
                    <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
                    Continue with Google
                </Button>

                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400">Or email</span></div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        name="email"
                        label="Email Address"
                        type="email"
                        placeholder="you@example.com"
                        required
                    />
                    <div className="space-y-1">
                        <div className="flex justify-between">
                            <label className="text-xs font-bold uppercase text-slate-500">Password</label>
                            <Link href="/auth/recovery" className="text-xs text-primary hover:underline">
                                Forgot?
                            </Link>
                        </div>
                        <Input name="password" type="password" placeholder="••••••••" required />
                    </div>

                    {error && <Text className="text-red-500 text-xs text-center">{error}</Text>}

                    <Button type="submit" width="100%" loading={loading}>
                        Sign In <ArrowRight size={16} className="ml-2" />
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <Text className="text-sm">
                        Don't have an account?{' '}
                        <Link href="/auth/register" className="font-bold text-primary hover:underline">
                            Sign up
                        </Link>
                    </Text>
                </div>
            </main>
        </Container>
    );
}

LoginPage.layout = Layout