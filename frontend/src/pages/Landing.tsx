import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import Navbar from '../components/layout/TopBar';
import Logo from '../components/ui/Logo';
import ParticlesBackground from '../components/ui/ParticlesBackground';
import { db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

const LandingPage = () => {
  const navigate = useNavigate();
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: howItWorksRef, offset: ["start end", "end start"] });
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const scale  = useTransform(scrollYProgress, [0, 0.5], [0.85, 1]);

  const [cms, setCms] = useState({
    heroTitle: 'Your classes & exams, perfectly organized.',
    heroDesc: 'Upload your messy departmental PDF — our AI instantly extracts your exact lectures, exams, venues and times into one gorgeous dashboard.',
    announcement: 'ExamSync v2.0 — Now Live',
    features: [
      { icon: 'calendar_month', title: 'Lecture Timetables', desc: 'Daily class schedules with venue details, never miss a room change.' },
      { icon: 'menu_book',      title: 'Exam Schedules',    desc: 'All your exam dates, times and venues in one glanceable view.' },
      { icon: 'auto_awesome',   title: 'AI Extraction',     desc: 'Drop a 50-page PDF and the AI pulls out only your courses.' },
      { icon: 'download',       title: 'Export & Share',    desc: 'Download as PDF or share with coursemates in one tap.' },
    ]
  });

  useEffect(() => {
    const fetchCms = async () => {
      try {
        const docRef = doc(db, 'site_config', 'cms');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCms(prev => ({
            ...prev,
            ...data,
            features: data?.features || prev.features
          }));
        }
      } catch (err) {
        console.warn('Using default CMS content:', err);
      }
    };
    fetchCms();
  }, []);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const steps = [
    { step: '01', icon: 'person_add',    title: 'Sign up & list your courses', desc: 'Tell us your university, department and the courses you offer.' },
    { step: '02', icon: 'cloud_upload',  title: 'Drop the master timetable',   desc: 'Upload the giant departmental PDF or paste the text directly.' },
    { step: '03', icon: 'magic_button',  title: 'Get your personal schedule',  desc: 'We extract only your classes and exams — venues included.' },
  ];

  return (
    <div className="bg-surface min-h-screen text-on-surface font-sans overflow-x-hidden transition-colors duration-500">

      {/* SVG Particle background */}
      <ParticlesBackground />

      {/* Ambient glows (Simplified for performance) */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden flex items-center justify-center">
        <div className="absolute -top-[10%] -left-[10%] w-[60vw] h-[60vw] bg-emerald-600/10 rounded-full blur-[80px]" />
        <div className="absolute top-[40%] -right-[10%] w-[50vw] h-[50vw] bg-amber-500/10 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 flex flex-col">
        <Navbar />

        {/* ═══════════════════════════════════════
            HERO
        ═══════════════════════════════════════ */}
        <section className="min-h-[90vh] flex items-center pt-2 md:pt-8">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center py-8 lg:py-0">

            {/* Left: copy */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
                className="inline-flex items-center gap-2 bg-surface-container border border-outline/10 px-4 py-2 rounded-full text-xs sm:text-sm font-medium backdrop-blur-md hover:bg-surface-container-high transition-all cursor-pointer">
                <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse" />
                <span className="text-on-surface-variant">{cms.announcement}</span>
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
                className="text-5xl sm:text-6xl xl:text-7xl font-black tracking-tighter leading-[1.05]">
                {cms.heroTitle.split(',')[0]}, <span className="text-primary">{cms.heroTitle.split(',')[1]}</span>
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
                className="text-on-surface-variant text-base sm:text-lg lg:text-xl leading-relaxed max-w-xl">
                {cms.heroDesc}
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <button onClick={() => navigate('/login')}
                  className="w-full sm:w-auto bg-secondary-container hover:bg-secondary text-on-secondary-container font-black px-8 py-4 rounded-2xl text-base transition-all shadow-md hover:-translate-y-1">
                  Get Started Free
                </button>
                <button onClick={() => scrollTo('how-it-works')}
                  className="w-full sm:w-auto border border-outline/20 text-on-surface hover:bg-surface-container font-bold px-8 py-4 rounded-2xl text-base transition-all">
                  See How It Works
                </button>
              </motion.div>

              {/* Social proof strip */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                className="flex items-center gap-3 text-sm text-on-surface-variant">
                <div className="flex -space-x-2">
                  {['12', '25', '47', '56', '68'].map((n, i) => (
                    <img key={i} src={`https://i.pravatar.cc/32?img=${n}`} className="w-7 h-7 rounded-full border-2 border-surface" alt="" />
                  ))}
                </div>
                <span><span className="text-on-surface font-semibold">1,200+ students</span> already synced</span>
              </motion.div>
            </div>

            {/* Right: Student illustration */}
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.3 }}
              className="relative flex items-center justify-center">

              {/* Outer glow ring */}
              <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-emerald-500/20 to-amber-500/10 blur-[60px]" />

              {/* Card frame */}
              <div className="relative w-full max-w-sm lg:max-w-full rounded-[2.5rem] overflow-hidden border border-outline/10 shadow-2xl bg-surface-container">
                <img
                  src="/student_hero.png"
                  alt="Student using ExamSync"
                  className="w-full h-auto object-cover"
                />

                {/* Floating schedule card — top right */}
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute top-4 right-4 bg-surface/90 backdrop-blur-xl border border-primary/30 rounded-2xl p-4 shadow-modal w-40">
                  <div className="text-[10px] text-primary font-bold uppercase tracking-wider mb-2">Next Class</div>
                  <div className="text-on-surface font-black text-sm leading-tight">CSC 401</div>
                  <div className="text-on-surface-variant text-[11px] mt-1">08:00 AM · LT 1</div>
                  <div className="mt-2 h-1 bg-on-surface/10 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-primary rounded-full" />
                  </div>
                </motion.div>

                {/* Floating exam badge — bottom left */}
                <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="absolute bottom-4 left-4 bg-surface/90 backdrop-blur-xl border border-secondary/30 rounded-2xl p-4 shadow-modal w-44">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                    <div className="text-[10px] text-secondary font-bold uppercase tracking-wider">Exam in 3 days</div>
                  </div>
                  <div className="text-on-surface font-black text-sm">MTH 402</div>
                  <div className="text-on-surface-variant text-[11px] mt-1">Science LT · 10 AM</div>
                </motion.div>
              </div>
            </motion.div>

          </div>
        </section>

        {/* ═══════════════════════════════════════
            HOW IT WORKS
        ═══════════════════════════════════════ */}
        <section id="how-it-works" ref={howItWorksRef} className="py-24 md:py-32 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div style={{ opacity, scale }} className="text-center mb-16 md:mb-24">
              <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-5">How ExamSync Works</h2>
              <p className="text-on-surface-variant text-lg md:text-xl max-w-2xl mx-auto">Three steps and you're done. No more hunting through 50-page PDFs.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              <div className="hidden md:block absolute top-[3.5rem] left-[16%] right-[16%] h-px bg-gradient-to-r from-emerald-500/0 via-emerald-500/40 to-amber-500/0" />
              {steps.map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.2 }}
                  className="relative z-10 flex flex-col items-center text-center space-y-5">
                  <div className="w-28 h-28 rounded-3xl bg-surface-card border border-outline/10 flex items-center justify-center relative group hover:border-primary/50 transition-colors shadow-lg">
                    <span className="material-symbols-outlined text-5xl text-primary group-hover:scale-110 transition-transform">{s.icon}</span>
                    <div className="absolute -top-4 -right-4 w-11 h-11 rounded-xl bg-secondary-container flex items-center justify-center text-sm font-black text-on-secondary-container border-2 border-surface shadow-md group-hover:rotate-12 transition-transform">
                      {s.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-on-surface">{s.title}</h3>
                  <p className="text-on-surface-variant max-w-xs leading-relaxed">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            FEATURES
        ═══════════════════════════════════════ */}
        <section id="features" className="py-24 md:py-32 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-5">Everything you need.</h2>
              <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">Built specifically for students who are tired of being disorganized.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {cms.features.map((f, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="bg-surface-card border border-outline/10 hover:border-primary/30 rounded-2xl p-7 space-y-4 transition-all group shadow-card cursor-default">
                  <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center border border-primary/20 group-hover:bg-primary group-hover:border-primary transition-all">
                    <span className="material-symbols-outlined text-on-primary-container group-hover:text-on-primary transition-colors">{f.icon}</span>
                  </div>
                  <h4 className="text-lg font-bold text-on-surface">{f.title}</h4>
                  <p className="text-on-surface-variant text-sm leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            CTA
        ═══════════════════════════════════════ */}
        <section className="py-24 md:py-32 border-t border-outline/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
              className="relative bg-surface-card border border-primary/30 rounded-[2.5rem] p-10 md:p-20 overflow-hidden group">

              {/* Glows inside card */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
              <div className="absolute inset-0 rounded-[2.5rem] border border-secondary/0 group-hover:border-secondary/25 transition-colors duration-700 pointer-events-none" />

              {/* Content — fully centered */}
              <div className="relative z-10 flex flex-col items-center text-center gap-6">
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-on-surface">
                  Ready to <span className="text-primary">sync?</span>
                </h2>
                <p className="text-on-surface-variant text-lg md:text-xl max-w-xl leading-relaxed">
                  Join thousands of students who have completely automated their lecture and exam scheduling. 100% free.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="bg-secondary-container hover:bg-secondary text-on-secondary-container hover:text-on-secondary font-black px-12 py-5 rounded-2xl text-lg transition-all shadow-md hover:-translate-y-1"
                >
                  Create Your Free Account
                </button>
                <div className="flex items-center gap-2 text-sm text-secondary font-medium">
                  <span className="material-symbols-outlined text-sm">bolt</span>
                  Setup takes less than 2 minutes
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            FOOTER
        ═══════════════════════════════════════ */}
        <footer className="border-t border-outline/10 py-10 bg-surface/60 backdrop-blur-lg">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-5">
            <div className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity cursor-pointer">
              <Logo size="sm" />
              <span className="text-sm font-medium">© 2026 ExamSync</span>
            </div>
            <div className="text-sm text-on-surface-variant flex items-center gap-2 bg-surface-container border border-outline/10 px-4 py-2 rounded-full">
              Designed with{' '}
              <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1.1 }} className="text-red-500">❤️</motion.span>
              {' '}by <span className="font-bold text-on-surface ml-1">Glory Adeniran</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
