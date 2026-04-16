import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Sparkles, CheckCircle2, Search, Code, Palette, Zap } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { FadeInBlock, HoverCard, StaggerChildren, StaggerItem, WordFadeIn, MagneticWrapper } from "@/components/MotionWrappers";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1 relative overflow-hidden">
        <AnimatedBackground />
        
        {/* Hero Section */}
        <section className="w-full relative z-10 pt-32 pb-24 md:pt-40 md:pb-32">
          <div className="container px-4 md:px-8 mx-auto flex flex-col items-center text-center space-y-10">
            <FadeInBlock delay={0.1}>
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-background/50 backdrop-blur-md px-3 py-1 text-sm font-medium transition-colors hover:bg-primary/10 hover:border-primary/30 shadow-sm cursor-default">
                <Sparkles className="w-4 h-4 mr-2 text-primary animate-pulse" />
                Öğrenciler için yeni nesil eşleşme ağı
              </div>
            </FadeInBlock>
            
            <FadeInBlock delay={0.2}>
              <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl max-w-5xl text-balance drop-shadow-sm flex flex-wrap justify-center gap-x-4">
                <WordFadeIn delay={0.2}>Projeni</WordFadeIn>
                <WordFadeIn delay={0.4}><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-indigo-400">tek başına</span></WordFadeIn>
                <WordFadeIn delay={0.6}>büyütme.</WordFadeIn>
              </h1>
            </FadeInBlock>
            
            <FadeInBlock delay={0.3}>
              <p className="max-w-[46rem] leading-relaxed text-muted-foreground sm:text-xl font-medium text-balance">
                Fikirlerini gerçeğe dönüştürmek için ihtiyacın olan yazılımcıyı, tasarımcıyı veya stratejisti kendi okulunda bul. Vizyonunu paylaş ve harika bir takım oluştur.
              </p>
            </FadeInBlock>
            
            <FadeInBlock delay={0.4}>
              <div className="flex flex-col sm:flex-row gap-5 mt-6">
                <HoverCard>
                  <MagneticWrapper>
                    <Link href="/auth">
                      <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all rounded-full group">
                        Hemen Katıl <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </MagneticWrapper>
                </HoverCard>
                <HoverCard>
                  <MagneticWrapper>
                    <Link href="/matches">
                      <Button variant="secondary" size="lg" className="w-full sm:w-auto h-14 px-8 text-base rounded-full bg-background/80 backdrop-blur-md border hover:bg-muted/80 shadow-sm">
                        <Search className="mr-2 w-5 h-5 text-primary tracking-tight" /> Eşleşmeleri Keşfet
                      </Button>
                    </Link>
                  </MagneticWrapper>
                </HoverCard>
              </div>
            </FadeInBlock>
          </div>
        </section>

        {/* Floating Icons / Features */}
        <section className="w-full py-12 relative z-10 hidden md:block">
           <div className="container px-4 mx-auto max-w-6xl">
              <div className="grid grid-cols-3 gap-6 opacity-60 dark:opacity-40">
                 <div className="flex flex-col items-center gap-2">
                    <Code className="w-10 h-10 text-indigo-400" />
                    <span className="font-semibold text-sm">Yazılım & Teknoloji</span>
                 </div>
                 <div className="flex flex-col items-center gap-2">
                    <Palette className="w-10 h-10 text-pink-400" />
                    <span className="font-semibold text-sm">Tasarım & UI/UX</span>
                 </div>
                 <div className="flex flex-col items-center gap-2">
                    <Zap className="w-10 h-10 text-amber-400" />
                    <span className="font-semibold text-sm">Proje & Üretim</span>
                 </div>
              </div>
           </div>
        </section>

        {/* How it Works Section */}
        <section className="w-full py-28 relative z-10 bg-background/40 backdrop-blur-xl border-y border-border/50">
          <div className="container px-4 md:px-8 mx-auto">
            <div className="text-center mb-20">
              <FadeInBlock>
                <h2 className="text-4xl font-bold tracking-tight mb-4">Sadece 3 Adımda Ekibini Kur</h2>
                <p className="text-muted-foreground max-w-[42rem] mx-auto text-lg">
                  KKarmaşık forumlar veya şans eseri tanışmalar bitti.
                </p>
              </FadeInBlock>
            </div>

            <StaggerChildren className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <StaggerItem className="flex flex-col items-center text-center p-8 bg-card/80 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transition-all border border-border/50">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 text-primary font-black text-2xl shadow-inner border border-primary/20">
                  1
                </div>
                <h3 className="text-xl font-bold mb-3">Profilini Parlat</h3>
                <p className="text-muted-foreground leading-relaxed">Kendini tanıtan modern bir kartvizit oluştur. Hakim olduğun araçları ve hedeflerini belirt.</p>
              </StaggerItem>
              
              <StaggerItem className="flex flex-col items-center text-center p-8 bg-card/80 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transition-all border border-border/50 relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-purple-500 rounded-3xl blur opacity-10"></div>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 text-primary font-black text-2xl shadow-inner border border-primary/20">
                  2
                </div>
                <h3 className="text-xl font-bold mb-3">Eksik Parçayı Bul</h3>
                <p className="text-muted-foreground leading-relaxed">Özel arama filtreleri ile senin projene heyecan duyacak, eksik olduğun roldeki kişiyi keşfet.</p>
              </StaggerItem>

              <StaggerItem className="flex flex-col items-center text-center p-8 bg-card/80 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transition-all border border-border/50">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 text-primary font-black text-2xl shadow-inner border border-primary/20">
                  3
                </div>
                <h3 className="text-xl font-bold mb-3">Hemen İletişime Geç</h3>
                <p className="text-muted-foreground leading-relaxed">Aylarca beklemek yok. Doğrudan favori iletişim kanalı üzerinden mesaj at ve fikri üretmeye başla.</p>
              </StaggerItem>
            </StaggerChildren>
          </div>
        </section>

        {/* Why Use It Section */}
        <section className="w-full py-28 relative z-10">
          <div className="container px-4 md:px-8 mx-auto">
             <div className="grid md:grid-cols-2 gap-16 items-center">
               <FadeInBlock delay={0.2}>
                 <h2 className="text-4xl font-bold tracking-tight mb-8">Neden pebaaos?</h2>
                 <ul className="space-y-6">
                   {[
                     "AI ile değil, okulundaki 'gerçek' ve yetenekli öğrencilerle",
                     "Tamamen ücretsiz, reklamsız ve güvenli ortam",
                     "Gelişmiş yetenek etiketleri ile nokta atışı eşleşme"
                   ].map((item, i) => (
                     <li key={i} className="flex items-start gap-4">
                       <div className="bg-primary/10 p-2 rounded-full mt-1">
                         <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                       </div>
                       <span className="text-xl font-medium">{item}</span>
                     </li>
                   ))}
                 </ul>
                 <HoverCard className="mt-10 inline-block">
                    <Link href="/matches">
                      <Button variant="outline" className="rounded-full px-6 h-12 text-md group">
                        Kayıtlı profillere göz at <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                 </HoverCard>
               </FadeInBlock>
               
               <FadeInBlock delay={0.4} className="relative">
                 <div className="aspect-square md:aspect-video rounded-3xl bg-card border shadow-2xl overflow-hidden flex items-center justify-center relative p-8">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-purple-500/20 mix-blend-overlay"></div>
                    <Users className="w-40 h-40 text-primary/20 absolute" />
                    
                    {/* Simulated floating user cards for visual effect */}
                    <div className="w-full h-full relative z-10">
                       <HoverCard className="absolute top-4 left-4 right-20 bg-background/90 backdrop-blur border rounded-xl p-4 shadow-lg">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">A</div>
                             <div>
                                <div className="font-bold text-sm">Ali Yılmaz</div>
                                <div className="text-xs text-muted-foreground">React Geliştiricisi Arıyor</div>
                             </div>
                          </div>
                       </HoverCard>
                       <HoverCard className="absolute bottom-10 right-4 left-20 bg-background/90 backdrop-blur border rounded-xl p-4 shadow-lg border-primary/20">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-600">Z</div>
                             <div>
                                <div className="font-bold text-sm">Zeynep K.</div>
                                <div className="text-xs text-muted-foreground">UI/UX Tasarımcısı</div>
                             </div>
                          </div>
                       </HoverCard>
                     </div>
                  </div>
               </FadeInBlock>
             </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
