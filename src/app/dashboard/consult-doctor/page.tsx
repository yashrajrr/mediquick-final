'use client';

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BadgeCheck, Stethoscope, Video, Phone, ShieldAlert, Star } from "lucide-react";
import { BookAppointmentDialog } from "@/components/BookAppointmentDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";

const doctors = [
  {
    name: "Dr. Anjali Sharma",
    specialty: "General Physician",
    availability: "9:00 AM - 5:00 PM",
    image: "https://picsum.photos/seed/doc1/100/100",
    experience: 8,
    verified: true,
    status: 'online',
    rating: 4.8,
    consultationFee: 500,
  },
  {
    name: "Dr. Rohan Verma",
    specialty: "Cardiologist",
    availability: "10:00 AM - 1:00 PM",
    image: "https://picsum.photos/seed/doc2/100/100",
    experience: 12,
    verified: true,
    status: 'online',
    rating: 4.9,
    consultationFee: 800,
  },
  {
    name: "Dr. Priya Desai",
    specialty: "Dermatologist",
    availability: "1:00 PM - 6:00 PM",
    image: "https://picsum.photos/seed/doc3/100/100",
    experience: 7,
    verified: true,
    status: 'offline',
    rating: 4.7,
    consultationFee: 600,
  },
   {
    name: "Dr. Vikram Singh",
    specialty: "Pediatrician",
    availability: "Mon, Wed, Fri",
    image: "https://picsum.photos/seed/doc4/100/100",
    experience: 15,
    verified: true,
    status: 'offline',
    rating: 4.8,
    consultationFee: 700,
  },
  {
    name: "Dr. Sunita Patel",
    specialty: "Gynecologist",
    availability: "Tue, Thu, Sat",
    image: "https://picsum.photos/seed/doc5/100/100",
    experience: 10,
    verified: true,
    status: 'offline',
    rating: 4.6,
    consultationFee: 750,
  },
  {
    name: "Dr. Arjun Reddy",
    specialty: "Orthopedic Surgeon",
    availability: "9:00 AM - 2:00 PM",
    image: "https://picsum.photos/seed/doc6/100/100",
    experience: 18,
    verified: true,
    status: 'online',
    rating: 4.9,
    consultationFee: 1000,
  },
  {
    name: "Dr. Meera Iyer",
    specialty: "Endocrinologist",
    availability: "11:00 AM - 4:00 PM",
    image: "https://picsum.photos/seed/doc7/100/100",
    experience: 9,
    verified: true,
    status: 'offline',
    rating: 4.7,
    consultationFee: 850,
  },
  {
    name: "Dr. Sanjay Gupta",
    specialty: "Neurologist",
    availability: "By Appointment",
    image: "https://picsum.photos/seed/doc8/100/100",
    experience: 20,
    verified: true,
    status: 'offline',
    rating: 4.9,
    consultationFee: 1200,
  }
];

type Doctor = typeof doctors[0];

