
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarDays, Clock, User, Stethoscope, Video, CheckCircle, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

// Re-using the appointment interface from the patient's side
export interface Appointment {
    id: string;
    doctor: {
        name: string;
        specialty: string;
        image: string;
    };
    patientName: string;
    reason: string;
    date: string;
    time: string;
    status: 'Upcoming' | 'Completed';
}

// Demo appointments to pre-populate localStorage
const createDemoAppointments = (doctorName: string): Appointment[] => {
    const today = new Date();
    const futureDate1 = new Date(today);
    futureDate1.setDate(today.getDate() + 2);
    const futureDate2 = new Date(today);
    futureDate2.setDate(today.getDate() + 5);
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - 3);

    return [
        {
            id: 'dem-appt-1',
            doctor: { name: doctorName, specialty: 'General Physician', image: 'https://picsum.photos/seed/doc1/100/100' },
            patientName: 'Rohan Sharma',
            reason: 'Fever and cough symptoms for three days.',
            date: futureDate1.toISOString().split('T')[0],
            time: '11:00 AM',
            status: 'Upcoming',
        },
        {
            id: 'dem-appt-2',
            doctor: { name: doctorName, specialty: 'General Physician', image: 'https://picsum.photos/seed/doc1/100/100' },
            patientName: 'Priya Mehta',
            reason: 'Follow-up regarding blood pressure medication.',
            date: futureDate2.toISOString().split('T')[0],
            time: '03:00 PM',
            status: 'Upcoming',
        },
        {
            id: 'dem-appt-3',
            doctor: { name: doctorName, specialty: 'General Physician', image: 'https://picsum.photos/seed/doc1/100/100' },
            patientName: 'Amit Singh',
            reason: 'Annual health checkup.',
            date: pastDate.toISOString().split('T')[0],
            time: '10:00 AM',
            status: 'Completed',
        },
    ];
};

export default function DoctorAppointmentsPage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [doctorName, setDoctorName] = useState<string>('');
    const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
    
    useEffect(() => {
        const fetchDoctorAndAppointments = async () => {
            if (user && firestore) {
                const docRef = doc(firestore, 'doctors', user.uid);
                const docSnap = await getDoc(docRef);
                let currentDoctorName = '';
                if (docSnap.exists()) {
                    currentDoctorName = docSnap.data().name;
                    setDoctorName(currentDoctorName);
                }

                // Now, load or create appointments
                try {
                    const storedAppointments = localStorage.getItem('appointments');
                    if (storedAppointments) {
                        setAllAppointments(JSON.parse(storedAppointments));
                    } else if (currentDoctorName) {
                        // If no appointments exist, create demo ones for this doctor
                        const demoData = createDemoAppointments(currentDoctorName);
                        localStorage.setItem('appointments', JSON.stringify(demoData));
                        setAllAppointments(demoData);
                    }
                } catch (error) {
                    console.error("Failed to process appointments from localStorage", error);
                }
            }
        };
        fetchDoctorAndAppointments();

        const handleStorageChange = () => {
             const storedAppointments = localStorage.getItem('appointments');
             if (storedAppointments) {
                setAllAppointments(JSON.parse(storedAppointments));
             }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [user, firestore]);

    const handleStatusChange = (appointmentId: string, newStatus: 'Completed') => {
        try {
            const updatedAppointments = allAppointments.map(appt => 
                appt.id === appointmentId ? { ...appt, status: newStatus } : appt
            );
            localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
            setAllAppointments(updatedAppointments);
            toast({
                title: "Appointment Updated",
                description: `The appointment has been marked as completed.`
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: "Update Failed",
                description: "Could not update the appointment status."
            });
        }
    };


    const doctorAppointments = allAppointments.filter(a => a.doctor.name === doctorName);
    const upcomingAppointments = doctorAppointments.filter(a => a.status === 'Upcoming').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const pastAppointments = doctorAppointments.filter(a => a.status === 'Completed').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (!doctorName) {
        return <p className="text-muted-foreground text-center py-8">Loading doctor profile...</p>
    }

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold font-headline tracking-tight">Your Appointments</h1>
                <p className="text-muted-foreground">Review your upcoming and past patient consultations.</p>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><CalendarDays /> Upcoming Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                    {upcomingAppointments.length > 0 ? (
                        <div className="space-y-4">
                            {upcomingAppointments.map(appt => (
                                <DoctorAppointmentCard key={appt.id} appointment={appt} onStatusChange={handleStatusChange} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">You have no upcoming appointments.</p>
                    )}
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><CheckCircle /> Past Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                     {pastAppointments.length > 0 ? (
                        <div className="space-y-4">
                            {pastAppointments.map(appt => (
                               <DoctorAppointmentCard key={appt.id} appointment={appt} onStatusChange={handleStatusChange} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">You have no past appointments.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function DoctorAppointmentCard({ appointment, onStatusChange }: { appointment: Appointment; onStatusChange: (id: string, status: 'Completed') => void; }) {
    return (
        <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 grid md:grid-cols-[1fr_2fr] gap-4 items-start">
                 <div className="flex flex-col items-center md:items-start text-center md:text-left">
                    <Avatar className="h-16 w-16 mb-2">
                        <AvatarFallback>{appointment.patientName.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <h3 className="font-bold">{appointment.patientName}</h3>
                </div>
                 <div className="space-y-3">
                    <div className="flex items-start gap-2 text-sm"><Stethoscope className="w-4 h-4 mt-0.5"/> <strong>Reason:</strong> {appointment.reason}</div>
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2"><CalendarDays className="w-4 h-4"/> <strong>Date:</strong> {new Date(appointment.date).toLocaleDateString()}</div>
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4"/> <strong>Time:</strong> {appointment.time}</div>
                    </div>
                </div>
            </CardContent>
            <Separator />
            <CardFooter className="p-3 flex justify-between items-center bg-muted/50">
                 <Badge variant={appointment.status === 'Upcoming' ? 'default' : 'secondary'}>{appointment.status}</Badge>
                 <div className="flex gap-2">
                     <Button variant="outline" size="sm" disabled={appointment.status !== 'Upcoming'}><Video className="w-4 h-4 mr-2"/> Join Call</Button>
                     {appointment.status === 'Upcoming' ? (
                        <Button size="sm" onClick={() => onStatusChange(appointment.id, 'Completed')}>
                            <CheckCircle className="w-4 h-4 mr-2" /> Mark as Completed
                        </Button>
                     ) : (
                         <Button size="sm" variant="outline" disabled><FileText className="w-4 h-4 mr-2"/> View Prescription</Button>
                     )}
                 </div>
            </CardFooter>
        </Card>
    );
}
