"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tag } from "@/components/Tag";
import { createProfile } from "@/lib/db";
import { StaggerChildren, StaggerItem, FadeInBlock } from "@/components/MotionWrappers";
import { CheckCircle2, ChevronRight, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { TeamProfile } from "@/types";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TeamJoinPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<TeamProfile>>({
    profileType: "team",
    username: "",
    teamName: "",
    projectStage: "Fikir Aşaması",
    bio: "",
    skills: [], // We can use this for tech stack
    lookingFor: [],
    contactType: "Discord",
    contactValue: "",
  });

  const [skillInput, setSkillInput] = useState("");
  const [lookingForInput, setLookingForInput] = useState("");

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>, field: "skills" | "lookingFor", inputValue: string, setInputValue: (v: string) => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = inputValue.trim();
      if (value && !(formData[field] || []).includes(value)) {
        setFormData(prev => ({
          ...prev,
          [field]: [...(prev[field] || []), value]
        }));
        setInputValue("");
      }
    }
  };

  const removeTag = (field: "skills" | "lookingFor", tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] || []).filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await createProfile({
        ...formData,
        uid: user!.uid,
      } as TeamProfile);
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/20 py-12">
        <div className="container max-w-2xl mx-auto px-4">
          <FadeInBlock className="mb-10">
            <h1 className="text-4xl font-extrabold tracking-tight mb-2 sm:text-5xl text-purple-600 drop-shadow-sm">Ekip İlanı Ver</h1>
            <p className="text-muted-foreground text-lg text-balance">
              Projeni anlat ve tam olarak hangi rolleri aradığını belirt. Doğru takım arkadaşlarını bul.
            </p>
          </FadeInBlock>

          {success ? (
            <FadeInBlock className="p-10 border rounded-3xl bg-card border-purple-500/30 text-center shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-purple-500/5 backdrop-blur-xl"></div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <CheckCircle2 className="w-10 h-10 text-purple-600" />
                </div>
                <h2 className="text-3xl font-bold mb-3 text-purple-600">İlan Başarıyla Gönderildi!</h2>
                <p className="text-muted-foreground mb-8 text-lg">
                  Proje ilanın onaylanmak üzere sıraya alındı. Yönetici onayının ardından platformda yayınlanacaktır.
                </p>
                <Link href="/dashboard">
                  <Button size="lg" className="rounded-full px-8 bg-purple-600 hover:bg-purple-700 shadow-purple-500/20 shadow-lg block mx-auto">Panoya Dön</Button>
                </Link>
              </div>
            </FadeInBlock>
          ) : (
            <form onSubmit={handleSubmit} className="border border-purple-500/20 bg-card/60 backdrop-blur-xl shadow-2xl rounded-3xl p-6 sm:p-10 text-left">
              {error && (
                <FadeInBlock className="bg-destructive/10 border-l-4 border-destructive text-destructive p-4 rounded-xl mb-8 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>{error}</p>
                </FadeInBlock>
              )}

              <StaggerChildren className="space-y-10">
                <StaggerItem className="space-y-5">
                  <div className="border-b border-purple-500/20 pb-2">
                    <h2 className="text-xl font-bold text-purple-600">Proje Detayları</h2>
                    <p className="text-sm text-muted-foreground">Projeniz / Ekibiniz hakkında bilgi verin.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">İlan / Kısayol URL'si <span className="text-destructive">*</span></Label>
                      <Input 
                        id="username" 
                        required 
                        value={formData.username} 
                        onChange={e => setFormData({...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")})} 
                        placeholder="orn-proje-adi" 
                      />
                      <p className="text-[10px] text-muted-foreground">Sadece küçük harf, sayı ve tire (-).</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="teamName">Proje / Ekip Adı <span className="text-destructive">*</span></Label>
                      <Input id="teamName" required value={formData.teamName} onChange={e => setFormData({...formData, teamName: e.target.value})} placeholder="Nova Yazılım" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="projectStage">Proje Aşaması</Label>
                    <Select value={formData.projectStage} onValueChange={v => setFormData({...formData, projectStage: v as TeamProfile['projectStage']})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fikir Aşaması">Fikir Aşaması</SelectItem>
                        <SelectItem value="Prototip">Prototip</SelectItem>
                        <SelectItem value="Geliştirme">Geliştirme</SelectItem>
                        <SelectItem value="Yayınlandı">Yayınlandı</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Projenin Amacı ve Detayları <span className="text-destructive">*</span></Label>
                    <Textarea id="bio" required value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} placeholder="Projemiz okuldaki öğrencilerin..." rows={4} />
                  </div>
                </StaggerItem>

                <StaggerItem className="space-y-5 pt-4">
                  <div className="border-b border-purple-500/20 pb-2">
                    <h2 className="text-xl font-bold text-purple-600">Kullanılan Teknolojiler & Aranılan Roller</h2>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="skills">Kullanılan Ana Teknolojiler / Araçlar</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.skills?.map(skill => <Tag key={skill} text={skill} variant="primary" onRemove={() => removeTag("skills", skill)} />)}
                    </div>
                    <Input id="skills" value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => handleAddTag(e, "skills", skillInput, setSkillInput)} placeholder="Örn: React, Firebase (Enter'a bas)" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lookingFor">Hangi Rollere İhtiyacınız Var? <span className="text-destructive">*</span></Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.lookingFor?.map(item => <Tag key={item} text={item} variant="outline" onRemove={() => removeTag("lookingFor", item)} />)}
                    </div>
                    <Input id="lookingFor" value={lookingForInput} onChange={e => setLookingForInput(e.target.value)} onKeyDown={e => handleAddTag(e, "lookingFor", lookingForInput, setLookingForInput)} placeholder="Örn: Frontend Geliştirici, UI/UX (Enter'a bas)" />
                  </div>
                </StaggerItem>

                <StaggerItem className="space-y-5 pt-4">
                  <div className="border-b border-purple-500/20 pb-2">
                    <h2 className="text-xl font-bold text-purple-600">İletişim</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactType">İletişim Türü</Label>
                      <Select value={formData.contactType} onValueChange={v => setFormData({...formData, contactType: v as any})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Instagram">Instagram</SelectItem>
                          <SelectItem value="E-posta">E-posta</SelectItem>
                          <SelectItem value="Discord">Discord</SelectItem>
                          <SelectItem value="Diğer">Diğer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactValue">İletişim Adresi <span className="text-destructive">*</span></Label>
                      <Input id="contactValue" required value={formData.contactValue} onChange={e => setFormData({...formData, contactValue: e.target.value})} placeholder="Adaylar nereden ulaşsın?" />
                    </div>
                  </div>
                </StaggerItem>

                <StaggerItem className="pt-6 border-t border-purple-500/20 flex justify-end">
                  <Button type="submit" disabled={loading || !formData.lookingFor?.length} size="lg" className="w-full sm:w-auto px-8 h-12 rounded-full font-bold shadow-purple-500/25 shadow-xl hover:shadow-purple-500/40 transition-shadow bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-700 hover:to-indigo-600">
                    {loading ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Gönderiliyor...</>
                    ) : (
                      <><Sparkles className="mr-2 h-5 w-5" /> İlanı Yayınla <ChevronRight className="ml-1 w-5 h-5" /></>
                    )}
                  </Button>
                </StaggerItem>
              </StaggerChildren>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
