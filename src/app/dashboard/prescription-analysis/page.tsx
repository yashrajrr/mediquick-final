'use client';

import { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadCloud, FileText, Loader2, AlertTriangle, Pill, Repeat, Clock, HelpCircle, CheckCircle } from 'lucide-react';
import { extractPrescriptionInformation } from '@/ai/flows/extract-prescription-information';
import type { ExtractPrescriptionInformationOutput, MedicationInfo } from '@/ai/flows/extract-prescription-information';
import Image from 'next/image';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const CONFIDENCE_THRESHOLD = 0.85;

export type UserPrescription = MedicationInfo & {
    id: string;
    dateAdded: string;
};


const savePrescriptions = (medications: MedicationInfo[]) => {
    try {
        const existingPrescriptions = JSON.parse(localStorage.getItem('myPrescriptions') || '[]') as UserPrescription[];
        const newPrescriptions: UserPrescription[] = medications.map(med => ({
            ...med,
            id: `${med.medicationName}-${new Date().getTime()}`,
            dateAdded: new Date().toISOString(),
        }));
        
        const updatedPrescriptions = [...existingPrescriptions, ...newPrescriptions];
        localStorage.setItem('myPrescriptions', JSON.stringify(updatedPrescriptions));
        window.dispatchEvent(new Event('prescriptionsUpdated'));

        return true;
    } catch (error) {
        console.error("Failed to save prescriptions", error);
        return false;
    }
}

export default function PrescriptionAnalysisPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ExtractPrescriptionInformationOutput | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setResult(null);

    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const selectedFile = e.dataTransfer.files?.[0] || null;
    setFile(selectedFile);
    setResult(null);

    if (selectedFile) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
    } else {
        setPreview(null);
    }
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      e.stopPropagation();
  };


  const handleSubmit = async () => {
    if (!file || !preview) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select a prescription image to analyze.",
      });
      return;
    }

    setIsLoading(true);
    setResult(null);
    
    try {
      const response = await extractPrescriptionInformation({ prescriptionDataUri: preview });
      setResult(response);
    } catch(e: any) {
       toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: e.message || 'An unknown error occurred.',
      });
    }

    setIsLoading(false);
  };
  
  const handleSavePrescriptions = () => {
    if (!result || !result.medications.length) return;
    
    if (savePrescriptions(result.medications)) {
       toast({
            title: "Prescriptions Saved",
            description: "Your medications have been added to your profile for refill tracking.",
        });
    } else {
        toast({
            variant: 'destructive',
            title: "Error Saving",
            description: "Could not save your prescriptions. Please try again.",
        });
    }
    
    setResult(null);
    setFile(null);
    setPreview(null);
  }

  const overallConfidence = useMemo(() => {
    if (!result || !result.medications || result.medications.length === 0) return 0;
    const total = result.medications.reduce((sum, med) => sum + med.confidenceScore, 0);
    return total / result.medications.length;
  }, [result]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold font-headline tracking-tight">AI Prescription Analysis</h1>
        <p className="text-muted-foreground">Upload a photo of your prescription to automatically extract details.</p>
      </header>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Upload Prescription</CardTitle>
            <CardDescription>Drag & drop or select a file from your device.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <Label 
                htmlFor="prescription-upload" 
                className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            >
              {preview ? (
                <Image src={preview} alt="Prescription preview" fill className="object-contain rounded-lg p-2" />
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                  <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG, or WEBP</p>
                </div>
              )}
              <Input id="prescription-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" />
            </Label>
            {file && <div className="flex items-center gap-2 text-sm text-muted-foreground"><FileText className="h-4 w-4"/><span>{file.name}</span></div>}
            <Button onClick={handleSubmit} disabled={!file || isLoading} className="w-full">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Analyze Prescription
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>The extracted details from your prescription will appear here.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-8 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-8 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-8 w-full" />
                    </div>
                     <div className="space-y-2 pt-2">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-full" />
                    </div>
                </div>
            ) : result && result.medications.length > 0 ? (
              <div className="space-y-4">
                {overallConfidence < CONFIDENCE_THRESHOLD && (
                   <div className="p-3 rounded-md bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
                    <div>
                      <h3 className="font-semibold">Manual Review Recommended</h3>
                      <p className="text-sm">Our AI's confidence is low. Please double-check the extracted information for accuracy.</p>
                    </div>
                  </div>
                )}
                <div className="space-y-6">
                  {result.medications.map((med, index) => (
                    <MedicationCard key={index} medication={med} />
                  ))}
                </div>
                 <Button onClick={handleSavePrescriptions} className="w-full mt-4">
                    <CheckCircle className="mr-2 h-4 w-4"/>
                    Save Prescriptions to My Profile
                </Button>
              </div>
            ) : (
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground min-h-[250px]">
                    <FileText className="w-16 h-16 mb-4" />
                    <p>{result ? 'No medications detected.' : 'Upload a prescription to begin analysis.'}</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const MedicationCard = ({ medication }: { medication: MedicationInfo }) => {
  const confidenceColor = useMemo(() => {
    const score = medication.confidenceScore;
    if (score >= 0.9) return 'bg-green-500';
    if (score >= CONFIDENCE_THRESHOLD) return 'bg-amber-500';
    return 'bg-red-500';
  }, [medication.confidenceScore]);
  
  return (
    <Card className="bg-muted/50">
        <CardContent className="p-4 space-y-4">
           <InfoItem icon={Pill} label="Medication Name" value={medication.medicationName} />
           <InfoItem icon={Repeat} label="Dosage" value={medication.dosage} />
           <InfoItem icon={Clock} label="Frequency" value={medication.frequency} />
           <div className="pt-2">
              <div className="flex justify-between items-center mb-1">
                  <Label className="flex items-center gap-1.5 text-sm">
                      Confidence Score
                      <TooltipProvider>
                          <Tooltip>
                              <TooltipTrigger><HelpCircle className="h-4 w-4 text-muted-foreground"/></TooltipTrigger>
                              <TooltipContent><p>How confident the AI is in this extraction.</p></TooltipContent>
                          </Tooltip>
                      </TooltipProvider>
                  </Label>
                  <span className="font-bold text-lg">{(medication.confidenceScore * 100).toFixed(0)}%</span>
              </div>
              <Progress value={medication.confidenceScore * 100} className={confidenceColor} />
           </div>
        </CardContent>
    </Card>
  )
}

const InfoItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string }) => (
    <div>
        <Label className="text-sm text-muted-foreground flex items-center gap-2"><Icon className="h-4 w-4" />{label}</Label>
        <p className="text-lg font-semibold mt-1">{value || 'Not detected'}</p>
    </div>
);
