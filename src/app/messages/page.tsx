"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Conversation, Message, getChatParticipantName, sendMessage, markAsRead } from "@/lib/chat";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot, limit } from "firebase/firestore";
import { Navbar } from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Loader2, MessageSquare, ArrowLeft } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function MessagesApp() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeChatId = searchParams.get("chatId");

  const [conversations, setConversations] = useState<(Conversation & { otherName?: string })[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fallback to auth Page if not logged in
  useEffect(() => {
    if (!loading && !user) router.push("/auth");
  }, [loading, user, router]);

  // Listen to User's Conversations
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", user.uid),
      orderBy("updatedAt", "desc")
    );

    const unsub = onSnapshot(q, async (snap) => {
      const convos = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Conversation));
      
      // Fetch names asynchronously
      const convosWithNames = await Promise.all(convos.map(async (c) => {
        const otherUid = c.participants.find(uid => uid !== user.uid);
        const name = otherUid ? await getChatParticipantName(otherUid) : "Kullanıcı";
        return { ...c, otherName: name };
      }));
      
      setConversations(convosWithNames);
    });

    return () => unsub();
  }, [user]);

  // Listen to Active Chat Messages
  useEffect(() => {
    if (!user || !activeChatId) {
      setMessages([]);
      return;
    }
    const q = query(
      collection(db, "conversations", activeChatId, "messages"),
      orderBy("createdAt", "asc"),
      limit(50) // only recent 50
    );

    const unsub = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(msgs);
      setTimeout(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }, 100);
    });

    return () => unsub();
  }, [user, activeChatId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user || !activeChatId) return;

    setSending(true);
    try {
      await sendMessage(activeChatId, inputText.trim(), user.uid);
      setInputText("");
    } catch(err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  if (loading || !user) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8" /></div>;

  const activeConvo = conversations.find(c => c.id === activeChatId);

  // Mark as read effect
  useEffect(() => {
    if (user && activeChatId && activeConvo?.unreadBy?.includes(user.uid)) {
      markAsRead(activeChatId, user.uid).catch(console.error);
    }
  }, [user, activeChatId, activeConvo]);

  return (
    <div className="flex flex-col h-screen fixed inset-0 w-full overflow-hidden bg-background">
      <Navbar />
      
      <main className="flex-1 flex overflow-hidden container p-0 md:p-4 max-w-6xl mx-auto h-[calc(100vh-64px)]">
        <div className="flex w-full h-full border rounded-none md:rounded-2xl overflow-hidden shadow-sm">
          
          {/* LEFT PANE: Conversations list */}
          <div className={`${activeChatId ? "hidden md:flex" : "flex"} w-full md:w-80 lg:w-96 flex-col border-r bg-muted/10`}>
             <div className="p-4 border-b h-16 flex items-center font-bold text-lg">
               Sohbetler
             </div>
             <div className="flex-1 overflow-y-auto">
               {conversations.length === 0 ? (
                 <div className="p-6 text-center text-muted-foreground text-sm">
                   Henüz mesajınız yok. Eşleşmelerden bir profil bulup sohbete başlayabilirsiniz.
                 </div>
               ) : (
                 conversations.map(c => (
                   <Link key={c.id} href={`/messages?chatId=${c.id}`}>
                     <div className={`p-4 border-b hover:bg-muted/30 cursor-pointer transition-colors flex flex-col gap-1 ${activeChatId === c.id ? "bg-muted/50 border-l-4 border-l-primary" : ""}`}>
                       <div className="font-semibold">{c.otherName}</div>
                       <div className="text-sm text-muted-foreground truncate">{c.lastMessage || "Sohbet başlatıldı..."}</div>
                     </div>
                   </Link>
                 ))
               )}
             </div>
          </div>

          {/* RIGHT PANE: Active Chat */}
          <div className={`${!activeChatId ? "hidden md:flex" : "flex"} flex-1 flex-col bg-background relative`}>
            {activeChatId ? (
              <>
                {/* Chat Header */}
                <div className="h-16 border-b flex items-center px-4 shrink-0 bg-muted/5 gap-3">
                  <Link href="/messages" className="md:hidden">
                     <Button variant="ghost" size="icon" className="shrink-0"><ArrowLeft className="w-5 h-5"/></Button>
                  </Link>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                     {activeConvo?.otherName?.[0]?.toUpperCase() || "!"}
                  </div>
                  <div className="font-bold">{activeConvo?.otherName || "Yükleniyor..."}</div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                  {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                      <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                      <p>Sohbeti başlatın!</p>
                    </div>
                  )}
                  {messages.map(m => {
                    const isMine = m.senderId === user.uid;
                    return (
                      <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                         <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${isMine ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted rounded-bl-sm"}`}>
                           <p className="text-sm md:text-base leading-relaxed break-words">{m.text}</p>
                         </div>
                      </div>
                    );
                  })}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-background border-t mt-auto">
                  <form onSubmit={handleSend} className="flex items-center gap-2">
                    <Input 
                      value={inputText} 
                      onChange={e => setInputText(e.target.value)}
                      placeholder="Bir mesaj yazın..." 
                      className="flex-1 rounded-full px-4"
                      autoFocus
                    />
                    <Button type="submit" disabled={!inputText.trim() || sending} size="icon" className="rounded-full shrink-0">
                      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground bg-muted/5">
                <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
                <h3 className="text-xl font-medium mb-2">Pebaaos Mesajlaşma</h3>
                <p>Soldaki panelden bir sohbet seçin veya profil eşleşmelerinden yeni birini bulun.</p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

export default function MessagesRoute() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
      <MessagesApp />
    </Suspense>
  );
}
