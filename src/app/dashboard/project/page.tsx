"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { getMyProfiles, createProject } from "@/lib/db";
import { TeamProfile } from "@/types";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FadeInBlock } from "@/components/MotionWrappers";
import { Loader2, ArrowLeft, Upload, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function CreateProjectPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [associatedTeamId, setAssociatedTeamId] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  
  const [teams, setTeams] = useState<TeamProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
      return;
    }

    if (user) {
      getMyProfiles(user.uid).then((res) => {
        setTeams(res.teams);
        setInitialLoading(false);
      });
    }
  }, [user, authLoading, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Dosya boyutu çok büyük. Lütfen maksimum 5MB bir görsel seçin.");
        e.target.value = "";
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadToImgBB = async (file: File) => {
    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
    if (!apiKey) throw new Error("ImgBB API Key eksik.");
    
    const formData = new FormData();
    formData.append("image", file);
    
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body: formData,
    });
    
    const data = await response.json();
    if (!data.success) throw new Error("Resim yüklenirken bir hata oluştu.");
    
    return data.data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!title || !description || !imageFile) {
      toast.warning("Lütfen tüm zorunlu alanları (Başlık, Açıklama, Görsel) doldurun.");
      return;
    }

    setLoading(true);
    try {
      const imageUrl = await uploadToImgBB(imageFile);
      
      const projectData: any = {
        uid: user.uid,
        title,
        description,
        imageUrl,
      };
      
      if (projectUrl) projectData.projectUrl = projectUrl;
      if (associatedTeamId) projectData.associatedTeamId = associatedTeamId;

      await createProject(projectData);

      router.push("/dashboard");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Proje kaydedilirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || initialLoading) {
    return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/10">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-24 max-w-3xl">
        <FadeInBlock>
          <div className="mb-8">
            <Link href="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-1" /> Panele Dön
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">Yeni Proje Ekle</h1>
            <p className="text-muted-foreground mt-1">Yaptığın harika projeyi diğer öğrencilere sergile.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-card border rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none" />
            
            <div className="space-y-6 relative z-10">
              
              <div className="space-y-2">
                <Label htmlFor="image" className="text-base">Proje Görseli <span className="text-destructive">*</span></Label>
                <div className="border-2 border-dashed rounded-2xl p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer relative overflow-hidden">
                  <Input 
                    id="image" 
                    type="file" 
                    accept="image/*" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                    onChange={handleImageChange}
                  />
                  {imagePreview ? (
                    <div className="relative h-48 w-full rounded-xl overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imagePreview} alt="Önizleme" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <p className="text-white font-bold flex items-center gap-2"><Upload className="w-4 h-4"/> Değiştir</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-32 space-y-2 text-muted-foreground">
                      <div className="p-3 bg-primary/10 rounded-full">
                        <ImageIcon className="w-8 h-8 text-primary" />
                      </div>
                      <p className="font-medium">Görsel seçmek için tıkla veya sürükle</p>
                      <p className="text-xs">Tavsiye edilen boyut: 1200x630px (Max 5MB)</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className="text-base">Proje Başlığı <span className="text-destructive">*</span></Label>
                <Input 
                  id="title" 
                  placeholder="Örn: pebaaos - Öğrenci Eşleşme Ağı" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)}
                  className="h-12"
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-base">Proje Açıklaması <span className="text-destructive">*</span></Label>
                <Textarea 
                  id="description" 
                  placeholder="Bu proje ne işe yarıyor? Hangi teknolojileri kullandın? Zorlukları nasıl aştın?" 
                  value={description} 
                  onChange={e => setDescription(e.target.value)}
                  className="min-h-[120px] resize-y"
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectUrl" className="text-base">Proje Linki (Opsiyonel)</Label>
                <Input 
                  id="projectUrl" 
                  placeholder="https://github.com/..." 
                  value={projectUrl} 
                  onChange={e => setProjectUrl(e.target.value)}
                  className="h-12"
                />
              </div>

              {teams.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="associatedTeam" className="text-base">Bağlantılı Ekip (Opsiyonel)</Label>
                  <p className="text-sm text-muted-foreground mb-2">Eğer bu projeyi sitede açtığın bir ekip ilanıyla birlikte yaptıysan seçebilirsin.</p>
                  <select 
                    id="associatedTeam" 
                    className="flex h-12 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={associatedTeamId}
                    onChange={e => setAssociatedTeamId(e.target.value)}
                  >
                    <option value="">Ekip Seçme</option>
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>{t.teamName}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-4">
                <Button type="submit" className="w-full h-12 rounded-full font-bold shadow-lg shadow-primary/20" disabled={loading}>
                  {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Upload className="w-5 h-5 mr-2" />}
                  {loading ? "Kaydediliyor..." : "Projeyi Kaydet ve Sergile"}
                </Button>
              </div>

            </div>
          </form>
        </FadeInBlock>
      </main>
      <Footer />
    </div>
  );
}
