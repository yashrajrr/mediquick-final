'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from '@/components/ui/badge';
import { Loader2, PlusCircle, X, ShieldCheck, AlertTriangle, Upload, Lightbulb } from 'lucide-react';
import { checkForDrugInteractions } from '@/ai/flows/check-for-drug-interactions';
import type { CheckForDrugInteractionsOutput } from '@/ai/flows/check-for-drug-interactions';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { UploadPrescriptionDialog } from '@/components/UploadPrescriptionDialog';

const formSchema = z.object({
  medications: z.array(z.object({ name: z.string().min(1, 'Medication name cannot be empty.') })),
});

type FormValues = z.infer<typeof formSchema>;

const drugFacts = [
    "The first true antibiotic, Penicillin, was discovered by accident by Alexander Fleming in 1928.",
    "Aspirin, one of the most widely used drugs, originally came from the bark of a willow tree.",
    "The color of a pill can influence how patients perceive its effect. For example, red pills are often seen as stimulants.",
    "It can take over 10 years and cost more than $2 billion to bring a new drug to the market.",
    "Some of the world's most important medicines were discovered from natural sources like plants, fungi, and bacteria.",
];

export default function InteractionCheckerPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CheckForDrugInteractionsOutput | null>(null);
  const [isUploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [randomFact, setRandomFact] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    setRandomFact(drugFacts[Math.floor(Math.random() * drugFacts.length)]);
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      medications: [{ name: '' }, { name: '' }],
    },
  });

  const { fields, append, remove, } = useFieldArray({
    control: form.control,
    name: 'medications',
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setResult(null);
    const medicationNames = data.medications.map(m => m.name).filter(Boolean);
    if (medicationNames.length < 2) {
      toast({
        variant: "destructive",
        title: "Too few medications",
        description: "Please enter at least two medications to check for interactions.",
      });
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await checkForDrugInteractions({ medications: medicationNames });
      setResult(response);
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: e.message || 'Failed to check for interactions.',
      });
    }

    setIsLoading(false);
  };
  
  const handlePrescriptionAnalyzed = (medicationName: string) => {
    const emptyFieldIndex = form.getValues('medications').findIndex(field => !field.name);
    if (emptyFieldIndex !== -1) {
      form.setValue(`medications.${emptyFieldIndex}.name`, medicationName);
    } else {
      append({ name: medicationName });
    }
    setUploadDialogOpen(false);
    toast({
      title: "Medication Added",
      description: `${medicationName} has been added to your list.`,
    })
  };

  const getSeverityBadge = (severity: 'minor' | 'moderate' | 'severe') => {
    switch (severity) {
      case 'severe':
        return <Badge variant="destructive" className="text-base px-3 py-1">Severe</Badge>;
      case 'moderate':
        return <Badge variant="default" className="bg-amber-500 hover:bg-amber-600 text-white text-base px-3 py-1">Moderate</Badge>;
      case 'minor':
        return <Badge variant="secondary" className="text-base px-3 py-1">Minor</Badge>;
    }
  };

  const selectedMeds = form.watch('medications').filter(m => m.name);

  return (
    <>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-2 space-y-8">
        <header>
          <h1 className="text-4xl font-bold font-headline tracking-tight">Drug Interaction Checker</h1>
          <p className="text-muted-foreground text-lg mt-1">Check for harmful interactions between your medications.</p>
        </header>

        <Card className="shadow-lg shadow-blue-500/5 overflow-hidden">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                    >
                      <FormField
                        control={form.control}
                        name={`medications.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <div className="relative">
                              <Input placeholder={`Medication ${index + 1}`} {...field} className="h-12 rounded-full pl-5 pr-10 bg-secondary border-2 border-transparent focus:border-primary focus:bg-white" />
                              {fields.length > 2 && (
                                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full text-muted-foreground hover:text-foreground">
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            <FormMessage className="pl-5"/>
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-4 items-center">
                    <Button type="button" variant="outline" className="rounded-full" onClick={() => append({ name: '' })}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Medication
                    </Button>
                    <Button type="button" variant="outline" className="rounded-full" onClick={() => setUploadDialogOpen(true)}>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Prescription
                    </Button>
                </div>
              </CardContent>
              <CardFooter className="bg-secondary/50 p-6 flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  size="lg" 
                  className="rounded-full px-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Check Interactions
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        
          {isLoading && (
            <div
              className="text-center p-8 space-y-2"
            >
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground text-lg">Analyzing interactions...</p>
            </div>
          )}
        

        
        {result && (
          <div>
            <Card className="shadow-lg shadow-blue-500/5">
              <CardHeader>
                <CardTitle className="text-2xl">Interaction Results</CardTitle>
              </CardHeader>
              <CardContent>
                {result.interactions.length === 0 ? (
                  <Alert className="border-green-300 bg-green-50 text-green-800 rounded-xl">
                    <ShieldCheck className="h-5 w-5 !text-green-600" />
                    <AlertTitle className="text-lg">No Interactions Found</AlertTitle>
                    <AlertDescription className="text-base">
                      Based on our data, no potential interactions were found between the listed medications.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-6">
                    <Alert variant="destructive" className="rounded-xl">
                      <AlertTriangle className="h-5 w-5" />
                      <AlertTitle className="text-lg">Potential Interactions Detected</AlertTitle>
                      <AlertDescription className="text-base">
                        Review the interactions below. Always consult with a healthcare professional.
                      </AlertDescription>
                    </Alert>
                    {result.interactions.map((interaction, index) => (
                      <Card key={index} className={cn(
                        "rounded-xl shadow-md transition-all",
                        interaction.severity === 'severe' && 'border-destructive bg-destructive/5',
                        interaction.severity === 'moderate' && 'border-amber-500 bg-amber-500/5'
                      )}>
                        <CardHeader>
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <CardTitle className="text-xl">{interaction.medication1} & {interaction.medication2}</CardTitle>
                            </div>
                            {getSeverityBadge(interaction.severity)}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-lg mb-1">Description</h4>
                            <p className="text-base text-muted-foreground">{interaction.description}</p>
                          </div>
                          {interaction.alternatives && interaction.alternatives.length > 0 && (
                            <>
                              <Separator />
                              <div>
                                <h4 className="font-semibold text-lg mb-2">Suggested Alternatives</h4>
                                <div className="flex flex-wrap gap-2">
                                  {interaction.alternatives.map((alt, i) => (
                                    <Badge key={i} variant="outline" className="text-base px-3 py-1">{alt}</Badge>
                                  ))}
                                </div>
                              </div>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
        
      </div>

      <aside className="space-y-6 lg:mt-24">
        {selectedMeds.length > 0 && (
             <Card className="shadow-lg shadow-blue-500/5">
                <CardHeader>
                    <CardTitle>Selected Medicines</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        
                        {selectedMeds.map((med, index) => (
                            <li 
                                key={index}
                                className="flex items-center justify-between bg-secondary p-2 rounded-full"
                            >
                                <span className="pl-2 font-medium">{med.name}</span>
                                <Button variant="ghost" size="icon" className="rounded-full h-7 w-7" onClick={() => remove(form.getValues('medications').findIndex(m => m.name === med.name))}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </li>
                        ))}
                        
                    </ul>
                </CardContent>
            </Card>
        )}
        <Card className="shadow-lg shadow-blue-500/5 bg-amber-50 border-amber-200">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900"><Lightbulb className="w-5 h-5"/>Did You Know?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {randomFact ? (
                  <p className="text-amber-800">{randomFact}</p>
                ) : (
                  <p className="text-amber-800">Loading interesting fact...</p>
                )}
            </CardContent>
        </Card>
      </aside>
    </div>
    <UploadPrescriptionDialog open={isUploadDialogOpen} onOpenChange={setUploadDialogOpen} onPrescriptionAnalyzed={handlePrescriptionAnalyzed} />
    </>
  );
}
