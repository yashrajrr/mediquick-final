
'use client';

import { useEffect, useState } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  initials: string;
  role: 'customer' | 'seller' | 'doctor' | null;
}

export default function ProfilePage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [profileData, setProfileData] = useState<ProfileData>({
        firstName: 'User',
        lastName: '',
        email: 'Loading...',
        initials: 'U',
        role: null,
    });
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
        },
    });

    useEffect(() => {
        const fetchUserData = async () => {
            if (user && firestore) {
                let firstName = '';
                let lastName = '';
                let email = user.email || '';
                let initials = '';
                let role: ProfileData['role'] = null;

                const userDocRef = doc(firestore, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    const data = userDoc.data();
                    firstName = data.firstName;
                    lastName = data.lastName;
                    initials = `${data.firstName?.[0] || ''}${data.lastName?.[0] || ''}`;
                    role = data.role;
                } else {
                    const sellerDocRef = doc(firestore, 'sellers', user.uid);
                    const sellerDoc = await getDoc(sellerDocRef);
                    if (sellerDoc.exists()) {
                        const data = sellerDoc.data();
                        const nameParts = (data.contactName || '').split(' ');
                        firstName = nameParts[0] || '';
                        lastName = nameParts.slice(1).join(' ') || '';
                        initials = data.contactName?.split(' ').map((n: string) => n[0]).join('') || '';
                        role = 'seller';
                    }
                }
                
                if (!firstName && user.displayName) {
                    const nameParts = user.displayName.split(' ');
                    firstName = nameParts[0] || 'User';
                    lastName = nameParts.slice(1).join(' ');
                }
                 if (!initials && (firstName || lastName)) {
                    initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.substring(0,2);
                }

                setProfileData({ firstName, lastName, email, initials, role });
                form.reset({ firstName, lastName });
            }
        };

        fetchUserData();
    }, [user, firestore, form]);

    const onSubmit = async (data: ProfileFormValues) => {
        if (!user || !profileData.role || profileData.role === 'doctor') {
            toast({ variant: 'destructive', title: 'Update failed', description: 'Cannot update this profile type.' });
            return;
        }
        
        setIsSubmitting(true);
        try {
            const collectionPath = profileData.role === 'seller' ? 'sellers' : 'users';
            const docRef = doc(firestore, collectionPath, user.uid);
            
            let dataToUpdate: any = {
                firstName: data.firstName,
                lastName: data.lastName,
            };

            if (profileData.role === 'seller') {
                dataToUpdate = { contactName: `${data.firstName} ${data.lastName}`};
            }

            await setDoc(docRef, dataToUpdate, { merge: true });

            setProfileData(prev => ({
                ...prev,
                firstName: data.firstName,
                lastName: data.lastName,
                initials: `${data.firstName?.[0] || ''}${data.lastName?.[0] || ''}`.substring(0,2),
            }));

            toast({ title: 'Profile Updated', description: 'Your information has been saved.' });
            setIsEditing(false);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message || 'Could not update profile.' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const name = `${profileData.firstName} ${profileData.lastName}`;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Manage your account and settings.</p>
      </header>
      <div className="flex justify-center pt-10">
        <div className="card">
            <div className="card__img"><svg xmlns="http://www.w3.org/2000/svg" width="100%"><rect fill="#ffffff" width="540" height="450"></rect><defs><linearGradient id="a" gradientUnits="userSpaceOnUse" x1="0" x2="0" y1="0" y2="100%" gradientTransform="rotate(222,648,379)"><stop offset="0" stopColor="#ffffff"></stop><stop offset="1" stopColor="#FC726E"></stop></linearGradient><pattern patternUnits="userSpaceOnUse" id="b" width="300" height="250" x="0" y="0" viewBox="0 0 1080 900"><g fillOpacity="0.5"><polygon fill="#444" points="90 150 0 300 180 300"></polygon><polygon points="90 150 180 0 0 0"></polygon><polygon fill="#AAA" points="270 150 360 0 180 0"></polygon><polygon fill="#DDD" points="450 150 360 300 540 300"></polygon><polygon fill="#999" points="450 150 540 0 360 0"></polygon><polygon points="630 150 540 300 720 300"></polygon><polygon fill="#DDD" points="630 150 720 0 540 0"></polygon><polygon fill="#444" points="810 150 720 300 900 300"></polygon><polygon fill="#FFF" points="810 150 900 0 720 0"></polygon><polygon fill="#DDD" points="990 150 900 300 1080 300"></polygon><polygon fill="#444" points="990 150 1080 0 900 0"></polygon><polygon fill="#DDD" points="90 450 0 600 180 600"></polygon><polygon points="90 450 180 300 0 300"></polygon><polygon fill="#666" points="270 450 180 600 360 600"></polygon><polygon fill="#AAA" points="270 450 360 300 180 300"></polygon><polygon fill="#DDD" points="450 450 360 600 540 600"></polygon><polygon fill="#999" points="450 450 540 300 360 300"></polygon><polygon fill="#999" points="630 450 540 600 720 600"></polygon><polygon fill="#FFF" points="630 450 720 300 540 300"></polygon><polygon points="810 450 720 600 900 600"></polygon><polygon fill="#DDD" points="810 450 900 300 720 300"></polygon><polygon fill="#AAA" points="990 450 900 600 1080 600"></polygon><polygon fill="#444" points="990 450 1080 300 900 300"></polygon><polygon fill="#222" points="90 750 0 900 180 900"></polygon><polygon points="270 750 180 900 360 900"></polygon><polygon fill="#DDD" points="270 750 360 600 180 600"></polygon><polygon points="450 750 540 600 360 600"></polygon><polygon points="630 750 540 900 720 900"></polygon><polygon fill="#444" points="630 750 720 600 540 600"></polygon><polygon fill="#AAA" points="810 750 720 900 900 900"></polygon><polygon fill="#666" points="810 750 900 600 720 600"></polygon><polygon fill="#999" points="990 750 900 900 1080 900"></polygon><polygon fill="#999" points="180 0 90 150 270 150"></polygon><polygon fill="#444" points="360 0 270 150 450 150"></polygon><polygon fill="#FFF" points="540 0 450 150 630 150"></polygon><polygon points="900 0 810 150 990 150"></polygon><polygon fill="#222" points="0 300 -90 450 90 450"></polygon><polygon fill="#FFF" points="0 300 90 150 -90 150"></polygon><polygon fill="#FFF" points="180 300 90 450 270 450"></polygon><polygon fill="#666" points="180 300 270 150 90 150"></polygon><polygon fill="#222" points="360 300 270 450 450 450"></polygon><polygon fill="#FFF" points="360 300 450 150 270 150"></polygon><polygon fill="#444" points="540 300 450 450 630 450"></polygon><polygon fill="#222" points="540 300 630 150 450 150"></polygon><polygon fill="#AAA" points="720 300 630 450 810 450"></polygon><polygon fill="#666" points="720 300 810 150 630 150"></polygon><polygon fill="#FFF" points="900 300 810 450 990 450"></polygon><polygon fill="#999" points="900 300 990 150 810 150"></polygon><polygon points="0 600 -90 750 90 750"></polygon><polygon fill="#666" points="0 600 90 450 -90 450"></polygon><polygon fill="#AAA" points="180 600 90 750 270 750"></polygon><polygon fill="#444" points="180 600 270 450 90 450"></polygon><polygon fill="#444" points="360 600 270 750 450 750"></polygon><polygon fill="#999" points="360 600 450 450 270 450"></polygon><polygon fill="#666" points="540 600 630 450 450 450"></polygon><polygon fill="#222" points="720 600 630 750 810 750"></polygon><polygon fill="#FFF" points="900 600 810 750 990 750"></polygon><polygon fill="#222" points="900 600 990 450 810 450"></polygon><polygon fill="#DDD" points="0 900 90 750 -90 750"></polygon><polygon fill="#444" points="180 900 270 750 90 750"></polygon><polygon fill="#FFF" points="360 900 450 750 270 750"></polygon><polygon fill="#AAA" points="540 900 630 750 450 750"></polygon><polygon fill="#FFF" points="720 900 810 750 630 750"></polygon><polygon fill="#222" points="900 900 990 750 810 750"></polygon><polygon fill="#222" points="1080 300 990 450 1170 450"></polygon><polygon fill="#FFF" points="1080 300 1170 150 990 150"></polygon><polygon points="1080 600 990 750 1170 750"></polygon><polygon fill="#666" points="1080 600 1170 450 990 450"></polygon><polygon fill="#DDD" points="1080 900 1170 750 990 750"></polygon></g></pattern></defs><rect x="0" y="0" fill="url(#a)" width="100%" height="100%"></rect><rect x="0" y="0" fill="url(#b)" width="100%" height="100%"></rect></svg></div>
            <div className="card__avatar">
                <div className="w-full h-full rounded-full bg-primary flex items-center justify-center text-primary-foreground text-4xl font-bold">
                  {profileData.initials}
                </div>
            </div>
            
            {isEditing ? (
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full px-4 flex flex-col items-center">
                        <div className="grid grid-cols-2 gap-2 w-full mt-14 mb-4">
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel className="text-xs">First Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} className="h-8"/>
                                    </FormControl>
                                    <FormMessage className="text-xs"/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel className="text-xs">Last Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} className="h-8"/>
                                    </FormControl>
                                    <FormMessage className="text-xs"/>
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="card__wrapper">
                            <Button type="button" variant="outline" className="card__btn" onClick={() => setIsEditing(false)}>Cancel</Button>
                            <Button type="submit" className="card__btn card__btn--primary" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                Save
                            </Button>
                        </div>
                    </form>
                 </Form>
            ) : (
                <>
                    <div className="card__title">{name}</div>
                    <div className="card__subtitle">{profileData.email}</div>
                    <div className="card__wrapper">
                        <button className="card__btn" onClick={() => setIsEditing(true)} disabled={profileData.role === 'doctor'}>Edit Profile</button>
                    </div>
                </>
            )}
            
        </div>
      </div>
      <style jsx>{`
        .card {
          --main-color: hsl(var(--primary));
          --submain-color: hsl(var(--muted-foreground));
          --bg-color: hsl(var(--card));
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          position: relative;
          width: 300px;
          height: auto;
          min-height: 384px;
          display: flex;
          flex-direction: column;
          align-items: center;
          border-radius: 20px;
          background: var(--bg-color);
          border: 1px solid hsl(var(--border));
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
          padding-bottom: 20px;
        }

        .card__img {
          height: 192px;
          width: 100%;
        }

        .card__img svg {
          height: 100%;
          border-radius: 20px 20px 0 0;
        }

        .card__avatar {
          position: absolute;
          width: 114px;
          height: 114px;
          background: var(--bg-color);
          border-radius: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          top: calc(50% - 114px); /* Adjusted for flexible height */
        }

        .card__avatar div {
          width: 100%;
          height: 100%;
        }

        .card__title {
          margin-top: 60px;
          font-weight: 500;
          font-size: 18px;
          color: hsl(var(--foreground));
        }

        .card__subtitle {
          margin-top: 10px;
          font-weight: 400;
          font-size: 15px;
          color: var(--submain-color);
        }

        .card__wrapper {
            margin-top: 25px;
            display: flex;
            gap: 10px;
        }

        .card__btn {
          width: 120px;
          height: 35px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 11px;
          text-transform: uppercase;
          transition: all 0.3s;
        }

        .card__btn {
            border: 2px solid var(--main-color);
            color: var(--main-color);
            background: var(--bg-color);
        }

        .card__btn.card__btn--primary {
            background: var(--main-color);
            color: hsl(var(--primary-foreground));
        }
        
        .card__btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .card__btn:not(:disabled):hover {
          background: var(--main-color);
          color: hsl(var(--primary-foreground));
        }
        .card__btn.card__btn--primary:not(:disabled):hover {
            background-color: hsl(var(--primary) / 0.9);
        }
      `}</style>
    </div>
  );
}
