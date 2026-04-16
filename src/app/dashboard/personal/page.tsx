"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tag } from "@/components/Tag";
import { createProfile } from "@/lib/db";
import { StaggerChildren, StaggerItem, FadeInBlock } from "@/components/MotionWrappers";
import { CheckCircle2, ChevronRight, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { PersonalProfile } from "@/types";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function JoinPage() {
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

  const [formData, setFormData] = useState<Partial<PersonalProfile>>({
    profileType: "personal",
    username: "",
    displayName: "",
    grade: "9",
    bio: "",
    skills: [],
    interests: [],
    lookingFor: [],
    availability: "Düşük (1-3 Saat)",
    contactType: "Instagram",
    contactValue: "",
    isActivelyLooking: true,
  });

  const [skillInput, setSkillInput] = useState("");
  const [interestInput, setInterestInput] = useState("");
  const [lookingForInput, setLookingForInput] = useState("");
  const [kvkk, setKvkk] = useState(false);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>, field: "skills" | "interests" | "lookingFor", inputValue: string, setInputValue: (v: string) => void) => {
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

  const removeTag = (field: "skills" | "interests" | "lookingFor", tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] || []).filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!kvkk) {
      setError("Kaydolmadan önce KVKK metnini onaylamanız gerekmektedir.");
      return;
    }
    
    setLoading(true);
    try {
      await createProfile({
        ...formData,
        uid: user!.uid,
      } as PersonalProfile);
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
            <h1 className="text-4xl font-extrabold tracking-tight mb-2 sm:text-5xl drop-shadow-sm">Aramıza Katıl</h1>
            <p className="text-muted-foreground text-lg text-balance">
              Yeteneklerini sergile, ne aradığını söyle ve doğru takım arkadaşlarını bul.
            </p>
          </FadeInBlock>

          {success ? (
            <FadeInBlock className="p-10 border rounded-3xl bg-card border-green-500/30 text-center shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-green-500/5 backdrop-blur-xl"></div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold mb-3 text-green-600">Harika! Başarıyla Gönderildi</h2>
                <p className="text-muted-foreground mb-8 text-lg">
                  Profilin onaylanmak üzere sıraya alındı. Yönetici onayının ardından eşleşme listesinde görünür olacaksın.
                </p>
                <Link href="/dashboard">
                  <Button size="lg" className="rounded-full px-8 shadow-green-500/20 shadow-lg hover:shadow-green-500/40">Panotya Dön</Button>
                </Link>
              </div>
            </FadeInBlock>
          ) : (
            <form onSubmit={handleSubmit} className="border bg-card/60 backdrop-blur-xl shadow-2xl rounded-3xl p-6 sm:p-10 text-left">
              {error && (
                <FadeInBlock className="bg-destructive/10 border-l-4 border-destructive text-destructive p-4 rounded-xl mb-8 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>{error}</p>
                </FadeInBlock>
              )}

              <StaggerChildren className="space-y-10">
                <StaggerItem className="space-y-5">
                  <div className="border-b pb-2">
                    <h2 className="text-xl font-bold">Kişisel Bilgiler</h2>
                    <p className="text-sm text-muted-foreground">Seni nasıl tanıyabiliriz?</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Kullanıcı Adı (URL) <span className="text-destructive">*</span></Label>
                      <Input 
                        id="username" 
                        required 
                        value={formData.username} 
                        onChange={e => setFormData({...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")})} 
                        placeholder="orn-ahmet-123" 
                      />
                      <p className="text-[10px] text-muted-foreground">Sadece küçük harf, rakam ve tire (-). Boşluk bırakmayınız.</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Ad Soyad (veya Takma Ad) <span className="text-destructive">*</span></Label>
                      <Input id="displayName" required value={formData.displayName} onChange={e => setFormData({...formData, displayName: e.target.value})} placeholder="Ahmet Yılmaz" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="grade">Sınıf</Label>
                      <Select value={formData.grade} onValueChange={v => setFormData({...formData, grade: v as any})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="9">9. Sınıf</SelectItem>
                          <SelectItem value="10">10. Sınıf</SelectItem>
                          <SelectItem value="11">11. Sınıf</SelectItem>
                          <SelectItem value="12">12. Sınıf</SelectItem>
                          <SelectItem value="Mezun">Mezun</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="availability">Haftalık Zaman</Label>
                      <Select value={formData.availability} onValueChange={v => setFormData({...formData, availability: v as any})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Düşük (1-3 Saat)">Düşük (1-3 Saat)</SelectItem>
                          <SelectItem value="Orta (3-8 Saat)">Orta (3-8 Saat)</SelectItem>
                          <SelectItem value="Yüksek (8+ Saat)">Yüksek (8+ Saat)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Kendini Kısaca Tanıt <span className="text-destructive">*</span></Label>
                    <Textarea id="bio" required value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} placeholder="Mobil uygulama geliştirmeye meraklıyım..." rows={3} />
                  </div>
                </StaggerItem>

                <StaggerItem className="space-y-5 pt-4">
                  <div className="border-b pb-2">
                    <h2 className="text-xl font-bold">Yetenekler ve Proje Hedefi</h2>
                    <p className="text-sm text-muted-foreground">Neler yapabiliyorsun ve ne arıyorsun?</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="skills">Beceriler</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.skills?.map(skill => <Tag key={skill} text={skill} variant="primary" onRemove={() => removeTag("skills", skill)} />)}
                    </div>
                    <Input id="skills" value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => handleAddTag(e, "skills", skillInput, setSkillInput)} placeholder="Örn: React, Figma (Enter'a bas)" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="interests">İlgi Alanları</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.interests?.map(interest => <Tag key={interest} text={interest} variant="secondary" onRemove={() => removeTag("interests", interest)} />)}
                    </div>
                    <Input id="interests" value={interestInput} onChange={e => setInterestInput(e.target.value)} onKeyDown={e => handleAddTag(e, "interests", interestInput, setInterestInput)} placeholder="Örn: Yapay Zeka (Enter'a bas)" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lookingFor">Nasıl Biri/Ekip Arıyorsun?</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.lookingFor?.map(item => <Tag key={item} text={item} variant="outline" onRemove={() => removeTag("lookingFor", item)} />)}
                    </div>
                    <Input id="lookingFor" value={lookingForInput} onChange={e => setLookingForInput(e.target.value)} onKeyDown={e => handleAddTag(e, "lookingFor", lookingForInput, setLookingForInput)} placeholder="Örn: Backend Geliştirici (Enter'a bas)" />
                  </div>
                </StaggerItem>

                <StaggerItem className="space-y-5 pt-4">
                  <div className="border-b pb-2">
                    <h2 className="text-xl font-bold">İletişim ve Onay</h2>
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
                      <Input id="contactValue" required value={formData.contactValue} onChange={e => setFormData({...formData, contactValue: e.target.value})} placeholder="örn: @ahmet" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg bg-muted/30">
                    <div className="space-y-0.5">
                      <Label htmlFor="active-search" className="text-base">Aktif Ekip Arıyorum</Label>
                      <p className="text-xs text-muted-foreground">Profilinizde "Aktif Ekip Arıyor" etiketi gözüksün mü?</p>
                    </div>
                    <Switch id="active-search" checked={formData.isActivelyLooking} onCheckedChange={checked => setFormData({...formData, isActivelyLooking: checked})} />
                  </div>
                  <div className="flex items-start space-x-2">
                    <input type="checkbox" id="kvkk" className="mt-1" checked={kvkk} onChange={e => setKvkk(e.target.checked)} />
                    <Label htmlFor="kvkk" className="text-sm font-normal text-muted-foreground leading-snug">
                      Yazdığım bilgilerin pebaaos platformunda diğer öğrencilerle paylaşılacağını kabul ediyorum.
                    </Label>
                  </div>
                </StaggerItem>

                <StaggerItem className="pt-6 border-t flex justify-end">
                  <Button type="submit" disabled={loading || !kvkk} size="lg" className="w-full sm:w-auto px-8 h-12 rounded-full font-bold shadow-primary/25 shadow-xl hover:shadow-primary/40 transition-shadow bg-gradient-to-r from-primary to-indigo-500 hover:from-primary hover:to-indigo-600">
                    {loading ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Gönderiliyor...</>
                    ) : (
                      <><Sparkles className="mr-2 h-5 w-5" /> Profili Gönder <ChevronRight className="ml-1 w-5 h-5" /></>
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
