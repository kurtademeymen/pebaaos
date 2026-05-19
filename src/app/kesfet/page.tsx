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
import { PersonalProfile, TeamProfile, ShowcaseProject } from "@/types";
import { onSnapshot, collection, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Link2 } from "lucide-react";

export default function MatchesPage() {
  const [personalUsers, setPersonalUsers] = useState<PersonalProfile[]>([]);
  const [teamProfiles, setTeamProfiles] = useState<TeamProfile[]>([]);
  const [projects, setProjects] = useState<ShowcaseProject[]>([]);
  
  const [filteredUsers, setFilteredUsers] = useState<PersonalProfile[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<TeamProfile[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ShowcaseProject[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("personal");

  useEffect(() => {
    setLoading(true);
    setError(null);

    const qPersonal = query(
      collection(db, "personalProfiles"),
      where("isApproved", "==", true),
      where("isVisible", "==", true)
    );
    const unsubPersonal = onSnapshot(qPersonal, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PersonalProfile));
      setPersonalUsers(data);
    }, (err) => console.error("Kişisel profil hatası:", err));

    const qTeam = query(
      collection(db, "teamProfiles"),
      where("isApproved", "==", true),
      where("isVisible", "==", true)
    );
    const unsubTeam = onSnapshot(qTeam, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeamProfile));
      setTeamProfiles(data);
    }, (err) => console.error("Ekip ilanları hatası:", err));

    const qProj = query(
      collection(db, "projects"),
      orderBy("createdAt", "desc")
    );
    const unsubProj = onSnapshot(qProj, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ShowcaseProject));
      setProjects(data);
      setLoading(false); 
    }, (err) => {
      console.error("Projeler hatası:", err);
      setError("Veriler yüklenirken bir hata oluştu.");
      setLoading(false);
    });

    return () => {
      unsubPersonal();
      unsubTeam();
      unsubProj();
    };
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

    // Filter projects
    const filteredProj = projects.filter(p => {
      const matchSearch = !term ||
        p.title.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term);
      return matchSearch;
    });
    setFilteredProjects(filteredProj);
  }, [searchQuery, personalUsers, teamProfiles, projects]);

  const activeCount = personalUsers.filter(u => u.isActivelyLooking).length;
  const hiringCount = teamProfiles.length;
  const projectCount = projects.length;

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
                <div className="bg-green-500/5 border border-green-500/20 shadow-sm px-5 py-3 rounded-2xl text-center">
                  <div className="font-bold text-2xl text-green-600">{projectCount}</div>
                  <div className="text-green-600/80">Vitrin Projesi</div>
                </div>
              </div>
            )}
          </FadeInBlock>

          <Tabs defaultValue="personal" onValueChange={setActiveTab} className="mb-8">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <TabsList className="bg-muted p-1">
                <TabsTrigger value="personal" className="px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md font-medium">Öğrenciler / Bireyler</TabsTrigger>
                <TabsTrigger value="team" className="px-6 data-[state=active]:bg-background data-[state=active]:text-purple-600 data-[state=active]:shadow-sm rounded-md font-medium">Projeler / Ekipler</TabsTrigger>
                <TabsTrigger value="projects" className="px-6 data-[state=active]:bg-background data-[state=active]:text-green-600 data-[state=active]:shadow-sm rounded-md font-medium">Vitrin</TabsTrigger>
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
                <div className="p-8 text-center bg-destructive/10 text-destructive rounded-2xl border border-destructive/20 font-medium">
                  {error}
                </div>
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

                  <TabsContent value="projects" className="m-0 focus-visible:outline-none">
                    {filteredProjects.length === 0 ? (
                      <EmptyState title="Vitrin Projesi Bulunamadı" description="Şu an için aradığınız kriterlere uygun bir proje yok."/>
                    ) : (
                      <StaggerChildren className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProjects.map((proj) => (
                          <StaggerItem key={proj.id} className="bg-card border rounded-2xl overflow-hidden shadow-md flex flex-col hover:shadow-xl transition-all group">
                             <div className="h-48 w-full overflow-hidden relative">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={proj.imageUrl} alt={proj.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                             </div>
                             <div className="p-6 flex flex-col flex-1 relative -mt-10 bg-card rounded-t-2xl z-10 pt-5 border-t">
                                <h3 className="font-bold text-xl mb-2">{proj.title}</h3>
                                <p className="text-sm text-muted-foreground flex-1 line-clamp-3">{proj.description}</p>
                                <div className="flex items-center justify-between mt-4">
                                  <a href={`/projects/${proj.id}`} className="text-sm font-bold text-primary flex items-center hover:underline">
                                     Detayları Gör
                                  </a>
                                  {proj.projectUrl && (
                                    <a href={proj.projectUrl.startsWith('http') ? proj.projectUrl : `https://${proj.projectUrl}`} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-muted-foreground flex items-center hover:text-primary transition-colors">
                                       <Link2 className="w-4 h-4 mr-1" /> Dış Bağlantı
                                    </a>
                                  )}
                                </div>
                             </div>
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
