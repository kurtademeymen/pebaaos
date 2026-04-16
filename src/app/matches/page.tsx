"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { UserCard } from "@/components/UserCard";
import { TeamCard } from "@/components/TeamCard";
import { UserCardSkeleton } from "@/components/Skeletons";
import { EmptyState, ErrorState } from "@/components/StateComponents";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FadeInBlock, StaggerChildren, StaggerItem } from "@/components/MotionWrappers";
import { getPublicProfiles } from "@/lib/db";
import { PersonalProfile, TeamProfile } from "@/types";

export default function MatchesPage() {
  const [personalUsers, setPersonalUsers] = useState<PersonalProfile[]>([]);
  const [teamProfiles, setTeamProfiles] = useState<TeamProfile[]>([]);
  
  const [filteredUsers, setFilteredUsers] = useState<PersonalProfile[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<TeamProfile[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("personal");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [pRes, tRes] = await Promise.all([
        getPublicProfiles("personal"),
        getPublicProfiles("team")
      ]);
      setPersonalUsers(pRes as PersonalProfile[]);
      setFilteredUsers(pRes as PersonalProfile[]);
      setTeamProfiles(tRes as TeamProfile[]);
      setFilteredTeams(tRes as TeamProfile[]);
    } catch (err) {
      console.error(err);
      setError("Veriler yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter effect
  useEffect(() => {
    const term = searchQuery.toLowerCase();
    
    // Filter personal
    const filteredP = personalUsers.filter(u => {
      const matchSearch = !term || 
        u.displayName.toLowerCase().includes(term) ||
        u.skills?.some(s => s.toLowerCase().includes(term)) ||
        u.interests?.some(i => i.toLowerCase().includes(term));
      return matchSearch;
    });
    setFilteredUsers(filteredP);

    // Filter teams
    const filteredT = teamProfiles.filter(t => {
      const matchSearch = !term ||
        t.teamName.toLowerCase().includes(term) ||
        t.skills?.some(s => s.toLowerCase().includes(term)) ||
        t.lookingFor?.some(r => r.toLowerCase().includes(term));
      return matchSearch;
    });
    setFilteredTeams(filteredT);
  }, [searchQuery, personalUsers, teamProfiles]);

  const activeCount = personalUsers.filter(u => u.isActivelyLooking).length;
  const hiringCount = teamProfiles.length;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-muted/10 pt-32 pb-12">
        <div className="container px-4 md:px-8 mx-auto">
          
          <FadeInBlock className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">Ekosistemi Keşfet</h1>
              <p className="text-muted-foreground mt-2 text-lg">Hem doğru ekip arkadaşını bul, hem de sana uygun projelere katıl.</p>
            </div>
            {!loading && !error && (
              <div className="flex gap-4 text-sm mt-4 md:mt-0">
                <div className="bg-card border/50 shadow-sm px-5 py-3 rounded-2xl text-center">
                  <div className="font-bold text-2xl">{personalUsers.length}</div>
                  <div className="text-muted-foreground">Kayıtlı Profil</div>
                </div>
                <div className="bg-primary/5 border border-primary/20 shadow-sm px-5 py-3 rounded-2xl text-center">
                  <div className="font-bold text-2xl text-primary">{activeCount}</div>
                  <div className="text-primary/80">Aktif Arayışta</div>
                </div>
                <div className="bg-purple-500/5 border border-purple-500/20 shadow-sm px-5 py-3 rounded-2xl text-center">
                  <div className="font-bold text-2xl text-purple-600">{hiringCount}</div>
                  <div className="text-purple-600/80">Açık İlan</div>
                </div>
              </div>
            )}
          </FadeInBlock>

          <Tabs defaultValue="personal" onValueChange={setActiveTab} className="mb-8">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <TabsList className="bg-muted p-1">
                <TabsTrigger value="personal" className="px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md font-medium">Öğrenciler / Bireyler</TabsTrigger>
                <TabsTrigger value="team" className="px-6 data-[state=active]:bg-background data-[state=active]:text-purple-600 data-[state=active]:shadow-sm rounded-md font-medium">Projeler / Ekipler</TabsTrigger>
              </TabsList>
              
              <div className="w-full md:w-auto md:min-w-[300px]">
                <Input 
                  placeholder={activeTab === "personal" ? "Yetenek veya kişi ara..." : "Proje veya rol ara..."}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="rounded-full shadow-inner bg-background h-10 w-full"
                />
              </div>
            </div>

            <div className="mt-8">
              {loading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                   {[1, 2, 3, 4, 5, 6].map(i => <UserCardSkeleton key={i} />)}
                </div>
              ) : error ? (
                <ErrorState error={error} onRetry={fetchData} />
              ) : (
                <>
                  <TabsContent value="personal" className="m-0 focus-visible:outline-none">
                    {filteredUsers.length === 0 ? (
                      <EmptyState title="Kişi Bulunamadı" description="Filtrelerinizi değiştirerek tekrar deneyin."/>
                    ) : (
                      <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredUsers.map((user) => (
                          <StaggerItem key={user.id}>
                            <UserCard user={user} />
                          </StaggerItem>
                        ))}
                      </StaggerChildren>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="team" className="m-0 focus-visible:outline-none">
                    {filteredTeams.length === 0 ? (
                      <EmptyState title="Proje İlanı Bulunamadı" description="Şu an için aradığınız kriterlere uygun bir ekip yok."/>
                    ) : (
                      <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTeams.map((team) => (
                          <StaggerItem key={team.id}>
                            <TeamCard team={team} />
                          </StaggerItem>
                        ))}
                      </StaggerChildren>
                    )}
                  </TabsContent>
                </>
              )}
            </div>
          </Tabs>

        </div>
      </main>
      <Footer />
    </div>
  );
}
