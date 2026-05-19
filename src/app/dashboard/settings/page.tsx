"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail, updateEmail } from "firebase/auth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FadeInBlock } from "@/components/MotionWrappers";
import { Loader2, ArrowLeft, Mail, Key, ShieldCheck, LogOut, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [newEmail, setNewEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  if (authLoading) {
    return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!user) {
    router.push("/auth");
    return null;
  }

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || newEmail === user.email) return;

    setEmailLoading(true);
    try {
      await updateEmail(user, newEmail);
      toast.success("E-posta adresiniz başarıyla güncellendi.");
      setNewEmail("");
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        toast.error("Güvenlik nedeniyle bu işlem için yeniden giriş yapmanız gerekiyor. Lütfen çıkış yapıp tekrar girin.");
      } else {
        toast.error(error.message || "E-posta güncellenirken bir hata oluştu.");
      }
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user.email) return;
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, user.email);
      toast.success("Şifre sıfırlama bağlantısı e-posta adresinize gönderildi!");
    } catch (error: any) {
      toast.error(error.message || "Şifre sıfırlama maili gönderilemedi.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/10">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-24 max-w-3xl">
        <FadeInBlock>
          <div className="mb-8 flex flex-col items-start">
            <Link href="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-1" /> Panele Dön
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
              Hesap Ayarları
            </h1>
            <p className="text-muted-foreground mt-2">Güvenlik bilgilerini ve hesap tercihlerini buradan yönetebilirsin.</p>
          </div>

          <div className="space-y-8">
            
            {/* Account Info Card */}
            <div className="bg-card border rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-primary/10 text-primary flex items-center justify-center rounded-full font-bold uppercase text-2xl">
                    {user.email?.substring(0, 2)}
                  </div>
                  <div>
                    <h2 className="font-bold text-xl">{user.email}</h2>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      {user.emailVerified ? (
                        <span className="flex items-center text-green-600 font-medium"><CheckCircle2 className="w-4 h-4 mr-1" /> Doğrulanmış Hesap</span>
                      ) : (
                        <span className="flex items-center text-orange-600 font-medium">Doğrulanmamış Hesap</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Email Change Form */}
              <form onSubmit={handleUpdateEmail} className="relative z-10 space-y-4 mb-8">
                <h3 className="text-lg font-bold flex items-center mb-4">
                  <Mail className="w-5 h-5 mr-2 text-primary" /> E-posta Adresini Değiştir
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="newEmail">Yeni E-posta Adresi</Label>
                  <div className="flex gap-3 flex-col sm:flex-row">
                    <Input 
                      id="newEmail" 
                      type="email" 
                      placeholder="yeni@ornek.com" 
                      value={newEmail} 
                      onChange={e => setNewEmail(e.target.value)}
                      className="h-12 flex-1"
                      required
                    />
                    <Button type="submit" disabled={emailLoading || !newEmail} className="h-12 w-full sm:w-auto px-8 rounded-xl shadow-md">
                      {emailLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Güncelle
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    E-posta değiştirmek için yakın zamanda giriş yapmış olmanız gerekmektedir. Hata alırsanız çıkış yapıp tekrar girin.
                  </p>
                </div>
              </form>

              {/* Password Reset */}
              <div className="relative z-10 space-y-4 border-t pt-8">
                <h3 className="text-lg font-bold flex items-center mb-2">
                  <Key className="w-5 h-5 mr-2 text-primary" /> Şifre Sıfırlama
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Şifrenizi değiştirmek veya sıfırlamak için size güvenli bir bağlantı göndereceğiz.
                </p>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handlePasswordReset} 
                  disabled={resetLoading} 
                  className="h-12 rounded-xl group border-primary/20 hover:bg-primary/5 transition-all"
                >
                  {resetLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShieldCheck className="w-4 h-4 mr-2 group-hover:text-primary transition-colors" />}
                  Şifre Sıfırlama Maili Gönder
                </Button>
              </div>

            </div>

            {/* Logout/Danger Zone */}
            <div className="bg-card border border-destructive/20 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="font-bold text-destructive flex items-center"><LogOut className="w-5 h-5 mr-2" /> Çıkış Yap</h3>
                <p className="text-sm text-muted-foreground mt-1">Mevcut oturumunuzu sonlandırır.</p>
              </div>
              <Button variant="destructive" className="rounded-xl w-full md:w-auto" onClick={() => {
                auth.signOut();
                router.push("/");
              }}>
                Hesaptan Çıkış Yap
              </Button>
            </div>

          </div>
        </FadeInBlock>
      </main>
      <Footer />
    </div>
  );
}
