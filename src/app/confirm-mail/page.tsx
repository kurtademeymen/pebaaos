"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "@/lib/firebase";
import { applyActionCode } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck, CheckCircle2, XCircle } from "lucide-react";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { FadeInBlock } from "@/components/MotionWrappers";
import Link from "next/link";

function ConfirmMailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode");
  const mode = searchParams.get("mode");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    !oobCode ? "error" : "loading"
  );
  const [message, setMessage] = useState(
    !oobCode ? "Geçersiz veya eksik doğrulama kodu." : "E-posta adresiniz doğrulanıyor, lütfen bekleyin..."
  );

  useEffect(() => {
    if (!oobCode) {
      setStatus("error");
      setMessage("Geçersiz veya eksik doğrulama kodu.");
      return;
    }

    if (mode && mode !== "verifyEmail") {
      // Just in case it's another type of action code like resetPassword
      setStatus("error");
      setMessage("Geçersiz işlem türü. Bu sayfa sadece e-posta doğrulaması içindir.");
      return;
    }

    applyActionCode(auth, oobCode)
      .then(() => {
        setStatus("success");
        setMessage("E-posta adresiniz başarıyla doğrulandı!");
      })
      .catch((error) => {
        console.error("Email verification error:", error);
        setStatus("error");
        switch (error.code) {
          case "auth/expired-action-code":
            setMessage("Doğrulama bağlantısının süresi dolmuş. Lütfen yeni bir bağlantı isteyin.");
            break;
          case "auth/invalid-action-code":
            setMessage("Doğrulama bağlantısı geçersiz veya daha önceden kullanılmış.");
            break;
          default:
            setMessage("Doğrulama işlemi sırasında bir hata oluştu.");
        }
      });
  }, [oobCode, mode]);

  return (
    <div className="bg-card/70 backdrop-blur-xl border border-border/50 shadow-2xl rounded-3xl p-8 relative overflow-hidden text-center">
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none" />
      
      <div className="relative z-10">
        {status === "loading" && (
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-16 h-16 animate-spin text-primary" />
            <h2 className="text-2xl font-bold tracking-tight">Doğrulanıyor...</h2>
            <p className="text-muted-foreground">{message}</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-2 text-green-500">Doğrulama Başarılı!</h2>
              <p className="text-muted-foreground">{message}</p>
            </div>
            <Button onClick={() => router.push("/auth")} className="w-full h-12 rounded-full font-bold shadow-lg shadow-primary/20 mt-4">
              Giriş Sayfasına Dön
            </Button>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center">
              <XCircle className="w-10 h-10 text-destructive" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-2 text-destructive">Doğrulama Başarısız</h2>
              <p className="text-muted-foreground">{message}</p>
            </div>
            <Button onClick={() => router.push("/auth")} variant="outline" className="w-full h-12 rounded-full font-bold mt-4">
              Giriş Sayfasına Dön
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ConfirmMailPage() {
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
        
        <Suspense fallback={
          <div className="bg-card/70 backdrop-blur-xl border border-border/50 shadow-2xl rounded-3xl p-8 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        }>
          <ConfirmMailContent />
        </Suspense>
      </FadeInBlock>
    </div>
  );
}