const DoctorCard = ({ doctor, onBook }: { doctor: Doctor, onBook: (doctor: Doctor) => void }) => (
    <Card className="flex flex-col overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-start gap-4">
            <div className="relative">
                <Avatar className="h-16 w-16">
                    <AvatarImage src={doctor.image} alt={doctor.name} data-ai-hint="doctor portrait" />
                    <AvatarFallback>{doctor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                {doctor.status === 'online' && <span className="absolute bottom-0 right-0 block h-4 w-4 rounded-full bg-green-500 ring-2 ring-white" />}
            </div>
            <div className="flex-1">
                <CardTitle className="text-xl flex items-center gap-2">
                    {doctor.name}
                    {doctor.verified && <BadgeCheck className="h-5 w-5 text-blue-500" />}
                </CardTitle>
                <CardDescription>{doctor.specialty}</CardDescription>
            </div>
        </CardHeader>
        <CardContent className="flex-grow space-y-3 text-sm text-muted-foreground">
           <p><strong>Experience:</strong> {doctor.experience} years</p>
           <p><strong>Availability:</strong> {doctor.availability}</p>
           <div className="flex items-center gap-2">
              <strong>Rating:</strong> 
              <span className="flex items-center gap-1 font-bold text-amber-500">
                <Star className="w-4 h-4 fill-amber-500" /> {doctor.rating.toFixed(1)}
              </span>
           </div>
           <p><strong>Fee:</strong> <span className="font-bold text-foreground">₹{doctor.consultationFee}</span></p>
        </CardContent>
         <CardFooter>
            {doctor.status === 'online' ? (
                <Button className="w-full" onClick={() => onBook(doctor)}>
                    <Video className="mr-2 h-4 w-4" /> Consult Now
                </Button>
            ) : (
                 <Button className="w-full" variant="outline" onClick={() => onBook(doctor)}>
                    <Phone className="mr-2 h-4 w-4" /> Book Appointment
                </Button>
            )}
        </CardFooter>
    </Card>
);

export default function ConsultDoctorPage() {
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

    const onlineDoctors = doctors.filter(d => d.status === 'online');
    const offlineDoctors = doctors.filter(d => d.status === 'offline');


  return (
    <>
    <div className="space-y-8">
      <header className="flex justify-between items-start">
        <div>
            <h1 className="text-3xl font-bold font-headline tracking-tight">Consult a Doctor</h1>
            <p className="text-muted-foreground">Connect with healthcare professionals for prescriptions and advice.</p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="flex items-center gap-2 animate-pulse">
                <ShieldAlert className="w-5 h-5"/>
                <span className="hidden md:inline">Emergency SOS</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you in an emergency?</AlertDialogTitle>
              <AlertDialogDescription>
                This will alert our emergency response team. Only use this in a genuine medical emergency.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction disabled>Call for Help (Not Active)</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </header>
      
        <section>
            <h2 className="text-2xl font-bold mb-4">Available Now</h2>
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {onlineDoctors.map((doctor) => (
                    <DoctorCard key={doctor.name} doctor={doctor} onBook={setSelectedDoctor} />
                ))}
            </div>
        </section>
        
        <Separator />

        <section>
            <h2 className="text-2xl font-bold mb-4">Book an Appointment</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                 {offlineDoctors.map((doctor) => (
                    <DoctorCard key={doctor.name} doctor={doctor} onBook={setSelectedDoctor} />
                ))}
            </div>
        </section>
      
       <Card className="shadow-sm mt-8 bg-blue-50 border border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">How it works</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-6 text-blue-800">
          <div className="flex flex-col items-center text-center">
            <Stethoscope className="w-10 h-10 mb-2" />
            <h3 className="font-semibold">1. Choose a Doctor</h3>
            <p className="text-sm">Select a specialist from our list of certified professionals.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <Video className="w-10 h-10 mb-2" />
            <h3 className="font-semibold">2. Book or Start a Call</h3>
            <p className="text-sm">Start an instant consultation or schedule one for later.</p>
          </div>
           <div className="flex flex-col items-center text-center">
             <div className="w-10 h-10 mb-2 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13.4 2H6.6l1.4 1.4a2 2 0 0 1-2.8 2.8L4 8l-1.4 1.4a2 2 0 0 1-2.8-2.8L1.2 5.2 2.6 3.8 3.8 2.6 5.2 1.2a2 2 0 0 1 2.8 2.8L6.6 4l1.4-1.4a2 2 0 0 1 2.8-2.8L12 1.2l1.4-1.4a2 2 0 0 1 2.8 2.8L14.8 4l1.4 1.4a2 2 0 0 1 2.8 2.8L17.6 9.6l1.4 1.4-1.4 1.4-1.4 1.4a2 2 0 0 1-2.8-2.8l1.4-1.4-1.4-1.4Z" /><path d="m19.8 9.8 1.4 1.4a2 2 0 0 1-2.8 2.8l-8.4 8.4-4.2-4.2 8.4-8.4a2 2 0 0 1 2.8-2.8Z" /></svg>
             </div>
            <h3 className="font-semibold">3. Get a Prescription</h3>
            <p className="text-sm">Receive a digital prescription after your consultation.</p>
          </div>
        </CardContent>
      </Card>
    </div>
    {selectedDoctor && (
        <BookAppointmentDialog 
            doctor={selectedDoctor}
            open={!!selectedDoctor}
            onOpenChange={() => setSelectedDoctor(null)}
        />
    )}
    </>
  );
}
