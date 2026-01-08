'use client'

import { useEffect, useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { Container, Text, Button, Input } from '@components/ui';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="text-center py-20">Loading...</div>}>
            <LoginForm />
        </Suspense>
    );
}

function LoginForm() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (searchParams.get("registered") === "true") {
            setSuccess(true);
            const timer = setTimeout(() => {
                setSuccess(false);
                router.replace("/auth/login");
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [searchParams, router]);

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
            redirect: false,
        });

        if (result?.error) {
            setError('Invalid email or password');
            setLoading(false);
        } else {
            router.push('/shop');
            router.refresh();
        }
    };

    const handleGoogleLogin = () => {
        signIn('google', { callbackUrl: '/shop' });
    };

    return (
        <Container>
            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-center">
                    Registration successful! Please log in.
                </div>
            )}

            <header>
                <div className='justify-center text-center mx-auto mb-8'>
                    <Text variant="heading">Welcome Back</Text>
                    <Text variant='subHeading'>Log in to manage your orders</Text>
                </div>
            </header>

            <main className='space-y-5 xl:max-w-xl mx-auto'>
                <Button
                    variant="ghost"
                    width="100%"
                    onClick={handleGoogleLogin}
                >
                    <img src="/google-icon.svg" alt="Google" className="w-5 h-5 mr-2" />
                    Continue with Google
                </Button>

                <div className="my-5">
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-slate-400">Or email</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        name="email"
                        label="Email Address"
                        type="email"
                        placeholder="you@example.com"
                        required
                    />
                    <Input
                        label="Password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        required
                    />

                    <div className="flex justify-end">
                        <Link href="/auth/recovery" className="text-sm font-bold text-secondary hover:underline">
                            Forgot Password?
                        </Link>
                    </div>

                    {error && <Text className="text-red-500 text-xs text-center">{error}</Text>}

                    <Button type="submit" width="100%" loading={loading}>
                        Sign In <ArrowRight size={16} className="ml-2" />
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <Text className="text-sm">
                        Don't have an account?{' '}
                        <Link href="/auth/register" className="font-bold text-secondary hover:underline">
                            Sign up
                        </Link>
                    </Text>
                </div>
            </main>
        </Container>
    );
}

// 'use client'

// import { useEffect, useState } from 'react';
// import { signIn } from 'next-auth/react';
// import { Container, Text, Button, Input } from '@components/ui';
// import Link from 'next/link';
// import { Mail, Lock, ArrowRight } from 'lucide-react';
// import Layout from '@components/common/Layout';
// import { useRouter, useSearchParams } from 'next/navigation';

// export default function LoginPage() {
//     const [loading, setLoading] = useState(false);
//     const router = useRouter();
//     const searchParams = useSearchParams();
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [error, setError] = useState("");
//     const [success, setSuccess] = useState(false);

//     useEffect(() => {
//         if (searchParams.get("registered") === "true") {
//             setSuccess(true);
//             const timer = setTimeout(() => {
//                 setSuccess(false);
//                 router.replace("/auth/login");
//             }, 5000);

//             return () => clearTimeout(timer);
//         }
//     }, [searchParams, router]);

//     const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//         e.preventDefault();
//         setLoading(true);
//         setError('');

//         const target = e.currentTarget;
//         const email = target.email.value;
//         const password = target.password.value;

//         const result = await signIn('credentials', {
//             email,
//             password,
//             redirect: true,
//             callbackUrl: '/shop',
//         });

//         if (result?.error) {
//             setError('Invalid email or password');
//             setLoading(false);
//         }
//     };

//     const handleGoogleLogin = () => {
//         signIn('google', { callbackUrl: '/shop' });
//     };

//     return (
//         <Container >
//             <header>
//                 <div className='justify-center text-center mx-auto'>
//                     <Text variant="heading">Welcome Back</Text>
//                     <Text variant='subHeading'>Log in to manage your orders</Text>
//                 </div>
//             </header>

//             <main className='space-y-5 xl:max-w-xl mx-auto'>

//                 <Button
//                     variant="ghost"
//                     width="100%"
//                     onClick={handleGoogleLogin}
//                 >
//                     <img src="/google-icon.svg" alt="Google" className="w-5 h-5 mr-2" />
//                     Continue with Google
//                 </Button>

//                 <div className="my-5">
//                     <div className="relative flex justify-center text-xs uppercase"><span className=" px-2 text-slate-400">Or email</span></div>
//                 </div>

//                 <form onSubmit={handleSubmit} className="space-y-4">
//                     <Input
//                         name="email"
//                         label="Email Address"
//                         type="email"
//                         // value={email}
//                         // onChange={(e)=>setEmail}
//                         placeholder="you@example.com"
//                         required
//                     />
//                     <Input label="Password" name="password" type="password" placeholder="••••••••" required />

//                     <Link href="/auth/recovery ">
//                         <Text className="w-full justify-end  py-6 font-bold text-secondary hover:underline">
//                             Forgot Password?
//                         </Text>

//                     </Link>
//                     {error && <Text className="text-red-500 text-xs text-center">{error}</Text>}

//                     <Button type="submit" width="100%" loading={loading}>
//                         Sign In <ArrowRight size={16} className="ml-2" />
//                     </Button>
//                 </form>

//                 <div className="mt-6 text-center">
//                     <Text className="text-sm">
//                         Don't have an account?{' '}
//                         <Link href="/auth/register" className="font-bold text-secondary hover:underline">
//                             Sign up
//                         </Link>
//                     </Text>
//                 </div>
//             </main>
//         </Container>
//     );
// }

