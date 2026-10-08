'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { register as registerUser } from '@/lib/api/auth/auth-api';
//import { useRouter } from 'next/navigation';

const registerSchema = z
    .object({
        name: z
            .string()
            .min(2, 'Name must have at least 2 characters'),

        email: z
            .string()
            .email('Invalid email'),

        password: z
            .string()
            .min(8, 'Password must have at least 8 characters'),

        confirmPassword: z
            .string()
            .min(8, 'Repeat password'),

    })
    .refine(
        (data) => data.password === data.confirmPassword,
        {
            message: 'Password is not matching',
            path: ['confirmPassword'],
        },
    );

type RegisterForm = z.infer<
    typeof registerSchema

>;

export default function RegisterPage() {
    //const router = useRouter();

    const [serverError, setServerError] =
        useState<string | null>(null);

    const [isSuccess, setIsSuccess] =
        useState(false);

    const {
        register,
        handleSubmit,
        formState: {
            errors,
            isSubmitting,
        },
    } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
    });

    useEffect(() => {
        if (!isSuccess) return;
        const timer = setTimeout(() => {
            window.location.href = '/login';
            //router.push('/login');
        }, 1500);

        return () => clearTimeout(timer);

    }, [isSuccess]);

    const onSubmit = async (
        data: RegisterForm,
    ) => {
        try {
            setServerError(null);

            await registerUser({
                name: data.name,
                email: data.email,
                password: data.password,
            });

            setIsSuccess(true);
        } catch (error) {
            setServerError(
                error instanceof Error
                    ? error.message
                    : 'Register unsuccessfully',
            );
        }


    };

    if (isSuccess) {
        return (<main className="flex min-h-screen items-center justify-center px-4"> <div className="w-full max-w-md text-center"> <div className="rounded-lg border p-8"> <h1 className="text-2xl font-bold text-green-600">
            Register successfully! </h1>

            <p className="mt-3 text-muted-foreground">
                Registered an account.
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
                Redirecting to login page...
            </p>
        </div>
        </div>
        </main>
        );

    }

    return (<main className="flex min-h-screen items-center justify-center px-4"> <div className="w-full max-w-md"> <h1 className="text-3xl font-bold">
        Habit Duo </h1>

        <p className="mt-2 text-muted-foreground">
            Register an account
        </p>

        <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-8 space-y-5"
        >
            <div>
                <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium"
                >
                    Name
                </label>

                <input
                    id="name"
                    type="text"
                    {...register('name')}
                    className="w-full rounded-md border px-3 py-2"
                    placeholder="Anne"
                />

                {errors.name && (
                    <p className="mt-1 text-sm text-red-500">
                        {errors.name.message}
                    </p>
                )}
            </div>

            <div>
                <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium"
                >
                    Email
                </label>

                <input
                    id="email"
                    type="email"
                    {...register('email')}
                    className="w-full rounded-md border px-3 py-2"
                    placeholder="you@example.com"
                />

                {errors.email && (
                    <p className="mt-1 text-sm text-red-500">
                        {errors.email.message}
                    </p>
                )}
            </div>

            <div>
                <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium"
                >
                    Password
                </label>

                <input
                    id="password"
                    type="password"
                    {...register('password')}
                    className="w-full rounded-md border px-3 py-2"
                    placeholder="••••••••"
                />

                {errors.password && (
                    <p className="mt-1 text-sm text-red-500">
                        {errors.password.message}
                    </p>
                )}
            </div>

            <div>
                <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-medium"
                >
                    Repeat password
                </label>

                <input
                    id="confirmPassword"
                    type="password"
                    {...register('confirmPassword')}
                    className="w-full rounded-md border px-3 py-2"
                    placeholder="••••••••"
                />

                {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-500">
                        {errors.confirmPassword.message}
                    </p>
                )}
            </div>

            {serverError && (
                <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                    {serverError}
                </p>
            )}

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
            >
                {isSubmitting
                    ? 'Registering...'
                    : 'Register'}
            </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
                href="/login"
                className="font-medium text-foreground underline"
            >
                Login
            </Link>
        </p>
    </div>
    </main>

    );
}
