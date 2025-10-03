'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Users, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth, useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, Timestamp } from 'firebase/firestore';
import { moderateMessage } from '@/ai/flows/moderate-message';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';


interface Message {
  id: string;
  text: string;
  uid: string;
  displayName: string;
  photoURL: string | null;
  createdAt: Timestamp;
}

const communities = [
  { id: 'general', name: 'General Health', description: 'Discuss general health topics.' },
  { id: 'rare_conditions', name: 'Rare Conditions', description: 'Connect with others facing rare health challenges.' },
  { id: 'mental_wellness', name: 'Mental Wellness', description: 'Share and support mental health journeys.' },
  { id: 'fitness_nutrition', name: 'Fitness & Nutrition', description: 'For all things diet and exercise.' },
];

export default function CommunityPage() {
  const [selectedCommunity, setSelectedCommunity] = useState<string>(communities[0].id);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const messagesCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'communities', selectedCommunity, 'messages');
  }, [firestore, selectedCommunity]);

  const messagesQuery = useMemoFirebase(() => {
    if (!messagesCollection) return null;
    return query(messagesCollection, orderBy('createdAt', 'asc'));
  }, [messagesCollection]);

  const { data: messages, isLoading: isLoadingMessages } = useCollection<Message>(messagesQuery);
  
  const scrollToBottom = () => {
    setTimeout(() => {
        const viewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }, 100);
  }

  useEffect(() => {
    if(messages && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, selectedCommunity]);


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !messagesCollection) return;

    setIsSending(true);
    const messageText = newMessage;
    setNewMessage(''); // Clear input immediately

    try {
        const moderationResult = await moderateMessage(messageText);

        if (moderationResult.isImproper) {
            const botMessage = {
                text: `Warning: A message was flagged as inappropriate and was not sent. Reason: ${moderationResult.reason}`,
                uid: 'system_bot',
                displayName: 'Moderator Bot',
                photoURL: null,
                createdAt: serverTimestamp(),
            };
            await addDoc(messagesCollection, botMessage);
            toast({
                variant: "destructive",
                title: "Message Blocked",
                description: "Your message was found to be inappropriate and was not sent.",
            });
        } else {
            const userMessage = {
                text: messageText,
                uid: user.uid,
                displayName: user.displayName || 'Anonymous',
                photoURL: user.photoURL,
                createdAt: serverTimestamp(),
            };
            await addDoc(messagesCollection, userMessage);
        }
    } catch (error) {
        console.error("Error sending or moderating message:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not send your message due to an error.",
        });
        setNewMessage(messageText); // Restore message on error
    } finally {
        setIsSending(false);
        scrollToBottom();
    }
};
  
  const currentCommunity = communities.find(c => c.id === selectedCommunity);

  return (
    <div className="h-[calc(100vh-8rem)] flex">
      <div className="hidden md:flex flex-col w-1/4 border-r">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold flex items-center gap-2"><Users className="w-6 h-6"/> Communities</h1>
        </div>
        <ScrollArea className="flex-1">
          {communities.map((community) => (
            <div
              key={community.id}
              className={cn(
                'p-4 cursor-pointer hover:bg-muted',
                selectedCommunity === community.id && 'bg-secondary'
              )}
              onClick={() => setSelectedCommunity(community.id)}
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border">
                    <AvatarFallback><Hash /></AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold">{community.name}</p>
                    <p className="text-sm text-muted-foreground">{community.description}</p>
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col bg-card">
        <header className="p-4 border-b flex items-center gap-4">
            <Avatar className="h-10 w-10 border md:hidden">
                <AvatarFallback><Hash /></AvatarFallback>
            </Avatar>
            <div>
                <h2 className="text-xl font-bold">{currentCommunity?.name}</h2>
                <p className="text-sm text-muted-foreground">{currentCommunity?.description}</p>
            </div>
        </header>

        <ScrollArea className="flex-1 p-4 bg-muted/20" ref={scrollAreaRef}>
          <div className="space-y-6">
            {isLoadingMessages && (
                <div className="flex justify-center items-center h-full">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            )}
            {messages && messages.map((message) => {
              const isCurrentUser = user && message.uid === user.uid;
              const isBot = message.uid === 'system_bot';

              if (isBot) {
                  return (
                    <div key={message.id} className="text-center text-xs text-amber-600 font-medium py-2 px-4 rounded-md bg-amber-50 border border-amber-200">
                        {message.text}
                    </div>
                  )
              }

              return (
                <div
                  key={message.id}
                  className={cn('flex items-end gap-2', isCurrentUser && 'justify-end')}
                >
                  {!isCurrentUser && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={message.photoURL || ''} />
                      <AvatarFallback>{message.displayName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                  )}
                  <div className={cn(
                      "max-w-md rounded-xl px-4 py-2", 
                      isCurrentUser ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-background rounded-bl-none border'
                  )}>
                     {!isCurrentUser && <p className="text-xs font-bold mb-1">{message.displayName}</p>}
                    <p>{message.text}</p>
                     {message.createdAt && <p className="text-xs text-muted-foreground/80 mt-1 text-right">{message.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>}
                  </div>
                   {isCurrentUser && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.photoURL || ''} />
                      <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-background">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={isUserLoading ? "Authenticating..." : "Type a message..."}
              className="h-12 flex-1"
              disabled={isUserLoading || isSending}
            />
            <Button type="submit" size="icon" className="h-12 w-12" disabled={newMessage.trim() === '' || isUserLoading || isSending}>
              {isSending ? <Loader2 className="h-6 w-6 animate-spin"/> : <Send className="h-6 w-6" />}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
