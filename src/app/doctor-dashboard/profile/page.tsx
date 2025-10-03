
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(1, "Name is required."),
  specialties: z.array(z.string()).min(1, "At least one specialty is required."),
  qualifications: z.array(z.string()).min(1, "At least one qualification is required."),
  bio: z.string().max(500, "Bio cannot exceed 500 characters.").optional(),
  consultationFee: z.preprocess(
    (val) => Number(String(val)),
    z.number().min(0, 'Fee cannot be negative.')
  ),
  currency: z.string().default('INR'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const defaultDoctorProfile = {
    specialties: ['General Physician'],
    qualifications: ['MBBS'],
    bio: 'Experienced general physician dedicated to providing comprehensive patient care.',
    consultationFee: 500,
}

export default function DoctorProfilePage() {
    const { toast } = useToast();
    const { user } = useUser();
    const firestore = useFirestore();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [specialtyInput, setSpecialtyInput] = useState('');
    const [qualificationInput, setQualificationInput] = useState('');

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: '',
            specialties: [],
            qualifications: [],
            bio: '',
            consultationFee: 0,
            currency: 'INR',
        },
    });

    useEffect(() => {
        const fetchProfile = async () => {
            if (user && firestore) {
                setIsFetching(true);
                const docRef = doc(firestore, 'doctors', user.uid);
                try {
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        // If profile is new/empty, pre-fill with demo data
                        if (!data.specialties || data.specialties.length === 0) {
                            form.reset({
                                name: data.name || '',
                                ...defaultDoctorProfile,
                                currency: data.currency || 'INR',
                            });
                        } else {
                            form.reset({
                                name: data.name || '',
                                specialties: data.specialties || [],
                                qualifications: data.qualifications || [],
                                bio: data.bio || '',
                                consultationFee: data.consultationFee || 0,
                                currency: data.currency || 'INR',
                            });
                        }
                    }
                } catch (error) {
                    console.error("Error fetching doctor profile:", error);
                    toast({
                        variant: 'destructive',
                        title: 'Error',
                        description: 'Could not fetch your profile data.'
                    });
                }
                setIsFetching(false);
            }
        };
        fetchProfile();
    }, [user, firestore, form, toast]);

    const onSubmit = async (data: ProfileFormValues) => {
        setIsLoading(true);
        if (!user) {
            toast({ variant: 'destructive', title: 'Not authenticated' });
            setIsLoading(false);
            return;
        }
        try {
            const docRef = doc(firestore, 'doctors', user.uid);
            await setDoc(docRef, data, { merge: true });
            toast({
                title: 'Profile Updated',
                description: 'Your professional profile has been successfully updated.',
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Update Failed',
                description: error.message || 'An error occurred while updating your profile.',
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const addTag = (type: 'specialties' | 'qualifications') => {
        const value = type === 'specialties' ? specialtyInput.trim() : qualificationInput.trim();
        if (value) {
            const currentTags = form.getValues(type);
            if (!currentTags.includes(value)) {
                form.setValue(type, [...currentTags, value]);
            }
            if (type === 'specialties') setSpecialtyInput('');
            else setQualificationInput('');
        }
    };

    const removeTag = (type: 'specialties' | 'qualifications', tagToRemove: string) => {
        const currentTags = form.getValues(type);
        form.setValue(type, currentTags.filter(tag => tag !== tagToRemove));
    };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Your Profile</h1>
        <p className="text-muted-foreground">Manage your professional information and availability.</p>
      </header>
      
      <Card>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardHeader>
                  <CardTitle>Profile Details</CardTitle>
                  <CardDescription>This information will be visible to patients.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isFetching ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="animate-spin text-primary" />
                    </div>
                  ) : (
                    <>
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl><Input {...field} placeholder="e.g., Dr. Jane Doe" /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        <div className="space-y-2">
                           <FormLabel>Specialties</FormLabel>
                           <div className="flex gap-2">
                               <Input value={specialtyInput} onChange={e => setSpecialtyInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag('specialties'))} placeholder="e.g., Cardiology" />
                               <Button type="button" variant="outline" onClick={() => addTag('specialties')}>Add</Button>
                           </div>
                           <div className="flex flex-wrap gap-2 pt-2">
                                {form.watch('specialties').map(spec => (
                                    <Badge key={spec} variant="secondary" className="text-base py-1 pl-3 pr-2">
                                        {spec}
                                        <button type="button" onClick={() => removeTag('specialties', spec)} className="ml-2 rounded-full hover:bg-muted-foreground/20 p-0.5"><X className="w-3 h-3"/></button>
                                    </Badge>
                                ))}
                           </div>
                           <FormMessage>{form.formState.errors.specialties?.message}</FormMessage>
                        </div>
                        
                         <div className="space-y-2">
                           <FormLabel>Qualifications</FormLabel>
                           <div className="flex gap-2">
                               <Input value={qualificationInput} onChange={e => setQualificationInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag('qualifications'))} placeholder="e.g., MBBS, MD" />
                               <Button type="button" variant="outline" onClick={() => addTag('qualifications')}>Add</Button>
                           </div>
                           <div className="flex flex-wrap gap-2 pt-2">
                                {form.watch('qualifications').map(qual => (
                                    <Badge key={qual} variant="secondary" className="text-base py-1 pl-3 pr-2">
                                        {qual}
                                        <button type="button" onClick={() => removeTag('qualifications', qual)} className="ml-2 rounded-full hover:bg-muted-foreground/20 p-0.5"><X className="w-3 h-3"/></button>
                                    </Badge>
                                ))}
                           </div>
                           <FormMessage>{form.formState.errors.qualifications?.message}</FormMessage>
                        </div>

                        <FormField
                            control={form.control}
                            name="bio"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Biography</FormLabel>
                                <FormControl><Textarea {...field} placeholder="Tell patients a little about yourself, your experience, and your approach to care." rows={5} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                         <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="consultationFee"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Consultation Fee</FormLabel>
                                        <FormControl><Input type="number" step="1" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="currency"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Currency</FormLabel>
                                        <FormControl><Input {...field} disabled /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </>
                  )}
                </CardContent>
                <CardFooter>
                     <Button type="submit" disabled={isLoading || isFetching}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </CardFooter>
            </form>
        </Form>
      </Card>
    </div>
  );
}
