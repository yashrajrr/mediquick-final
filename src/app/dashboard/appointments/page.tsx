'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarDays, Clock, User, Stethoscope, Video, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);

    useEffect(() => {
        try {
            const storedAppointments = localStorage.getItem('appointments');
            if (storedAppointments) {
                setAppointments(JSON.parse(storedAppointments));
            }
        } catch (error) {
            console.error("Failed to parse appointments from localStorage", error);
        }
    }, []);

    const upcomingAppointments = appointments.filter(a => a.status === 'Upcoming').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const pastAppointments = appointments.filter(a => a.status === 'Completed').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold font-headline tracking-tight">Your Appointments</h1>
                <p className="text-muted-foreground">Review your upcoming and past consultations.</p>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><CalendarDays /> Upcoming Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                    {upcomingAppointments.length > 0 ? (
                        <div className="space-y-4">
                            {upcomingAppointments.map(appt => (
                                <AppointmentCard key={appt.id} appointment={appt} />
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
                                <AppointmentCard key={appt.id} appointment={appt} />
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

function AppointmentCard({ appointment }: { appointment: Appointment }) {
    return (
        <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 grid md:grid-cols-[1fr_2fr] gap-4 items-center">
                <div className="flex flex-col items-center md:items-start text-center md:text-left">
                    <Avatar className="h-16 w-16 mb-2">
                        <AvatarImage src={appointment.doctor.image} />
                        <AvatarFallback>{appointment.doctor.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <h3 className="font-bold">{appointment.doctor.name}</h3>
                    <p className="text-sm text-muted-foreground">{appointment.doctor.specialty}</p>
                </div>
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm"><User className="w-4 h-4"/> <strong>Patient:</strong> Jane Doe</div>
                    <div className="flex items-start gap-2 text-sm"><Stethoscope className="w-4 h-4 mt-0.5"/> <strong>Reason:</strong> {appointment.reason}</div>
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2"><CalendarDays className="w-4 h-4"/> <strong>Date:</strong> {new Date(appointment.date).toLocaleDateString()}</div>
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4"/> <strong>Time:</strong> {appointment.time}</div>
                    </div>
                </div>
            </CardContent>
            {appointment.status === 'Upcoming' && (
                <CardDescription className="p-4 pt-0 flex justify-between items-center">
                     <Badge>Upcoming</Badge>
                     <Button variant="outline" size="sm" disabled><Video className="w-4 h-4 mr-2"/> Join Call (Not available)</Button>
                </CardDescription>
            )}
        </Card>
    );
}
