"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { getMyProfiles, deleteProfile } from "@/lib/db";
import { PersonalProfile, TeamProfile } from "@/types";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { FadeInBlock } from "@/components/MotionWrappers";
import { UserCard } from "@/components/UserCard";
import { Loader2, Plus, LogOut, CheckCircle2, Clock } from "lucide-react";
import { auth } from "@/lib/firebase";
import Link from "next/link";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [personal, setPersonal] = useState<PersonalProfile | null>(null);
  const [teams, setTeams] = useState<TeamProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
      return;
    }

    if (user) {
      getMyProfiles(user.uid).then((res) => {
        setPersonal(res.personal);
        setTeams(res.teams);
        setLoading(false);
      });
    }
  }, [user, authLoading, router]);

  const handleDelete = async (type: "personal" | "team", id?: string) => {
    if (!id || !confirm("Emin misiniz? Bu işlem geri alınamaz.")) return;
    setLoading(true);
    await deleteProfile(id, type);
    const res = await getMyProfiles(user!.uid);
    setPersonal(res.personal);
    setTeams(res.teams);
    setLoading(false);
  };

  if (authLoading || loading) {
    return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-muted/10">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-24 max-w-5xl">
        <FadeInBlock className="flex justify-between items-end border-b pb-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Hesap Yönetimi</h1>
            <p className="text-muted-foreground mt-1">Hoş geldin, {user.email}</p>
          </div>
          <Button variant="outline" onClick={() => auth.signOut()} className="rounded-full shadow-sm">
            <LogOut className="w-4 h-4 mr-2" /> Çıkış Yap
          </Button>
        </FadeInBlock>

        {!user.emailVerified && (
          <FadeInBlock className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 rounded-xl mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
               <h3 className="font-bold text-lg">E-postanız doğrulanmamış!</h3>
               <p className="text-sm">Platformu kullanmaya başlamak için e-posta kutunuza gönderilen doğrulama linkine tıklamanız gerekmektedir.</p>
            </div>
            <Button variant="outline" className="border-orange-500 text-orange-700 hover:bg-orange-200 shrink-0" onClick={() => { auth.currentUser?.reload(); window.location.reload(); }}>
              Doğruladım, Yenile
            </Button>
          </FadeInBlock>
        )}

        <div className="grid md:grid-cols-2 gap-8 relative">
          {!user.emailVerified && (
            <div className="absolute inset-0 z-50 bg-background/50 backdrop-blur-sm rounded-3xl" />
          )}

          {/* PERSONAL PROFILE */}
          <FadeInBlock delay={0.1}>
            <div className="bg-card border rounded-3xl p-6 shadow-xl relative overflow-hidden h-full flex flex-col">
              <div className="flex justify-between items-start mb-6">
                 <div>
                   <h2 className="text-xl font-bold">Kişisel Profilim</h2>
                   <p className="text-sm text-muted-foreground">Kendi yeteneklerinizi sergilersiniz.</p>
                 </div>
                 {personal && (
                   <span className={`px-2 py-1 flex items-center gap-1 text-xs font-bold rounded-full ${personal.isApproved ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"}`}>
                     {personal.isApproved ? <><CheckCircle2 className="w-3 h-3"/> Onaylı</> : <><Clock className="w-3 h-3"/> Onay Bekliyor</>}
                   </span>
                 )}
              </div>

              {personal ? (
                <div className="flex-1 flex flex-col">
                   <div className="pointer-events-none opacity-80 scale-95 origin-top">
                     <UserCard user={personal} />
                   </div>
                   <Button variant="destructive" onClick={() => handleDelete("personal", personal.id)} className="w-full mt-4 rounded-full">Kişisel Profilimi Sil</Button>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-muted/30 rounded-2xl border border-dashed">
                  <p className="text-muted-foreground mb-4">Henüz bir kişisel profilin yok.</p>
                  <Link href="/dashboard/personal">
                    <Button className="rounded-full shadow-lg shadow-primary/20"><Plus className="w-4 h-4 mr-2" /> Kişisel Profil Oluştur</Button>
                  </Link>
                </div>
              )}
            </div>
          </FadeInBlock>

          {/* TEAM PROFILES */}
          <FadeInBlock delay={0.2}>
            <div className="bg-card border border-purple-500/20 rounded-3xl p-6 shadow-xl relative overflow-hidden h-full flex flex-col">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none" />
              <div className="relative z-10 flex justify-between items-start mb-6">
                 <div>
                   <h2 className="text-xl font-bold">Ekip / Proje İlanlarım</h2>
                   <p className="text-sm text-muted-foreground">Takımınıza arkadaş aradığınız ilanlar (Max 3).</p>
                 </div>
                 <span className="text-xs font-bold bg-purple-100 text-purple-700 px-2 py-1 rounded-full">{teams.length} / 3</span>
              </div>

              {teams.length > 0 ? (
                <div className="flex-1 flex flex-col gap-4 relative z-10">
                   {teams.map((t) => (
                     <div key={t.id} className="bg-background rounded-xl p-4 border shadow-sm flex flex-col">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-lg text-primary">{t.teamName}</h3>
                          <span className={`px-2 py-1 flex items-center gap-1 text-[10px] font-bold rounded-full ${t.isApproved ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"}`}>
                             {t.isApproved ? "Onaylı" : "Bekliyor"}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{t.bio}</p>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete("team", t.id)} className="w-full mt-4 rounded-md">Sil</Button>
                     </div>
                   ))}
                   
                   {teams.length < 3 && (
                      <Link href="/dashboard/team" className="mt-2">
                        <Button variant="outline" className="w-full rounded-full border-purple-500/30 text-purple-600 hover:bg-purple-50"><Plus className="w-4 h-4 mr-2" /> Yeni İlan Ekle</Button>
                      </Link>
                   )}
                </div>
              ) : (
                <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center p-8 bg-muted/30 rounded-2xl border border-dashed">
                  <p className="text-muted-foreground mb-4">Bir projeniz için takım arkadaşı aramıyorsunuz.</p>
                  <Link href="/dashboard/team">
                    <Button className="rounded-full shadow-lg shadow-purple-500/20 bg-purple-600 hover:bg-purple-700 text-white"><Plus className="w-4 h-4 mr-2" /> Yeni Ekip İlanı Aç</Button>
                  </Link>
                </div>
              )}
            </div>
          </FadeInBlock>

        </div>
      </main>
      <Footer />
    </div>
  );
}
