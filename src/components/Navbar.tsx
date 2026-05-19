"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, FileSearch, ShieldCheck, MessageCircle, Bell, Menu, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useAuth } from "@/components/AuthProvider";
import { Conversation } from "@/lib/chat";
import { AppNotification } from "@/types";
import { markNotificationAsRead } from "@/lib/db";

export function Navbar() {
  const { user, isAdmin } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

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
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
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
        if (count > prev && count > 0) playBeep();
        return count;
      });
    });

    const nq = query(
      collection(db, "notifications"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsubN = onSnapshot(nq, (snap) => {
      const notifs = snap.docs.map(d => ({ id: d.id, ...d.data() } as AppNotification));
      setNotifications(notifs);
      const unread = notifs.filter(n => !n.isRead).length;
      setUnreadNotifCount(prev => {
        if (unread > prev && unread > 0) playBeep();
        return unread;
      });
    });

    return () => {
      unsub();
      unsubN();
    };
  }, [user]);

  const handleNotifClick = async (notif: AppNotification) => {
    if (!notif.isRead && notif.id) {
      await markNotificationAsRead(notif.id);
    }
  };

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
              <div className="relative">
                <button 
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="p-2 bg-muted rounded-full hover:bg-primary/10 transition-colors relative"
                >
                  <Bell className="w-5 h-5 text-foreground hover:text-primary" />
                  {unreadNotifCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center shadow-sm animate-in zoom-in">
                      {unreadNotifCount}
                    </span>
                  )}
                </button>
                
                {isNotifOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)}></div>
                    <div className="absolute right-0 top-full mt-2 w-80 bg-background border rounded-xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[400px]">
                      <div className="p-3 bg-muted/50 font-bold text-sm border-b">Bildirimler</div>
                      <div className="overflow-y-auto flex-1">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-sm text-muted-foreground">Henüz bildiriminiz yok.</div>
                        ) : (
                          notifications.map((n) => (
                            <div 
                              key={n.id} 
                              onClick={() => handleNotifClick(n)}
                              className={`p-3 border-b last:border-0 hover:bg-muted/50 cursor-pointer transition-colors ${!n.isRead ? 'bg-primary/5' : ''}`}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <h4 className={`text-sm ${!n.isRead ? 'font-bold text-primary' : 'font-semibold'}`}>{n.title}</h4>
                                {!n.isRead && <span className="w-2 h-2 rounded-full bg-primary mt-1 shrink-0"></span>}
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

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
          <Link href="/kesfet" className="hover:text-primary transition-colors flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
            <FileSearch className="w-4 h-4" />
            <span>Keşfet</span>
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
          <Link href={user ? "/dashboard" : "/auth"} className="hidden md:flex">
             <Button size="sm" className="rounded-full shadow-md">{user ? "Yönetim" : "Katıl"}</Button>
          </Link>
          
          {isAdmin && (
            <Link href="/admin">
              <Button variant="outline" size="sm" className="hidden md:flex gap-1.5 rounded-full border-primary/20 bg-primary/5">
                <ShieldCheck className="w-4 h-4" />
                Admin
              </Button>
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 bg-muted rounded-full hover:bg-primary/10 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-40 bg-background/95 backdrop-blur-xl border-t flex flex-col p-6 animate-in slide-in-from-top-2">
          <nav className="flex flex-col gap-6 text-lg font-medium">
            <Link href="/kesfet" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors">
              <FileSearch className="w-6 h-6 text-primary" /> Keşfet
            </Link>
            
            {user ? (
              <>
                <Link href="/messages" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors">
                  <MessageCircle className="w-6 h-6 text-primary" /> Mesajlar
                  {unreadCount > 0 && <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">{unreadCount} Yeni</span>}
                </Link>
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors">
                  <UserPlus className="w-6 h-6 text-primary" /> Panelim
                </Link>
                {isAdmin && (
                  <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors">
                    <ShieldCheck className="w-6 h-6 text-red-500" /> Admin Paneli
                  </Link>
                )}
              </>
            ) : (
              <Link href="/auth" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors">
                <UserPlus className="w-6 h-6 text-primary" /> Kayıt Ol / Giriş Yap
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
