'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, Loader2, Send, User } from 'lucide-react';
import { symptomCheck } from '@/ai/flows/symptom-checker';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { cn } from '@/lib/utils';

type Message = {
    role: 'user' | 'bot';
    text: string;
};

export function SymptomCheckerDialog({ children }: { children: React.ReactNode }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage: Message = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await symptomCheck(input);
            const botMessage: Message = { role: 'bot', text: response };
            setMessages(prev => [...prev, botMessage]);
        } catch (e: any) {
             toast({
                variant: 'destructive',
                title: 'Error',
                description: e.message || 'Failed to get a response.',
            });
        }
        
        setIsLoading(false);
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px] grid-rows-[auto_1fr_auto] p-0 max-h-[90vh]">
                <DialogHeader className="p-4 border-b">
                    <DialogTitle className="flex items-center gap-2"><Bot /> AI Symptom Checker</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[50vh] p-4">
                    <div className="space-y-4">
                        {messages.map((message, index) => (
                            <div key={index} className={cn("flex items-start gap-3", message.role === 'user' ? "justify-end" : "justify-start")}>
                                {message.role === 'bot' && (
                                    <Avatar className="w-8 h-8 border">
                                        <AvatarFallback><Bot size={20}/></AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={cn("rounded-lg px-3 py-2 max-w-[80%]", message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                                    <p className="text-sm">{message.text}</p>
                                </div>
                                 {message.role === 'user' && (
                                    <Avatar className="w-8 h-8 border">
                                        <AvatarFallback><User size={20}/></AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}
                         {isLoading && (
                            <div className="flex items-start gap-3 justify-start">
                                <Avatar className="w-8 h-8 border">
                                    <AvatarFallback><Bot size={20}/></AvatarFallback>
                                </Avatar>
                                <div className="rounded-lg px-3 py-2 bg-muted flex items-center">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
                <form onSubmit={handleSendMessage} className="p-4 border-t">
                    <div className="relative">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Describe your symptoms..."
                            className="pr-12 h-12"
                            disabled={isLoading}
                        />
                        <Button type="submit" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8" disabled={isLoading || !input.trim()}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
