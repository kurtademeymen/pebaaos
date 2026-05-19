"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowRight, ShieldCheck, Mail, Key } from "lucide-react";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, getAdditionalUserInfo } from "firebase/auth";
import { getReferenceKey, markKeyAsUsed } from "@/lib/db";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { FadeInBlock } from "@/components/MotionWrappers";
import Link from "next/link";

export default function AuthPage() {
  const router = useRouter();
  
  // States
  const [mode, setMode] = useState<"check" | "register" | "login" | "reset">("check");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  // Form fields
  const [refCode, setRefCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validKeyId, setValidKeyId] = useState("");

  const [isAuthFlow, setIsAuthFlow] = useState(false);

  // Auto redirect if already logged in (only if not in active auth flow)
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(user => {
      if (user && !isAuthFlow) router.push("/dashboard");
    });
    return () => unsub();
  }, [router, isAuthFlow]);

  const handleCheckCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refCode) return;
    setLoading(true);
    setError("");
    
    try {
      const keyObj = await getReferenceKey(refCode);
      if (!keyObj) throw new Error("Geçersiz referans kodu. Lütfen tekrar kontrol edin.");
      if (keyObj.isUsed) throw new Error("Bu referans kodu zaten kullanılmış.");
      
      setValidKeyId(keyObj.id!);
      setMode("register");
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !validKeyId) return;
    setLoading(true);
    setError("");
    setIsAuthFlow(true);

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(cred.user);
      await markKeyAsUsed(validKeyId, cred.user.uid);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Kayıt işlemi başarısız.");
      setLoading(false);
      setIsAuthFlow(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError("");
    setIsAuthFlow(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError("Giriş başarısız. Lütfen bilgilerinizi kontrol edin.");
      setLoading(false);
      setIsAuthFlow(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMsg("Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.");
    } catch (err: any) {
      setError("Şifre sıfırlama başarısız. Geçerli bir e-posta girdiğinizden emin olun.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError("");
    setIsAuthFlow(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const additionalInfo = getAdditionalUserInfo(cred);
      
      if (mode === "login") {
        if (additionalInfo?.isNewUser) {
          await cred.user.delete();
          await auth.signOut();
          setIsAuthFlow(false);
          throw new Error("Bu Google hesabıyla ilişkili bir kayıt bulunamadı. Lütfen önce referans koduyla kayıt olun.");
        }
      } else if (mode === "register" && validKeyId) {
        if (additionalInfo?.isNewUser) {
          await markKeyAsUsed(validKeyId, cred.user.uid);
        } else {
          setIsAuthFlow(false);
          throw new Error("Bu Google hesabıyla zaten kayıtlısınız. Lütfen giriş yapın.");
        }
      }
      
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Google ile işlem başarısız oldu.");
      setLoading(false);
      setIsAuthFlow(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <AnimatedBackground />

      <FadeInBlock className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 mb-8 justify-center hover:opacity-80 transition-opacity">
          <div className="bg-gradient-to-tr from-primary to-purple-500 p-2 rounded-xl">
             <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-2xl tracking-tight">pebaaos</span>
        </Link>
        
        <div className="bg-card/70 backdrop-blur-xl border border-border/50 shadow-2xl rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none" />
          
          {error && (
            <div className="bg-destructive/10 border-l-4 border-destructive text-destructive p-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="bg-green-500/10 border-l-4 border-green-500 text-green-600 p-3 rounded-lg mb-6 text-sm">
              {successMsg}
            </div>
          )}

          {mode === "check" && (
            <form onSubmit={handleCheckCode} className="space-y-6 relative z-10">
              <div className="text-center mb-6">
                 <h2 className="text-2xl font-bold tracking-tight mb-2">Davetli Girişi</h2>
                 <p className="text-muted-foreground text-sm">Sisteme katılmak için referans kodunu girin.</p>
              </div>
              <div className="space-y-4">
                 <div className="space-y-2">
                   <Label htmlFor="code">Referans Kodu</Label>
                   <Input 
                      id="code" 
                      placeholder="Örn: XyZ7B12A" 
                      value={refCode} 
                      onChange={e => setRefCode(e.target.value)}
                      className="h-12 uppercase text-center font-mono text-lg tracking-widest"
                      maxLength={8}
                   />
                 </div>
                 <Button type="submit" className="w-full h-12 rounded-full font-bold shadow-lg shadow-primary/20" disabled={loading || refCode.length < 5}>
                   {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Doğrula"}
                 </Button>
              </div>

              <div className="mt-8 pt-6 border-t border-border/50 text-center">
                 <p className="text-sm text-muted-foreground mb-4">Zaten hesabın var mı?</p>
                 <Button variant="outline" type="button" onClick={() => { setMode("login"); setError(""); }} className="w-full rounded-full h-10 border-primary/20 hover:bg-primary/5">
                   Giriş Yap
                 </Button>
              </div>
            </form>
          )}

          {mode === "register" && (
            <form onSubmit={handleRegister} className="space-y-6 relative z-10">
              <div className="text-center mb-6">
                 <h2 className="text-2xl font-bold tracking-tight mb-2">Hesap Oluştur</h2>
                 <p className="text-muted-foreground text-sm">Referans kodun doğrulandı. Aramıza katıl!</p>
              </div>
              <div className="space-y-4">
                 <div className="space-y-2">
                   <Label htmlFor="email">E-posta</Label>
                   <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} className="h-12" />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="password">Şifre</Label>
                   <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} className="h-12" />
                 </div>
                 <Button type="submit" className="w-full h-12 rounded-full font-bold shadow-lg shadow-primary/20" disabled={loading}>
                   {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Kayıt Ol"}
                 </Button>
              </div>
              
              <div className="relative my-6">
                 <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/50" /></div>
                 <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">veya</span></div>
              </div>

              <Button type="button" variant="outline" onClick={handleGoogleAuth} className="w-full h-12 rounded-full font-medium" disabled={loading}>
                 <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
                 Google ile Kayıt Ol
              </Button>
            </form>
          )}

          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-6 relative z-10">
              <div className="text-center mb-6">
                 <h2 className="text-2xl font-bold tracking-tight mb-2">Giriş Yap</h2>
                 <p className="text-muted-foreground text-sm">Hesabına giriş yap ve kaldığın yerden devam et.</p>
              </div>
              <div className="space-y-4">
                 <div className="space-y-2">
                   <Label htmlFor="emailLogin">E-posta</Label>
                   <Input id="emailLogin" type="email" required value={email} onChange={e => setEmail(e.target.value)} className="h-12" />
                 </div>
                 <div className="space-y-2">
                   <div className="flex items-center justify-between">
                     <Label htmlFor="passwordLogin">Şifre</Label>
                     <button type="button" onClick={() => { setMode("reset"); setError(""); setSuccessMsg(""); }} className="text-xs text-primary hover:underline">Şifremi Unuttum</button>
                   </div>
                   <Input id="passwordLogin" type="password" required value={password} onChange={e => setPassword(e.target.value)} className="h-12" />
                 </div>
                 <Button type="submit" className="w-full h-12 rounded-full font-bold shadow-lg shadow-primary/20" disabled={loading}>
                   {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Giriş Yap"}
                 </Button>
              </div>

              <div className="relative my-6">
                 <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/50" /></div>
                 <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">veya</span></div>
              </div>

              <Button type="button" variant="outline" onClick={handleGoogleAuth} className="w-full h-12 rounded-full font-medium" disabled={loading}>
                 <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
                 Google ile Giriş Yap
              </Button>

              <div className="mt-6 text-center">
                 <button type="button" onClick={() => { setMode("check"); setError(""); setRefCode(""); }} className="text-sm text-primary hover:underline">
                   Yeni misin? Davet koduyla gel.
                 </button>
              </div>
            </form>
          )}

          {mode === "reset" && (
            <form onSubmit={handleResetPassword} className="space-y-6 relative z-10">
              <div className="text-center mb-6">
                 <h2 className="text-2xl font-bold tracking-tight mb-2">Şifre Sıfırlama</h2>
                 <p className="text-muted-foreground text-sm">Kayıtlı e-posta adresinizi girin, size bir sıfırlama bağlantısı gönderelim.</p>
              </div>
              <div className="space-y-4">
                 <div className="space-y-2">
                   <Label htmlFor="emailReset">E-posta</Label>
                   <Input id="emailReset" type="email" required value={email} onChange={e => setEmail(e.target.value)} className="h-12" />
                 </div>
                 <Button type="submit" className="w-full h-12 rounded-full font-bold shadow-lg shadow-primary/20" disabled={loading || !email}>
                   {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Bağlantı Gönder"}
                 </Button>
              </div>

              <div className="mt-6 text-center">
                 <button type="button" onClick={() => { setMode("login"); setError(""); setSuccessMsg(""); }} className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 mx-auto transition-colors">
                   <ArrowRight className="w-4 h-4 rotate-180" /> Giriş Sayfasına Dön
                 </button>
              </div>
            </form>
          )}

        </div>
      </FadeInBlock>
    </div>
  );
}
