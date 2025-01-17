'use client'

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { logIn } from '../actions';
import { toast } from 'sonner';
import AuthInput from './auth-input';
import { Button } from '@/components/ui/button';

export default function SignIn() {
    const [isDisable, setIsDisable] = useState<boolean>(true);
    const [email, setEmail] = useState<null | string>(null);
    const [password, setPassword] = useState<null | string>(null);
    const router = useRouter();

    useEffect(() => {
        if (email && password) {
            setIsDisable(false);
        } else {
            setIsDisable(true);
        }
    }, [email, password]);

    const handleSubmit = async () => {
        try {
            const response = await logIn(email!, password!);
            if (response?.redirect) {
                router.push(response.redirect);
            } else if (response?.error) {
                toast.error(response.error);
            }
        } catch (error) {
            toast.error('Internal Server Error');
        }
    };

    return (
        <div  style={{ backgroundColor: 'rgb(39 39 42 / var(--tw-bg-opacity))'}} className="min-h-screen flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-zinc-900 p-8 rounded-2xl shadow-lg transform transition-all duration-500">
                <h1 className="text-4xl font-bold text-center text-white mb-8">
                    Welcome Back
                </h1>
                <p className="text-center text-gray-400 mb-6">
                    Sign in to continue to <span className="text-lime-400">MailSpark AI</span>
                </p>
                <div className="space-y-4">
                    <AuthInput
                        type="email"
                        placeholder="Email"
                        name="Email"
                        className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-lime-500 shadow-sm"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <AuthInput
                        type="password"
                        placeholder="Password"
                        name="Password"
                        className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-lime-500 shadow-sm"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <Button
                    disabled={isDisable}
                    onClick={handleSubmit}
                    className={`w-full mt-6 py-3 text-lg font-semibold rounded-xl text-white transition-all ${
                        isDisable
                            ? 'bg-gray-600 cursor-not-allowed'
                            : 'bg-lime-400 hover:bg-lime-500 hover:shadow-lg'
                    }`}
                >
                    Sign In
                </Button>
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-400">Don't have an account?</p>
                    <a href="/auth/signup" className="text-sm text-lime-400 font-medium hover:underline">
                        Sign Up
                    </a>
                </div>
            </div>
        </div>
    );
}
