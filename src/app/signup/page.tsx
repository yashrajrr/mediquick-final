
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

const signupSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  role: z.enum(['customer', 'seller', 'doctor'], { required_error: 'You must select a role.' }),
  pharmacyName: z.string().optional(),
}).refine(data => {
    if (data.role === 'seller') {
        return !!data.pharmacyName && data.pharmacyName.length > 0;
    }
    return true;
}, {
    message: 'Pharmacy name is required for sellers.',
    path: ['pharmacyName'],
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: 'customer',
      pharmacyName: '',
    },
  });

  const role = form.watch('role');

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      if (data.role === 'customer' || data.role === 'doctor') {
        await setDoc(doc(firestore, "users", user.uid), {
            uid: user.uid,
            firstName: data.firstName,
            lastName: data.lastName,
            displayName: `${data.firstName} ${data.lastName}`,
            email: data.email,
            role: data.role,
            createdAt: new Date().toISOString(),
        });
        if (data.role === 'doctor') {
             await setDoc(doc(firestore, "doctors", user.uid), {
                uid: user.uid,
                name: `Dr. ${data.firstName} ${data.lastName}`,
                email: data.email,
                specialties: [],
                qualifications: [],
                bio: "",
                consultationFee: 0,
                currency: "INR",
                rating: 0,
                ratingCount: 0,
                walletBalance: 0,
                createdAt: new Date().toISOString(),
            });
        }
      } else if (data.role === 'seller') {
         await setDoc(doc(firestore, "sellers", user.uid), {
            uid: user.uid,
            pharmacyName: data.pharmacyName,
            contactName: `${data.firstName} ${data.lastName}`,
            email: data.email,
            role: 'seller',
            createdAt: new Date().toISOString(),
            address: '',
            phoneNumber: '',
        });
      }

      toast({
        title: 'Account Created',
        description: "You have been successfully signed up!",
      });

      router.push('/dashboard');

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
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
            <div className="title">Welcome,<br /><span>sign up to continue</span></div>

             <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="w-full flex justify-center">
                  <FormControl>
                    <div className="radio-input">
                      <label className="label">
                        <input {...field} value="customer" name="role" id="customer" type="radio" checked={field.value === 'customer'} onChange={() => field.onChange('customer')} />
                        <span className="text">Customer</span>
                      </label>
                      <label className="label">
                        <input {...field} value="seller" name="role" id="seller" type="radio" checked={field.value === 'seller'} onChange={() => field.onChange('seller')} />
                        <span className="text">Seller</span>
                      </label>
                      <label className="label">
                        <input {...field} value="doctor" name="role" id="doctor" type="radio" checked={field.value === 'doctor'} onChange={() => field.onChange('doctor')} />
                        <span className="text">Doctor</span>
                      </label>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
              
              <div className="grid grid-cols-2 gap-4 w-full">
                <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                    <FormItem>
                        <FormControl>
                        <Input placeholder="First Name" {...field} className="input" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                    <FormItem>
                        <FormControl>
                        <Input placeholder="Last Name" {...field} className="input" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              </div>

             {role === 'seller' && (
                 <FormField
                    control={form.control}
                    name="pharmacyName"
                    render={({ field }) => (
                    <FormItem className="w-full">
                        <FormControl>
                        <Input placeholder="Pharmacy Name" {...field} className="input"/>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
             )}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <Input placeholder="Email" {...field} className="input" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <Input type="password" placeholder="Password" {...field} className="input" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

          <button type="submit" className="button-confirm" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : 'Create Account'}
          </button>
        </form>
      </Form>
      <div className="mt-4 text-center text-sm">
        Already have an account?{' '}
        <Link href="/login" className="underline">
          Sign in
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
                align-items: center;
                justify-content: center;
                gap: 20px;
                border-radius: 5px;
                border: 2px solid var(--main-color);
                box-shadow: 4px 4px var(--main-color);
                width: 100%;
                max-width: 400px;
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

            :global(.input) {
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

            :global(.input::placeholder) {
                color: var(--font-color-sub);
                opacity: 0.8;
            }

            :global(.input:focus) {
                border: 2px solid var(--input-focus);
            }

            .button-confirm {
                margin: 20px auto 0 auto;
                width: 150px;
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

            .button-confirm:active {
                box-shadow: 0px 0px var(--main-color);
                transform: translate(3px, 3px);
            }
            
            .radio-input {
              display: flex;
              align-items: center;
              gap: 2px;
              background-color: black;
              padding: 4px;
              border-radius: 10px;
            }

            .radio-input input {
              display: none;
            }

            .radio-input .label {
              width: 100px;
              height: 40px;
              background: linear-gradient(to bottom, #333333, rgb(36, 35, 35));
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 8px;
              transition: all 0.1s linear;
              border-top: 1px solid #4e4d4d;
              background-color: #333333;
              position: relative;
              cursor: pointer;
              box-shadow: 0px 17px 5px 1px rgba(0, 0, 0, 0.2);
            }

            .label:has(input[type="radio"]:checked) {
              box-shadow: 0px 0px 0px 0px rgba(0, 0, 0, 0);
              background: linear-gradient(to bottom, #1d1d1d, #1d1d1d);
              border-top: none;
              transform: translateY(4px);
            }
            
            .label:first-of-type {
              border-top-left-radius: 6px;
              border-bottom-left-radius: 6px;
            }

            .label:last-of-type {
              border-top-right-radius: 6px;
              border-bottom-right-radius: 6px;
            }

            .label::before {
              content: "";
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 103%;
              height: 100%;
              border-radius: 10px;
              background: linear-gradient(
                to bottom,
                transparent 10%,
                transparent,
                transparent 90%
              );
              transition: all 0.1s linear;
              z-index: -1;
            }

            .label:has(input[type="radio"]:checked)::before {
              background: linear-gradient(
                to bottom,
                transparent 10%,
                #cae2fd63,
                transparent 90%
              );
            }

            .label .text {
              color: #5a5a5a;
              font-size: 15px;
              line-height: 12px;
              padding: 0px;
              font-weight: 800;
              text-transform: uppercase;
              transition: all 0.1s linear;
              text-shadow:
                -1px -1px 1px rgb(224, 224, 224, 0.1),
                0px 2px 3px rgb(0, 0, 0, 0.3);
            }
            .label:has(input[type="radio"]:checked) .text {
              color: rgb(202, 226, 253);
              text-shadow: 0px 0px 12px #cae2fd;
            }
      `}</style>
    </div>
  );
}
