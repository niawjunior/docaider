import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wand2, Layout, Share2, Sparkles, Zap, Globe, ArrowRight, CheckCircle2, Trophy, FileText, MonitorCheck, ScanSearch, Loader2 } from "lucide-react";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { ResumeData } from "@/lib/schemas/resume";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ResumeBuilderHeader } from "@/components/resume/ResumeBuilderHeader";
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { saveDraft } from "@/app/actions/resume";
import { THEME_DEMOS } from "@/lib/themes";

interface LandingPageProps {
  initialData: { count: number; showcase: any[] };
}

const HERO_WORDS = ["Reimagined.", "Interactive.", "Elevated."];

function ExtractionAnimation() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % 3);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center ">
       <div className="absolute inset-0  blur-[50px]" />
       <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-[200px]">
          <div className="relative w-24 h-24 flex items-center justify-center">
             <AnimatePresence mode="wait">
               {step === 0 && (
                 <motion.div 
                   key="step1"
                   initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                   animate={{ opacity: 1, scale: 1, rotate: 0 }}
                   exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
                   className="absolute inset-0 flex items-center justify-center"
                 >
                    <div className="w-20 h-24 bg-slate-800 rounded-lg flex flex-col items-center justify-center border border-white/10 shadow-xl relative overflow-hidden group">
                       <div className="absolute top-0 right-0 w-8 h-8 bg-white/5 -mr-4 -mt-4 rotate-45" />
                       <FileText className="w-8 h-8 text-slate-400 mb-2" />
                       <div className="w-12 h-1 bg-slate-700 rounded-full" />
                       <div className="w-8 h-1 bg-slate-700 rounded-full mt-1" />
                    </div>
                 </motion.div>
               )}

               {step === 1 && (
                 <motion.div 
                   key="step2"
                   initial={{ opacity: 0, scale: 0.8 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.8 }}
                   className="absolute inset-0 flex items-center justify-center"
                 >
                    <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20 shadow-xl shadow-blue-500/10 backdrop-blur-md">
                       <ScanSearch className="w-10 h-10 text-blue-400 animate-pulse" />
                       <motion.div 
                         className="absolute inset-0 border-2 border-blue-500/30 rounded-full"
                         animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                         transition={{ duration: 2, repeat: Infinity }}
                       />
                    </div>
                 </motion.div>
               )}

               {step === 2 && (
                 <motion.div 
                   key="step3"
                   initial={{ opacity: 0, scale: 0.8 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.8 }}
                   className="absolute inset-0 flex items-center justify-center"
                 >
                    <div className="w-24 h-24 bg-green-500/10 rounded-2xl flex items-center justify-center border border-green-500/20 shadow-xl shadow-green-500/10 rotate-3">
                       <MonitorCheck className="w-10 h-10 text-green-400" />
                       <div className="absolute -bottom-2 -right-2 bg-green-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">LIVE</div>
                    </div>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>

          <div className="h-12 flex items-center justify-center w-full">
             <AnimatePresence mode="wait">
               <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center"
               >
                  {step === 0 && (
                    <>
                      <div className="font-bold text-white mb-1">Scanning PDF</div>
                      <div className="text-xs text-slate-500">Analyzing structure...</div>
                    </>
                  )}
                  {step === 1 && (
                    <>
                      <div className="font-bold text-blue-400 mb-1">AI Extraction</div>
                      <div className="text-xs text-blue-500/70">Identifying skills & roles...</div>
                    </>
                  )}
                  {step === 2 && (
                    <>
                      <div className="font-bold text-green-400 mb-1">Resume Ready</div>
                      <div className="text-xs text-green-500/70">Generated in 1 minute</div>
                    </>
                  )}
               </motion.div>
             </AnimatePresence>
          </div>
          
          {/* Progress Indicators */}
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-500 ${step === i ? 'w-8 bg-blue-500' : 'w-2 bg-white/10'}`} 
              />
            ))}
          </div>
       </div>
    </div>
  );
}

// 3D Tilt Card Component
function TiltCard({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const checkMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    x.set(clientX - centerX);
    y.set(clientY - centerY);
  };

  const resetMouse = () => {
    x.set(0);
    y.set(0);
  };

  const rotateX = useSpring(useTransform(y, [-300, 300], [15, -15]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-300, 300], [-15, 15]), { stiffness: 150, damping: 20 });

  return (
    <motion.div
      style={{ perspective: 1000 }}
      className={className}
      onMouseMove={checkMouse}
      onMouseLeave={resetMouse}
      onClick={onClick}
    >
      <motion.div
        style={{ rotateX, rotateY }}
        className="w-full h-full transform-style-3d cursor-pointer"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export function LandingPage({ initialData }: LandingPageProps) {
  const router = useRouter();
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % HERO_WORDS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  });

  const fadeOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scaleHero = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);

  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = () => {
    // Just navigate to create page to prompt upload
    router.push("/resume-builder/create");
  };

  const handleUseTemplate = (data: ResumeData, theme: string) => {
    router.push(`/resume-builder/create?theme=${theme}`);
  };

  const showcaseItems = [
    ...initialData.showcase.map((item) => ({
      role: item.job_title || item.content.personalInfo.role || "Community Member",
      theme: item.theme,
      slug: item.slug,
      data: item.content as ResumeData,
    })),
  ].slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden selection:bg-purple-500/30 bg-dot-white/[0.2]">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
         <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
         <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />
         <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse delay-2000" />
         <div className="absolute inset-0  bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      </div>

      <ResumeBuilderHeader theme="dark" className="bg-transparent border-b border-white/10 relative z-50 backdrop-blur-md" />

      <main className="relative z-10" ref={targetRef}>
        {/* Animated Hero */}
        <motion.section 
          style={{ opacity: fadeOpacity, scale: scaleHero }}
          className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 text-center pt-20"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-sm font-medium mb-8 hover:bg-white/10 transition-colors cursor-pointer group"
          >
            <Sparkles className="w-4 h-4 text-yellow-400 group-hover:rotate-12 transition-transform" />
            <span className="bg-gradient-to-r from-yellow-200 to-amber-200 text-transparent bg-clip-text font-bold">New:</span> 
            <span className="text-slate-300">Portfolio AI is live</span>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-6xl md:text-8xl font-bold tracking-tight mb-8 leading-[1.1]"
          >
            Your Resume, <br />
            <span className="block h-[1.1em] overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.span 
                  key={wordIndex}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -40, opacity: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-gradient-x"
                >
                  {HERO_WORDS[wordIndex]}
                </motion.span>
              </AnimatePresence>
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-12"
          >
            Turn your boring PDF into a stunning, interactive resume in seconds. 
            Powered by AI, designed for professionals.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto"
          >
            <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-white text-black hover:bg-slate-200 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] transition-all transform hover:scale-105" onClick={handleCreate}>
              <Wand2 className="w-5 h-5 mr-2" />
              Build for Free
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-white/20 bg-transparent text-white hover:bg-white/10 backdrop-blur-sm" asChild>
              <a href="#examples">View Demo</a>
            </Button>
          </motion.div>
        </motion.section>

      
        {/* Bento Grid Features */}
        <section className="py-12 px-6">
          <div className="max-w-7xl mx-auto space-y-16">
            <div className="text-center max-w-2xl mx-auto">
               <h2 className="text-4xl md:text-5xl font-bold mb-6">Built for speed. <br/>Designed for impact.</h2>
               <p className="text-slate-400 text-lg">Everything you need to showcase your work professionally, without writing a single line of code.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
               {/* Large Card - AI Extraction */}
               <Card className="md:col-span-3 bg-slate-900/50 border-white/10 overflow-hidden relative group hover:border-white/20 transition-colors h-auto">
                  <div className="relative z-10 h-full flex flex-col md:flex-row items-center">
                     <div className="flex-1">
                      <div className="p-6 md:p-10">
                       <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center my-6">
                         <Wand2 className="w-6 h-6" />
                       </div>
                       <h3 className="text-2xl font-bold mb-4 text-white">AI-Powered Extraction</h3>
                       <p className="text-slate-400 text-lg leading-relaxed mb-8">
                         Stop copy-pasting. Drop your PDF resume and let our AI handle the rest. 
                         We extract experience, skills, and education instantly, structuring your data for the perfect portfolio.
                       </p>
                       </div>
                     </div>
                     <div className="flex-1 w-full h-[250px] md:h-[400px] relative  border-t md:border-t-0 md:border-l border-white/5 flex items-center justify-center">
                        <ExtractionAnimation />
                     </div>
                  </div>
               </Card>

               {/* Small Card */}
               <Card className="bg-slate-900/50 border-white/10 p-8 hover:border-white/20 transition-colors flex flex-col justify-center min-h-[250px]">
                  <div className="flex items-center gap-4 mb-4">
                     <div className="w-10 h-10 rounded-lg bg-green-500/20 text-green-400 flex items-center justify-center">
                        <Share2 className="w-5 h-5" />
                     </div>
                     <h3 className="text-xl font-bold text-white">Instant Hosting</h3>
                  </div>
                  <p className="text-slate-400">Get a unique <code className="text-green-400 bg-green-900/30 px-1 rounded">docaider.com/p/you</code> link to share.</p>
               </Card>

               {/* Small Card */}
               <Card className="bg-slate-900/50 border-white/10 p-8 hover:border-white/20 transition-colors flex flex-col justify-center min-h-[250px]">
                  <div className="flex items-center gap-4 mb-4">
                     <div className="w-10 h-10 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center">
                        <Trophy className="w-5 h-5" />
                     </div>
                     <h3 className="text-xl font-bold text-white">SEO Optimized</h3>
                  </div>
                  <p className="text-slate-400">Rank high on google with semantic HTML & meta tags automatically generated.</p>
               </Card>
               
               <Card className="bg-slate-900/50 border-white/10 p-8 hover:border-white/20 transition-colors flex flex-col justify-center relative overflow-hidden min-h-[250px]">
                  <div className="flex items-center gap-4 mb-4">
                     <div className="w-10 h-10 rounded-lg bg-yellow-500/20 text-yellow-400 flex items-center justify-center">
                        <Globe className="w-5 h-5" />
                     </div>
                     <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        Custom Domain
                        <span className="text-xs bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded-full border border-yellow-500/20 font-medium tracking-wide">SOON</span>
                     </h3>
                  </div>
                  <p className="text-slate-400">Connect your own domain name for a truly professional brand.</p>
               </Card>
            </div>
          </div>
        </section>

        <section className="py-24 bg-black/40 border-y border-white/5">
           <div className="max-w-7xl mx-auto px-6">
              <div className="text-center max-w-2xl mx-auto mb-16">
                 <h2 className="text-4xl font-bold mb-4">Choose your aesthetic</h2>
                 <p className="text-slate-400 text-lg">Professional templates designed for every career path. Switch anytime.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                  {THEME_DEMOS.map((theme) => (
                     <div 
                      key={theme.id}
                      className="group cursor-default" 
                    >
                       <div className="relative aspect-[4/3] bg-slate-900 rounded-xl overflow-hidden border border-white/10 group-hover:border-white/30 transition-all shadow-2xl">
                          <div className={`absolute inset-0 scale-[0.4] origin-top-left w-[250%] h-[250%] ${theme.id === 'visual' ? 'bg-black' : 'bg-white'} pointer-events-none`}>
                             <ResumePreview data={theme.data as any} theme={theme.id as any} />
                          </div>
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4 backdrop-blur-sm">
                             <Button 
                                onClick={() => handleUseTemplate(theme.data as any, theme.id)} 
                                disabled={isCreating}
                                className="rounded-full bg-white text-black hover:bg-slate-200"
                             >
                                {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Use This Template
                             </Button>
                          </div>
                       </div>
                       <div className="mt-5 flex justify-between items-start">
                          <div>
                             <h3 className="text-xl font-bold text-white mb-1">{theme.role}</h3>
                             <p className="text-slate-500 text-sm">{theme.description}</p>
                          </div>
                          <span className="px-2 py-1 bg-white/10 rounded text-xs font-mono font-medium text-slate-400 uppercase">{theme.name}</span>
                       </div>
                    </div>
                  ))}
              </div>
           </div>
        </section>

        {/* Interactive Theme Showcase */}
        <section id="examples" className="py-32 bg-black/40 border-y border-white/5">
           <div className="max-w-7xl mx-auto px-6">
              <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                 <div>
                    <h2 className="text-4xl font-bold mb-4">Featured Portfolios</h2>
                    <p className="text-slate-400 text-lg">See what others are building.</p>
                 </div>
                 <Button variant="outline" className="rounded-full border-white/20 bg-transparent  text-white" asChild>
                    <a href="/resume-builder/gallery">View Gallery <ArrowRight className="w-4 h-4 ml-2" /></a>
                 </Button>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                 {showcaseItems.map((example, i) => (
                     <motion.div 
                       key={i}
                       initial={{ opacity: 0, y: 20 }}
                       whileInView={{ opacity: 1, y: 0 }}
                       viewport={{ once: true }}
                       transition={{ delay: i * 0.1 }}
                       className="group cursor-default"
                    >
                       <div className="relative aspect-video bg-slate-800 rounded-xl overflow-hidden border border-white/10 group-hover:border-blue-500/50 transition-all duration-500">
                          {/* Screenshot Mock */}
                          <div className="absolute inset-0 scale-[0.25] origin-top-left w-[400%] h-[400%] pointer-events-none bg-white">
                             <ResumePreview data={example.data} theme={example.theme as any} />
                          </div>
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4 backdrop-blur-sm">
                             <Button 
                                onClick={() => handleUseTemplate(example.data, example.theme)} 
                                disabled={isCreating}
                                className="rounded-full bg-white text-black hover:bg-slate-200"
                             >
                                {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Use This Template
                             </Button>
                                <Button variant="ghost" className="text-white hover:text-white/80 hover:bg-white/10" onClick={() => window.open(`/p/${example.slug}`, '_blank')}>
                                 View Live Resume <ArrowRight className="w-4 h-4 ml-2" />
                              </Button>
                          </div>
                       </div>
                       <div className="mt-4 flex justify-between items-center">
                          <div>
                             <h3 className="font-bold text-lg">{example.role}</h3>
                             <p className="text-sm text-slate-500 line-clamp-1">{example.data.personalInfo.summary}</p>
                          </div>
                          <span className="text-xs font-mono px-2 py-1 bg-white/10 rounded uppercase tracking-wider text-slate-400 group-hover:text-white transition-colors">
                             {example.theme}
                          </span>
                       </div>
                    </motion.div>
                 ))}
              </div>
           </div>
        </section>

        {/* CTA */}
        <section className="py-32 px-6 text-center relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent pointer-events-none" />
           <div className="relative z-10 max-w-3xl mx-auto space-y-8">
              <h2 className="text-5xl md:text-7xl font-bold tracking-tight">Ready to stand out?</h2>
              <p className="text-xl text-slate-400">Join 100+ professionals using AI to build their personal brand.</p>
              <Button size="lg" className="h-16 px-12 text-xl rounded-full bg-white text-black hover:bg-slate-200 shadow-2xl hover:scale-105 transition-transform" onClick={handleCreate}>
                 <Zap className="w-5 h-5 mr-2 fill-black" />
                  Launch Your Resume
              </Button>
              <div className="pt-8 flex items-center justify-center gap-8 text-sm text-slate-500">
                 <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Free Forever</span>
                 <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> No Credit Card</span>
                 <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Instant Setup</span>
              </div>
           </div>
        </section>

      </main>
    </div>
  );
}
