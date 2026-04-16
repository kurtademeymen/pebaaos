"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, FileSearch, ShieldCheck, MessageCircle } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useAuth } from "@/components/AuthProvider";
import { Conversation } from "@/lib/chat";

export function Navbar() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Synthetic beep generator
  const playBeep = () => {
    try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'sine';
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); 
        oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); 
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.3);

        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.3);
    } catch(e) {}
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setIsAdmin(!!u);
    });
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", user.uid),
      orderBy("updatedAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      let count = 0;
      snap.forEach(doc => {
        const data = doc.data() as Conversation;
        if (data.unreadBy?.includes(user.uid)) count++;
      });
      
      setUnreadCount(prev => {
        if (count > prev && count > 0) {
          playBeep();
        }
        return count;
      });
    });
    return () => unsub();
  }, [user]);

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "pt-4 px-4" : "pt-0 px-0"}`}>
      <div className={`mx-auto flex h-16 items-center justify-between transition-all duration-500 ease-out ${
          scrolled 
            ? "max-w-5xl rounded-full bg-background/70 backdrop-blur-xl border border-border/50 shadow-lg px-6" 
            : "w-full border-b bg-background/50 backdrop-blur-md px-4 md:px-8"
        }`}>
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="bg-gradient-to-tr from-primary to-purple-500 p-1.5 rounded-xl shadow-inner">
               <Users className="h-5 w-5 text-white" />
            </div>
            <span>pebaaos</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {user && (
            <>
              <Link href="/messages" className="text-sm font-medium hover:text-primary transition-colors flex items-center relative group">
                <div className="p-2 bg-muted rounded-full group-hover:bg-primary/10 transition-colors relative">
                  <MessageCircle className="w-5 h-5 text-foreground group-hover:text-primary" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center shadow-sm animate-in zoom-in">
                      {unreadCount}
                    </span>
                  )}
                </div>
              </Link>
              <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors flex items-center">
                Panelim
              </Link>
            </>
          )}
          <Link href="/matches" className="hover:text-primary transition-colors flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
            <FileSearch className="w-4 h-4" />
            <span>Eşleşmeleri Bul</span>
          </Link>
          {isAdmin ? null : (
            <Link href={isAdmin || auth.currentUser ? "/dashboard" : "/auth"} className="hover:text-primary transition-colors flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
              <UserPlus className="w-4 h-4" />
              <span>{auth.currentUser ? "Profil Oluştur / Yönet" : "Kayıt Ol / Giriş Yap"}</span>
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href={auth.currentUser ? "/dashboard" : "/auth"} className="md:hidden">
             <Button size="sm" className="rounded-full shadow-md">{auth.currentUser ? "Yönetim" : "Katıl"}</Button>
          </Link>
          
          {isAdmin && (
            <Link href="/admin">
              <Button variant="outline" size="sm" className="hidden md:flex gap-1.5 rounded-full border-primary/20 bg-primary/5">
                <ShieldCheck className="w-4 h-4" />
                Admin
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
