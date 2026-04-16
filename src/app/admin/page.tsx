"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { logoutAdmin } from "@/lib/auth";
import { getAllProfiles, adminApproveProfile, adminToggleVisibility, deleteProfile, getAllReferenceKeys, createReferenceKey } from "@/lib/db";
import { PersonalProfile, TeamProfile, ReferenceKey } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatsCard } from "@/components/StatsCard";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Users, EyeOff, LayoutDashboard, LogOut, Key, Plus, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  
  // Dashboard State
  const [personalProfiles, setPersonalProfiles] = useState<PersonalProfile[]>([]);
  const [teamProfiles, setTeamProfiles] = useState<TeamProfile[]>([]);
  const [refKeys, setRefKeys] = useState<ReferenceKey[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [keyRole, setKeyRole] = useState<"admin" | "user">("user");

  useEffect(() => {
    if (user && isAdmin) {
      loadData();
    }
  }, [user, isAdmin]);

  const loadData = async () => {
    setIsLoadingData(true);
    try {
      const [pData, tData, keys] = await Promise.all([
        getAllProfiles("personal"),
        getAllProfiles("team"),
        getAllReferenceKeys()
      ]);
      setPersonalProfiles(pData as PersonalProfile[]);
      setTeamProfiles(tData as TeamProfile[]);
      setRefKeys(keys);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const toggleApproval = async (id: string, currentStatus: boolean, type: "personal" | "team") => {
    try {
      await adminApproveProfile(id, type, !currentStatus);
      loadData();
    } catch(err) {
      alert("Hata oluştu");
    }
  };

  const toggleVisibility = async (id: string, currentStatus: boolean, type: "personal" | "team") => {
    try {
      await adminToggleVisibility(id, type, !currentStatus);
      loadData();
    } catch(err) {
      alert("Hata oluştu");
    }
  };

  const handleDelete = async (id: string, type: "personal" | "team") => {
    if (!confirm("Bu profili/ilanı silmek istediğinize emin misiniz?")) return;
    try {
      await deleteProfile(id, type);
      loadData();
    } catch(err) {
      alert("Silinirken hata oluştu");
    }
  };

  const handleCreateKey = async () => {
    if (!user) return;
    try {
      await createReferenceKey(user.uid, keyRole);
      loadData();
    } catch (err) {
      alert("Davet Anahtarı oluşturulamadı.");
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Kopyalandı: " + text);
  };

  if (authLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  if (!user || !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-muted/20">
        <ShieldAlert className="w-20 h-20 text-destructive mb-6" />
        <h1 className="text-3xl font-bold mb-2">Yetkisiz Erişim</h1>
        <p className="text-muted-foreground mb-8">Bu sayfayı görüntülemek için Yönetici olmalısınız.</p>
        <Link href="/">
           <Button className="rounded-full">Ana Sayfaya Dön</Button>
        </Link>
      </div>
    );
  }

  const pendingPersonal = personalProfiles.filter(p => !p.isApproved).length;
  const pendingTeams = teamProfiles.filter(p => !p.isApproved).length;

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-background border-b px-6 h-16 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2 font-bold text-lg">
          <LayoutDashboard className="w-5 h-5 text-primary" />
          pebaaos Yönetimi
        </div>
        <Button variant="ghost" size="sm" onClick={() => logoutAdmin()}>
          <LogOut className="w-4 h-4 mr-2" /> Çıkış
        </Button>
      </header>

      <main className="flex-1 p-6 container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatsCard title="Toplam Referans Kodu" value={refKeys.length} icon={<Key className="w-5 h-5 text-muted-foreground"/>} />
          <StatsCard title="Kayıtlı Kişiler" value={personalProfiles.length} icon={<Users className="w-5 h-5 text-muted-foreground"/>} />
          <StatsCard title="Kayıtlı Ekipler" value={teamProfiles.length} icon={<Users className="w-5 h-5 text-muted-foreground"/>} />
          <StatsCard title="Bekleyen Onaylar" value={pendingPersonal + pendingTeams} icon={<EyeOff className="w-5 h-5 text-destructive"/>} />
        </div>

        <Tabs defaultValue="keys" className="w-full">
           <TabsList className="grid w-full grid-cols-3 max-w-2xl mb-8">
             <TabsTrigger value="keys">Davet Kodları</TabsTrigger>
             <TabsTrigger value="personal">Kişisel Profiller ({pendingPersonal})</TabsTrigger>
             <TabsTrigger value="teams">Ekip İlanları ({pendingTeams})</TabsTrigger>
           </TabsList>

           <TabsContent value="keys">
             <Card>
               <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center">
                 <div>
                   <CardTitle>Referans Kodları</CardTitle>
                   <CardDescription>Sisteme davet edeceğiniz kişilerin rolleri.</CardDescription>
                 </div>
                 <div className="flex items-center gap-2 mt-4 md:mt-0">
                    <Select onValueChange={(v) => setKeyRole(v as "admin"|"user")}>
                      <SelectTrigger className="w-32"><SelectValue placeholder="Rol Seç" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Öğrenci</SelectItem>
                        <SelectItem value="admin">Yönetici</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleCreateKey}><Plus className="w-4 h-4 mr-2" /> Kod Üret</Button>
                 </div>
               </CardHeader>
               <CardContent>
                 <div className="overflow-x-auto">
                   <table className="w-full text-sm text-left">
                     <thead className="text-xs uppercase bg-muted/50 border-b">
                       <tr>
                         <th className="px-4 py-3">Anahtar Kod</th>
                         <th className="px-4 py-3">Yetki Statüsü</th>
                         <th className="px-4 py-3">Kullanım Durumu</th>
                         <th className="px-4 py-3">Kullanan UID</th>
                       </tr>
                     </thead>
                     <tbody>
                       {refKeys.map(k => (
                         <tr key={k.id} className="border-b hover:bg-muted/10">
                           <td className="px-4 py-3 font-mono font-bold cursor-pointer hover:text-primary" onClick={() => handleCopy(k.code)}>{k.code}</td>
                           <td className="px-4 py-3">
                             <Badge variant="outline" className={k.role === "admin" ? "bg-red-100 text-red-600 border-red-200" : "bg-blue-100 text-blue-600 border-blue-200"}>
                               {k.role === "admin" ? "Yönetici (Admin)" : "Normal Öğrenci"}
                             </Badge>
                           </td>
                           <td className="px-4 py-3">
                             {k.isUsed ? <Badge variant="destructive">Kullanıldı</Badge> : <Badge className="bg-green-500 text-white">Boşta</Badge>}
                           </td>
                           <td className="px-4 py-3 text-xs text-muted-foreground">{k.usedBy ? k.usedBy : "-"}</td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               </CardContent>
             </Card>
           </TabsContent>

           <TabsContent value="personal">
             <Card>
               <CardHeader>
                 <CardTitle>Kişisel Profiller</CardTitle>
                 <CardDescription>Öğrencilerin sergilediği profiller.</CardDescription>
               </CardHeader>
               <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs uppercase bg-muted/50 border-b">
                        <tr>
                          <th className="px-4 py-3">İsim (Sınıf)</th>
                          <th className="px-4 py-3">İletişim</th>
                          <th className="px-4 py-3 text-center">Görünürlük</th>
                          <th className="px-4 py-3 text-center">Onay Durumu</th>
                          <th className="px-4 py-3 text-right">İşlem</th>
                        </tr>
                      </thead>
                      <tbody>
                        {personalProfiles.map(p => (
                          <tr key={p.id} className="border-b hover:bg-muted/10">
                            <td className="px-4 py-3">
                              <div className="font-semibold">{p.displayName}</div>
                              <div className="text-xs text-muted-foreground">{p.grade}. Sınıf</div>
                            </td>
                            <td className="px-4 py-3 text-xs">
                              {p.contactType}: <span className="font-bold">{p.contactValue}</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <Switch checked={p.isVisible} onCheckedChange={() => toggleVisibility(p.id as string, p.isVisible, "personal")} />
                            </td>
                            <td className="px-4 py-3 text-center">
                               <Button size="sm" variant={p.isApproved ? "outline" : "default"} onClick={() => toggleApproval(p.id as string, p.isApproved, "personal")} className={p.isApproved ? "bg-green-100 text-green-700 hover:bg-green-200" : ""}>
                                 {p.isApproved ? "Onaylı" : "Bekliyor (Onayla)"}
                               </Button>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Button size="sm" variant="destructive" onClick={() => handleDelete(p.id as string, "personal")}>Sil</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
               </CardContent>
             </Card>
           </TabsContent>

           <TabsContent value="teams">
             <Card>
               <CardHeader>
                 <CardTitle>Ekip / Proje İlanları</CardTitle>
                 <CardDescription>Takım arkadaşı arayan ilanlar.</CardDescription>
               </CardHeader>
               <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs uppercase bg-muted/50 border-b">
                        <tr>
                          <th className="px-4 py-3">Proje Adı (Aşama)</th>
                          <th className="px-4 py-3">Aranılan Roller</th>
                          <th className="px-4 py-3 text-center">Görünürlük</th>
                          <th className="px-4 py-3 text-center">Onay Durumu</th>
                          <th className="px-4 py-3 text-right">İşlem</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teamProfiles.map(p => (
                          <tr key={p.id} className="border-b hover:bg-muted/10">
                            <td className="px-4 py-3">
                              <div className="font-semibold text-purple-600">{p.teamName}</div>
                              <div className="text-xs text-muted-foreground">{p.projectStage}</div>
                            </td>
                            <td className="px-4 py-3 text-xs">
                              {p.lookingFor.join(", ")}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <Switch checked={p.isVisible} onCheckedChange={() => toggleVisibility(p.id as string, p.isVisible, "team")} />
                            </td>
                            <td className="px-4 py-3 text-center">
                               <Button size="sm" variant={p.isApproved ? "outline" : "default"} onClick={() => toggleApproval(p.id as string, p.isApproved, "team")} className={p.isApproved ? "bg-green-100 text-green-700 hover:bg-green-200" : ""}>
                                 {p.isApproved ? "Onaylı" : "Bekliyor (Onayla)"}
                               </Button>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Button size="sm" variant="destructive" onClick={() => handleDelete(p.id as string, "team")}>Sil</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
               </CardContent>
             </Card>
           </TabsContent>

        </Tabs>
      </main>
    </div>
  );
}
