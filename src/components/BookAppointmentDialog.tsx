'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import type { Appointment } from '@/app/dashboard/appointments/page';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';

interface BookAppointmentDialogProps {
  doctor: {
    name: string;
    specialty: string;
    image: string;
    consultationFee: number;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const timeSlots = ["10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"];

export function BookAppointmentDialog({ doctor, open, onOpenChange }: BookAppointmentDialogProps) {
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const { toast } = useToast();
  const { user } = useUser();

  const handleBooking = () => {
    if (!user) {
        toast({
            variant: "destructive",
            title: 'Authentication Error',
            description: 'You must be logged in to book an appointment.',
        });
        return;
    }
    // Create a date in the future for demo purposes
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 5) + 1);

    const newAppointment: Appointment = {
      id: new Date().toISOString(),
      doctor,
      patientName: user.displayName || 'Jane Doe',
      reason,
      date: futureDate.toISOString().split('T')[0],
      time: selectedTime,
      status: 'Upcoming',
    };

    try {
      const existingAppointments = JSON.parse(localStorage.getItem('appointments') || '[]') as Appointment[];
      localStorage.setItem('appointments', JSON.stringify([...existingAppointments, newAppointment]));
      toast({
        title: 'Appointment Booked!',
        description: `Your appointment with ${doctor.name} is confirmed.`,
      });
      resetAndClose();
    } catch (error) {
        console.error("Failed to save appointment", error);
         toast({
            variant: "destructive",
            title: 'Booking Failed',
            description: `Could not save your appointment. Please try again.`,
        });
    }
  };
  
  const resetAndClose = () => {
    setStep(1);
    setReason('');
    setSelectedTime('');
    onOpenChange(false);
  }

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div key="step1" className="animate-in fade-in-50 duration-300">
            <DialogTitle className="text-center text-lg">Reason for Visit</DialogTitle>
            <DialogDescription className="text-center">Briefly describe why you are booking this appointment.</DialogDescription>
            <div className="grid gap-2 pt-4">
              <Label htmlFor="reason" className="sr-only">Reason</Label>
              <Textarea id="reason" placeholder="e.g., Follow-up checkup, seasonal flu symptoms..." value={reason} onChange={e => setReason(e.target.value)} rows={4} />
            </div>
            <DialogFooter className="pt-4">
                <Button onClick={nextStep} disabled={!reason.trim()} className="w-full">Next <ArrowRight className="ml-2 w-4 h-4"/></Button>
            </DialogFooter>
          </div>
        );
      case 2:
        return (
           <div key="step2" className="animate-in fade-in-50 duration-300">
            <DialogTitle className="text-center text-lg">Select a Time</DialogTitle>
            <DialogDescription className="text-center">Choose an available time slot for your appointment.</DialogDescription>
            <RadioGroup value={selectedTime} onValueChange={setSelectedTime} className="grid grid-cols-2 gap-4 pt-4">
              {timeSlots.map(time => (
                <div key={time}>
                  <RadioGroupItem value={time} id={time} className="sr-only" />
                  <Label 
                    htmlFor={time} 
                    className={cn(
                      "flex items-center justify-center p-4 border rounded-md cursor-pointer hover:bg-accent transition-all",
                      selectedTime === time && "bg-primary text-primary-foreground border-primary"
                    )}
                  >
                    <span>{time}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
            <DialogFooter className="grid grid-cols-2 gap-2 pt-4">
                <Button variant="outline" onClick={prevStep}><ArrowLeft className="mr-2 w-4 h-4"/> Back</Button>
                <Button onClick={nextStep} disabled={!selectedTime}>Next <ArrowRight className="ml-2 w-4 h-4"/></Button>
            </DialogFooter>
          </div>
        );
      case 3:
        return (
          <div key="step3" className="space-y-6 animate-in fade-in-50 duration-300">
            <DialogTitle className="text-center text-lg">Confirm Your Appointment</DialogTitle>
            <div className="space-y-4 text-sm p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={doctor.image} />
                    <AvatarFallback>{doctor.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p><strong>Doctor:</strong> {doctor.name}</p>
                    <p className="text-muted-foreground">{doctor.specialty}</p>
                  </div>
              </div>
              <p><strong>Time:</strong> {selectedTime} (on a future date)</p>
              <p><strong>Reason:</strong> {reason}</p>
              <p><strong>Fee:</strong> <span className="font-bold">₹{doctor.consultationFee.toFixed(2)}</span> (payment on consultation)</p>
            </div>
             <DialogFooter className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={prevStep}><ArrowLeft className="mr-2 w-4 h-4"/> Back</Button>
                <Button onClick={handleBooking}>Confirm Booking</Button>
            </DialogFooter>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center pb-4">
            <h2 className="text-lg font-semibold">Book with {doctor.name}</h2>
            <div className="flex justify-center items-center gap-2 mt-2">
                {[1,2,3].map(i => (
                    <div key={i} className={`w-2 h-2 rounded-full transition-all ${step >= i ? 'bg-primary scale-110' : 'bg-muted'}`} />
                ))}
            </div>
        </DialogHeader>
        
            {renderStep()}
        
      </DialogContent>
    </Dialog>
  );
}
