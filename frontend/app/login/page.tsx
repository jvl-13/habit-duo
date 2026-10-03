'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { saveToken } from '@/lib/auth/token-storage';
import { login } from '@/lib/api/auth/auth-api';

const loginSchema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Password needs at least 8 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (
        data: LoginForm,
    ) => {
        try {
            setServerError(null);

            const result = await login(data);

            saveToken(
                result.accessToken,
                result.refreshToken,
            );

            console.log('Logged in user: ', result.user);

            window.location.href = '/';
            
        } catch (error) {
            setServerError(
                error instanceof Error ? error.message : 'Login unsuccessfully',
            );
        }
    };

    return (
        <main className='flex min-h-screen items-center justify-center px-4'>
            <div className='w-full max-w-md'>
                <h1 className='text-3xl font-bold'>
                    Habit Duo
                </h1>

                <p className='mt-2 text-muted-foreground'>Register to your account</p>

                <form className='mt-8 space-y-5' onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <label htmlFor='email' className='mb-2 block text-sm font-medium'>Email</label>
                        <input 
                            id='email'
                            type='email'
                            {...register('email')}
                            className='w-full rounded-md border px-3 py-2'
                            placeholder='you@gmail.com'
                        />

                        {errors.email && (
                            <p className='mt-1 text-sm yexy-red-500'>{errors.email.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor='password' className='mb-2 block text-sm font-medium'>Password</label>
                        <input 
                            id='password' 
                            type='password' 
                            {...register('password')} 
                            className='w-full rounded-md border px-3 py-2' 
                            placeholder='••••••••'
                        />
                        
                        {errors.password && (
                            <p className='mt-1 text-sm text-red-500'>{errors.password.message}</p>
                        )}
                    </div>

                    {serverError && (
                        <p className='rounded-md bg-red-50 p-3 text-sm text-red-600'>{serverError}</p>
                    )}

                    <button type='submit' disabled={isSubmitting} className='w-full rounded-md bg-black px-4 py-2 text-white disabled:opacity-50'>
                        {isSubmitting ? 'Registering...' : 'Register'}
                    </button>
                </form>

            </div>

        </main>
    )
}