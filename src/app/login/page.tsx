'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Pill, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  role: z.enum(['user', 'seller'], { required_error: 'You must select a role.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const auth = useAuth();
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      role: 'user',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      toast({
        title: 'Login Successful',
        description: "Welcome back!",
      });
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="form">
                <div className="title">Welcome,<br /><span>sign in to continue</span></div>
                
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                    <FormItem>
                        <FormControl>
                         <input type="email" placeholder="Email" {...field} name="email" className="input" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                    <FormItem>
                        <FormControl>
                        <input type="password" placeholder="Password" {...field} name="password" className="input" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                <button type="submit" className="button-confirm" disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin" /> : 'Let`s go →'}
                </button>
            </form>
        </Form>
        <div className="mt-4 text-center text-sm">
            Don't have an account?{' '}
            <Link href="/signup" className="underline">
                Sign up
            </Link>
        </div>

        <style jsx>{`
            .form {
                --input-focus: #2d8cf0;
                --font-color: #323232;
                --font-color-sub: #666;
                --bg-color: #fff;
                --main-color: #323232;
                padding: 20px;
                background: lightgrey;
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                justify-content: center;
                gap: 20px;
                border-radius: 5px;
                border: 2px solid var(--main-color);
                box-shadow: 4px 4px var(--main-color);
                width: 100%;
                max-width: 350px;
            }

            .title {
                color: var(--font-color);
                font-weight: 900;
                font-size: 20px;
                margin-bottom: 25px;
            }

            .title span {
                color: var(--font-color-sub);
                font-weight: 600;
                font-size: 17px;
            }

            .input {
                width: 100%;
                height: 40px;
                border-radius: 5px;
                border: 2px solid var(--main-color);
                background-color: var(--bg-color);
                box-shadow: 4px 4px var(--main-color);
                font-size: 15px;
                font-weight: 600;
                color: var(--font-color);
                padding: 5px 10px;
                outline: none;
            }

            .input::placeholder {
                color: var(--font-color-sub);
                opacity: 0.8;
            }

            .input:focus {
                border: 2px solid var(--input-focus);
            }

            .login-with {
                display: flex;
                gap: 20px;
            }

            .button-log {
                cursor: pointer;
                width: 40px;
                height: 40px;
                border-radius: 100%;
                border: 2px solid var(--main-color);
                background-color: var(--bg-color);
                box-shadow: 4px 4px var(--main-color);
                color: var(--font-color);
                font-size: 25px;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .icon {
                width: 24px;
                height: 24px;
                fill: var(--main-color);
            }

            .button-log:active, .button-confirm:active {
                box-shadow: 0px 0px var(--main-color);
                transform: translate(3px, 3px);
            }

            .button-confirm {
                margin: 50px auto 0 auto;
                width: 120px;
                height: 40px;
                border-radius: 5px;
                border: 2px solid var(--main-color);
                background-color: var(--bg-color);
                box-shadow: 4px 4px var(--main-color);
                font-size: 17px;
                font-weight: 600;
                color: var(--font-color);
                cursor: pointer;
                display: flex;
                justify-content: center;
                align-items: center;
            }
             .button-confirm:disabled {
                opacity: 0.5;
                cursor: not-allowed;
                box-shadow: 4px 4px var(--main-color);
                transform: none;
            }
      `}</style>
    </div>
  );
}
