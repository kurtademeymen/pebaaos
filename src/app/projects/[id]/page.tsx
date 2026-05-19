"use client";

import { useEffect, useState, use } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Loader } from "@/components/Loader";
import { ErrorState } from "@/components/StateComponents";
import { FadeInBlock } from "@/components/MotionWrappers";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getProjectById, getMyProfiles } from "@/lib/db";
import { getUserById } from "@/lib/users";
import { ShowcaseProject, PersonalProfile, TeamProfile } from "@/types";
import { ArrowLeft, Link as LinkIcon, ExternalLink, Calendar, Code, User } from "lucide-react";
import Link from "next/link";

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const [project, setProject] = useState<ShowcaseProject | null>(null);
  const [creator, setCreator] = useState<PersonalProfile | null>(null);
  const [associatedTeam, setAssociatedTeam] = useState<TeamProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        const proj = await getProjectById(unwrappedParams.id);
        if (!proj) {
          throw new Error("Proje bulunamadı.");
        }
        setProject(proj);

        // Fetch creator profiles using the project's uid
        const profiles = await getMyProfiles(proj.uid);
        if (profiles.personal) {
          setCreator(profiles.personal as PersonalProfile);
        }

        // Fetch associated team if any
        if (proj.associatedTeamId) {
          const team = await getUserById(proj.associatedTeamId);
          if (team && team.profileType === "team") {
            setAssociatedTeam(team as TeamProfile);
          }
        }

      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Proje yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [unwrappedParams.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader text="Proje yükleniyor..." />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-20 flex justify-center">
          <div className="w-full max-w-md">
            <ErrorState title="Proje Bulunamadı" error={error || ""} />
            <div className="mt-8 text-center">
               <Link href="/dashboard">
                 <Button variant="outline">Panele Geri Dön</Button>
               </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Format date
  let publishDate = "Bilinmiyor";
  if (project.createdAt?.seconds) {
    publishDate = new Date(project.createdAt.seconds * 1000).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric', day: 'numeric' });
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/10">
      <Navbar />
      <main className="flex-1 pb-20">
        {/* Hero Section */}
        <div className="relative w-full h-[40vh] md:h-[50vh] bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={project.imageUrl} 
            alt={project.title} 
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          
          <div className="absolute bottom-0 left-0 w-full">
            <div className="container mx-auto px-4 pb-8 md:pb-12">
              <FadeInBlock>
                <Link href="/dashboard">
                  <Button variant="ghost" className="mb-4 text-white/80 hover:text-white hover:bg-white/10 -ml-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Geri Dön
                  </Button>
                </Link>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 backdrop-blur-md">
                    Proje Vitrini
                  </Badge>
                  <div className="flex items-center text-sm text-white/70">
                    <Calendar className="w-4 h-4 mr-1" />
                    {publishDate}
                  </div>
                </div>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight drop-shadow-lg">
                  {project.title}
                </h1>
              </FadeInBlock>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="container mx-auto px-4 py-12 md:py-16 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
            
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              <FadeInBlock delay={0.1}>
                <div className="bg-card border rounded-3xl p-6 md:p-8 shadow-sm">
                  <h2 className="text-2xl font-bold mb-6 flex items-center">
                    <Code className="w-6 h-6 mr-3 text-primary" />
                    Proje Hakkında
                  </h2>
                  <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-lg">
                      {project.description}
                    </p>
                  </div>
                </div>
              </FadeInBlock>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {project.projectUrl && (
                <FadeInBlock delay={0.2}>
                  <div className="bg-gradient-to-br from-primary to-indigo-600 rounded-3xl p-[1px] shadow-lg">
                    <div className="bg-card rounded-[23px] p-6 h-full flex flex-col justify-center items-center text-center">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <LinkIcon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-bold text-lg mb-2">Projeyi İncele</h3>
                      <p className="text-sm text-muted-foreground mb-6">
                        Bu projenin canlı haline veya kaynak kodlarına göz atın.
                      </p>
                      <a 
                        href={project.projectUrl.startsWith('http') ? project.projectUrl : `https://${project.projectUrl}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="w-full"
                      >
                        <Button className="w-full h-12 rounded-xl group">
                          Projeye Git
                          <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </Button>
                      </a>
                    </div>
                  </div>
                </FadeInBlock>
              )}

              <FadeInBlock delay={0.3}>
                <div className="bg-card border rounded-3xl p-6 shadow-sm">
                  <h3 className="font-bold mb-4 flex items-center border-b pb-4">
                    <User className="w-5 h-5 mr-2 text-primary" />
                    Oluşturan
                  </h3>
                  
                  {creator ? (
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-full font-bold uppercase text-lg">
                        {creator.displayName.substring(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold truncate">{creator.displayName}</h4>
                        <Link href={`/profile/${creator.username || creator.id}`} className="text-sm text-primary hover:underline">
                          Profili Görüntüle
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">Kullanıcı bilgisi bulunamadı.</div>
                  )}

                  {associatedTeam && (
                    <div className="mt-6 pt-6 border-t">
                      <h4 className="text-sm font-semibold text-muted-foreground mb-3">Bağlantılı Ekip</h4>
                      <Link href={`/profile/${associatedTeam.username || associatedTeam.id}`}>
                        <div className="flex items-center p-3 rounded-xl border hover:bg-muted/50 transition-colors">
                          <div className="w-10 h-10 bg-purple-100 text-purple-600 flex items-center justify-center rounded-lg font-bold uppercase text-sm mr-3">
                            {associatedTeam.teamName.substring(0, 2)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{associatedTeam.teamName}</p>
                            <p className="text-xs text-muted-foreground truncate">{associatedTeam.projectStage}</p>
                          </div>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>
              </FadeInBlock>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
