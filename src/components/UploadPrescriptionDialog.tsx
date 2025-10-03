'use client';

import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { UploadCloud, FileText, Loader2, AlertTriangle, Pill } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { extractPrescriptionInformation } from '@/ai/flows/extract-prescription-information';
import type { ExtractPrescriptionInformationOutput } from '@/ai/flows/extract-prescription-information';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface UploadPrescriptionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onPrescriptionAnalyzed: (medicationName: string) => void;
}

const CONFIDENCE_THRESHOLD = 0.85;

export function UploadPrescriptionDialog({ open, onOpenChange, onPrescriptionAnalyzed }: UploadPrescriptionDialogProps) {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<ExtractPrescriptionInformationOutput | null>(null);
    const { toast } = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null;
        updateFile(selectedFile);
    };

    const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const selectedFile = e.dataTransfer.files?.[0] || null;
        updateFile(selectedFile);
    }, []);
    
    const updateFile = (selectedFile: File | null) => {
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
            if (!response || response.medications.length === 0) {
                 toast({
                    variant: "destructive",
                    title: "Analysis Failed",
                    description: "Could not extract any medication names.",
                });
            }
        } catch(e: any) {
            toast({
                variant: "destructive",
                title: "Analysis Failed",
                description: e.message || 'An unknown error occurred.',
            });
        }
        setIsLoading(false);
    };

    const handleAddMedication = (medicationName: string) => {
        if (medicationName) {
            onPrescriptionAnalyzed(medicationName);
        }
    }

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            if (!isOpen) {
                setFile(null);
                setPreview(null);
                setResult(null);
            }
            onOpenChange(isOpen);
        }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Upload Prescription</DialogTitle>
                    <DialogDescription>
                        Let AI read your prescription and add medications to your list.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                     <Label 
                        htmlFor="prescription-upload-dialog" 
                        className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                    >
                      {preview ? (
                        <Image src={preview} alt="Prescription preview" fill className="object-contain rounded-lg p-2" />
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                          <UploadCloud className="w-8 h-8 mb-3 text-muted-foreground" />
                          <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                          <p className="text-xs text-muted-foreground">PNG, JPG, or WEBP</p>
                        </div>
                      )}
                      <Input id="prescription-upload-dialog" type="file" className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" />
                    </Label>
                    {file && <div className="flex items-center gap-2 text-sm text-muted-foreground"><FileText className="h-4 w-4"/><span>{file.name}</span></div>}

                    {result && result.medications.length > 0 && (
                        <div className="space-y-2">
                             <p className="text-sm font-medium">Detected Medications:</p>
                             <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                            {result.medications.map((med, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-secondary rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Pill className="h-4 w-4 text-muted-foreground"/>
                                        <span className="font-semibold">{med.medicationName}</span>
                                        {med.confidenceScore < CONFIDENCE_THRESHOLD && (
                                             <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger><AlertTriangle className="h-4 w-4 text-amber-500"/></TooltipTrigger>
                                                    <TooltipContent><p>Low confidence. Please verify.</p></TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        )}
                                    </div>
                                    <Button size="sm" onClick={() => handleAddMedication(med.medicationName)}>Add</Button>
                                </div>
                            ))}
                            </div>
                        </div>
                    )}
                </div>
                {!result && <Button onClick={handleSubmit} disabled={!file || isLoading} className="w-full">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Analyze Prescription
                </Button>}
            </DialogContent>
        </Dialog>
    );
}
