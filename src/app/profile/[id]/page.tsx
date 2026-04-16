"use client";

import { useEffect, useState, use } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Loader } from "@/components/Loader";
import { ErrorState } from "@/components/StateComponents";
import { Tag } from "@/components/Tag";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getUserById } from "@/lib/users";
import { UserProfile, PersonalProfile, TeamProfile } from "@/types";
import { getOrCreateConversation } from "@/lib/chat";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, AtSign, Gamepad2, Link2, Calendar, Clock, MessageCircle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const [startingChat, setStartingChat] = useState(false);

  const handleStartChat = async () => {
    if (!currentUser) return router.push("/auth");
    if (!user) return;
    try {
      setStartingChat(true);
      const chatId = await getOrCreateConversation(currentUser.uid, user.uid);
      router.push(`/messages?chatId=${chatId}`);
    } catch(err) {
      alert("Sohbet başlatılırken hata oluştu.");
      setStartingChat(false);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const data = await getUserById(unwrappedParams.id);
        if (!data || !data.isVisible || !data.isApproved) {
          // Instead of redirecting directly, we will just show an error state if they are hidden/unapproved
          throw new Error("Kullanıcı veya proje bulunamadı / gizli.");
        }
        setUser(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Profil yüklenemedi.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [unwrappedParams.id]);

  const getContactIcon = (type: string) => {
    switch (type) {
      case "Instagram": return <AtSign className="w-5 h-5 mr-2" />;
      case "E-posta": return <Mail className="w-5 h-5 mr-2" />;
      case "Discord": return <Gamepad2 className="w-5 h-5 mr-2" />;
      default: return <Link2 className="w-5 h-5 mr-2" />;
    }
  };

  const getContactHref = (type: string, value: string) => {
    switch (type) {
      case "Instagram": return `https://instagram.com/${value.replace('@', '')}`;
      case "E-posta": return `mailto:${value}`;
      case "Discord": return "#"; // Discord ID doesn't link directly
      default: return value.startsWith('http') ? value : `https://${value}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader text="Profil yükleniyor..." />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-20 flex justify-center">
          <div className="w-full max-w-md">
            <ErrorState title="Profil Bulunamadı" error={error || ""} />
            <div className="mt-8 text-center">
               <Link href="/matches">
                 <Button variant="outline">Eşleşmelere Geri Dön</Button>
               </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Format date
  let joinDate = "Bilinmiyor";
  if (user.createdAt?.seconds) {
    joinDate = new Date(user.createdAt.seconds * 1000).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/10 py-10">
        <div className="container max-w-4xl mx-auto px-4">
          
          <Link href="/matches">
            <Button variant="ghost" className="mb-6 -ml-4 hover:bg-transparent">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri Dön
            </Button>
          </Link>

          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Sidebar / Profile Card */}
            <div className="md:col-span-1 space-y-6">
              <div className="bg-background border rounded-2xl p-6 text-center shadow-sm">
                <div className="w-24 h-24 bg-primary/10 text-primary flex items-center justify-center rounded-full text-3xl font-bold mx-auto mb-4 uppercase">
                  {(user.profileType === "personal" ? (user as PersonalProfile).displayName : (user as TeamProfile).teamName).substring(0, 2)}
                </div>
                <h1 className="text-2xl font-bold">
                  {user.profileType === "personal" ? (user as PersonalProfile).displayName : (user as TeamProfile).teamName}
                </h1>
                <div className="flex flex-wrap justify-center gap-2 mt-3">
                  {user.profileType === "personal" ? (
                    <>
                      <Badge variant="secondary" className="font-normal">{(user as PersonalProfile).grade}. Sınıf</Badge>
                      {(user as PersonalProfile).isActivelyLooking && <Badge className="bg-green-500 hover:bg-green-600">Ekip Arıyor</Badge>}
                    </>
                  ) : (
                    <Badge variant="secondary" className="font-normal border-purple-200 text-purple-700 bg-purple-50">{(user as TeamProfile).projectStage}</Badge>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t flex flex-col items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Katılım: {joinDate}
                  </div>
                  {user.profileType === "personal" && (
                     <div className="flex items-center">
                       <Clock className="w-4 h-4 mr-2" />
                       Haftalık: {(user as PersonalProfile).availability}
                     </div>
                  )}
                </div>
              </div>

              <div className="bg-background border rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold mb-4 border-b pb-2">İletişim</h3>
                <a 
                  href={getContactHref(user.contactType, user.contactValue)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center p-3 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors break-all"
                >
                  {getContactIcon(user.contactType)}
                  <span className="font-medium text-sm">{user.contactValue}</span>
                </a>
                
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-sm font-semibold mb-3 text-muted-foreground">pebaaos İçi Mesajlaşma</h3>
                  <Button 
                    onClick={handleStartChat} 
                    disabled={startingChat || (currentUser?.uid === user.uid)}
                    className="w-full h-12 text-md rounded-xl bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-500 shadow-md"
                  >
                    {startingChat ? <Loader className="w-5 h-5 mr-2 animate-spin" /> : <MessageCircle className="w-5 h-5 mr-2" />}
                    {currentUser?.uid === user.uid ? "Kendi Profilin" : "Direkt Mesaj At"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="md:col-span-2 space-y-8">
              
              <div className="bg-background border rounded-2xl p-6 md:p-8 shadow-sm">
                <h2 className="text-xl font-bold mb-4">Hakkında</h2>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {user.bio}
                  </p>
                </div>
              </div>

              <div className="bg-background border rounded-2xl p-6 md:p-8 shadow-sm">
                <h2 className="text-xl font-bold mb-4">Beceriler</h2>
                <div className="flex flex-wrap gap-2">
                  {user.skills.length > 0 ? (
                    user.skills.map(s => <Tag key={s} text={s} variant="primary" />)
                  ) : (
                    <span className="text-muted-foreground text-sm">Belirtilmemiş</span>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {user.profileType === "personal" && (
                  <div className="bg-background border rounded-2xl p-6 md:p-8 shadow-sm">
                    <h2 className="text-xl font-bold mb-4">İlgi Alanları</h2>
                    <div className="flex flex-wrap gap-2">
                      {(user as PersonalProfile).interests.length > 0 ? (
                        (user as PersonalProfile).interests.map(s => <Tag key={s} text={s} variant="secondary" />)
                      ) : (
                        <span className="text-muted-foreground text-sm">Belirtilmemiş</span>
                      )}
                    </div>
                  </div>
                )}

                <div className="bg-background border rounded-2xl p-6 md:p-8 shadow-sm">
                  <h2 className="text-xl font-bold mb-4">Aradığı Ekip/Kişi</h2>
                  <div className="flex flex-wrap gap-2">
                    {user.lookingFor.length > 0 ? (
                      user.lookingFor.map(s => <Tag key={s} text={s} variant="outline" />)
                    ) : (
                      <span className="text-muted-foreground text-sm">Belirtilmemiş</span>
                    )}
                  </div>
                </div>
              </div>

            </div>
            
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
