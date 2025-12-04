import React, { useEffect, useRef, useState } from 'react';
import {
  Gamepad2,
  Network,
  CheckCircle2,
  Terminal,
  ChevronRight,
  Cpu,
  Globe,
  ShieldCheck,
  Zap,
  Users
} from 'lucide-react';
import { Application, Feature } from './types';

// --- Components ---

const ShinyButton: React.FC<{ text: string; onClick?: () => void; className?: string; href?: string }> = ({ text, onClick, className = '', href }) => {
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`shiny-cta inline-block text-center no-underline ${className}`}
      >
        <span>{text}</span>
      </a>
    );
  }
  return (
    <button className={`shiny-cta ${className}`} onClick={onClick}>
      <span>{text}</span>
    </button>
  );
};

const ProgressiveBlur: React.FC = () => {
  return (
    <div className="gradient-blur">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
};

const MatrixRain: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Characters to use in the rain
    const characters = 'GENSYN01';
    const fontSize = 14;
    const columns = Math.floor(width / fontSize);

    // Initialize drops at random Y positions
    const drops: number[] = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100; // Start above screen
    }

    const draw = () => {
      // Trail effect: render a semi-transparent rect over the whole canvas
      ctx.fillStyle = 'rgba(32, 11, 1, 0.03)'; // Dark background matching theme
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#FF4D00'; // Orange text
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 50);

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-[-2] opacity-[0.25]"
    />
  );
};

const RevealOnScroll: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  return (
    <div ref={ref} className={`animate-on-scroll ${className}`}>
      {children}
    </div>
  );
};

const HeroHeadline: React.FC = () => {
  const [text, setText] = useState("Machine");
  const [phase, setPhase] = useState<'idle' | 'deleting' | 'typing' | 'finished'>('idle');
  const [cursorVisible, setCursorVisible] = useState(true);

  // Blinking cursor effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorVisible(prev => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  // Typing animation logic
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (phase === 'idle') {
      timeout = setTimeout(() => setPhase('deleting'), 2000);
    } else if (phase === 'deleting') {
      if (text.length > 0) {
        timeout = setTimeout(() => setText(prev => prev.slice(0, -1)), 100);
      } else {
        setPhase('typing');
      }
    } else if (phase === 'typing') {
      const fullText = "Decentralized";
      if (text.length < fullText.length) {
        timeout = setTimeout(() => setText(fullText.slice(0, text.length + 1)), 150);
      } else {
        setPhase('finished');
      }
    }

    return () => clearTimeout(timeout);
  }, [text, phase]);

  return (
    <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-medium leading-[0.9] text-[#eed2cc] tracking-tight">
      The Network for <br />
      <span className="whitespace-nowrap">
        <span className="relative inline-block">
          <span
            className={`transition-all duration-1000 ${phase === 'finished'
              ? 'text-[#FF4D00] font-bold drop-shadow-[0_0_30px_rgba(255,77,0,0.6)]'
              : 'text-[#eed2cc]'
              }`}
          >
            {text}
          </span>
          {/* Animated Cursor */}
          <span
            className={`
              absolute -right-[0.15em] top-[0.1em] bottom-[0.1em] w-[0.08em] bg-[#FF4D00]
              transition-opacity duration-100
              ${(!cursorVisible || phase === 'finished') ? 'opacity-0' : 'opacity-100'}
            `}
          />
        </span>
        <span className="text-[#eed2cc]"> Intelligence</span>
      </span>
    </h1>
  );
};

// --- Data ---

const applications: Application[] = [
  {
    id: 'blockassist',
    title: 'BlockAssist',
    subtitle: 'Sovereign AI Assistant',
    description: 'An open-source AI assistant for Minecraft that learns directly from player actions.',
    useCase: 'Train a sovereign, on-device AI assistant that improves as you play in real-time.',
    icon: Gamepad2,
    color: '#1d4ed8',
    backgroundImage: '/pics/blockassist.png',
    learnMoreUrl: 'https://www.gensyn.ai/articles/blockassist'
  },
  {
    id: 'rl-swarm',
    title: 'RL-Swarm',
    subtitle: 'Distributed Training Framework',
    description: 'A fully open-source framework for creating RL training swarms over the internet.',
    useCase: 'Collaborative post-training via distributed RL reasoning supporting >100 environments.',
    icon: Network,
    color: '#FF8F00',
    backgroundImage: '/pics/rl-swarm.png',
    learnMoreUrl: 'https://www.gensyn.ai/articles/rl-swarm'
  },
  {
    id: 'judge',
    title: 'Judge',
    subtitle: 'Verifiable Evaluation',
    description: 'Cryptographically verifiable AI evaluation system built on the Verde protocol.',
    useCase: 'Deterministic evaluation with traceable provenance, eliminating opaque API reliance.',
    icon: CheckCircle2,
    color: '#06402B',
    backgroundImage: '/pics/judge.png',
    learnMoreUrl: 'https://blog.gensyn.ai/introducing-judge/'
  },
  {
    id: 'codeassist',
    title: 'CodeAssist',
    subtitle: 'Adaptive Developer Tool',
    description: 'On-device coding assistant that learns and improves through your coding sessions.',
    useCase: 'Records coding actions and retrains after each session for deep personalization.',
    icon: Terminal,
    color: '#6C3BAA',
    backgroundImage: '/pics/codeassist.png',
    learnMoreUrl: 'https://blog.gensyn.ai/introducing-codeassist/'
  }
];

// --- Main App ---

const App: React.FC = () => {
  const [activeApp, setActiveApp] = useState<string | null>('blockassist');

  return (
    <div className="min-h-screen relative selection:bg-[#FF4D00] selection:text-white">
      {/* Background Matrix Rain */}
      <MatrixRain />

      {/* Visual Effects */}
      <ProgressiveBlur />

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#1d4ed8] rounded-full mix-blend-screen filter blur-[128px] opacity-10"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#d97706] rounded-full mix-blend-screen filter blur-[128px] opacity-5"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 flex items-center justify-between px-6 py-6 lg:px-12 backdrop-blur-sm">
        <div className="text-2xl font-display font-bold tracking-tight text-[#eed2cc]">
          GENSYN
        </div>
        <div className="hidden md:flex space-x-8 text-sm font-medium text-[#eed2cc]/80">
          <a href="#applications" className="hover:text-white transition-colors">Applications</a>
          <a href="#verde" className="hover:text-white transition-colors">Protocol</a>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="https://docs.gensyn.ai" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Docs</a>
        </div>
        <div className="flex items-center space-x-4">
          <a
            href="https://dashboard.gensyn.ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-[#eed2cc] hover:text-white transition-colors hidden sm:block"
          >
            Log In
          </a>
          <a
            href="https://gensyn-testnet.explorer.alchemy.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#eed2cc]/10 hover:bg-[#eed2cc]/20 text-[#eed2cc] px-4 py-2 rounded-full text-sm font-medium transition-all backdrop-blur-md border border-[#eed2cc]/10"
          >
            Explorer
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-center items-center px-4 pt-20 text-center">
        <RevealOnScroll className="max-w-5xl mx-auto space-y-8">
          <div className="inline-flex items-center space-x-2 bg-[#eed2cc]/5 border border-[#eed2cc]/10 rounded-full px-4 py-1.5 backdrop-blur-md mb-4">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs uppercase tracking-wider font-semibold text-[#eed2cc]/80">Testnet Live</span>
          </div>

          <HeroHeadline />

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-[#eed2cc]/70 font-light leading-relaxed">
            Gensyn connects the world's compute into a single, global machine learning supercluster.
            Verifiable, decentralized, and permissionless.
          </p>

          <div className="pt-8 flex flex-col md:flex-row items-center justify-center gap-6">
            <ShinyButton text="Join Gensyn Testnet" href="https://www.gensyn.ai/testnet" />
            <a href="#applications" className="group flex items-center space-x-2 text-[#eed2cc] hover:text-white transition-colors">
              <span>Explore Applications</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </RevealOnScroll>
      </section>

      {/* Applications Section - Expand on Hover */}
      <section id="applications" className="py-24 px-4 lg:px-12 max-w-[1600px] mx-auto">
        <RevealOnScroll className="mb-16">
          <h2 className="text-4xl md:text-5xl font-display mb-4 text-[#eed2cc]">Core Applications</h2>
          <p className="text-[#eed2cc]/60 max-w-xl text-lg">
            Sovereign tools built on the Gensyn network, demonstrating the power of decentralized compute.
          </p>
        </RevealOnScroll>

        <RevealOnScroll>
          <div className="flex flex-col gap-4 h-[900px] w-full">
            {applications.map((app) => (
              <div
                key={app.id}
                onMouseEnter={() => setActiveApp(app.id)}
                onClick={() => setActiveApp(app.id)}
                className={`
                  relative glass-card rounded-3xl overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]
                  flex flex-col
                  ${activeApp === app.id ? 'flex-[4] bg-[#eed2cc]/5' : 'flex-1 bg-[#eed2cc]/[0.02]'}
                  group cursor-pointer border border-[#eed2cc]/10 hover:border-[#eed2cc]/30
                `}
              >
                {/* Background Image */}
                {app.backgroundImage && (
                  <div
                    className={`absolute inset-0 transition-opacity duration-700 ${activeApp === app.id ? 'opacity-40' : 'opacity-15'
                      }`}
                    style={{
                      backgroundImage: `url(${app.backgroundImage})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }}
                  />
                )}

                {/* Background Gradient for Active State */}
                <div
                  className={`absolute inset-0 transition-opacity duration-700 ${activeApp === app.id ? 'opacity-20' : 'opacity-0'}`}
                  style={{ background: `radial-gradient(circle at center, ${app.color}, transparent 70%)` }}
                />

                <div className={`relative z-10 h-full flex flex-col justify-between transition-all duration-500 ${activeApp === app.id ? 'p-6 md:p-8' : 'p-4'}`}>
                  <div className="flex items-start justify-between">
                    <div className={`rounded-2xl bg-[#200b01]/50 backdrop-blur-md border border-[#eed2cc]/10 text-[#eed2cc] transition-all duration-500 ${activeApp === app.id ? 'p-4 scale-110' : 'p-3 scale-100'}`}>
                      <app.icon className="w-8 h-8" />
                    </div>
                    {activeApp === app.id && (
                      <div className="hidden sm:block animate-pulse w-2 h-2 rounded-full bg-[#eed2cc]"></div>
                    )}
                  </div>

                  <div className="mt-auto space-y-4">
                    <h3 className={`font-display text-[#eed2cc] whitespace-nowrap transition-all duration-500 ${activeApp === app.id ? 'text-3xl' : 'text-2xl'}`}>
                      {app.title}
                    </h3>
                    <p className={`transition-all duration-500 ${activeApp === app.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} ${app.id === 'judge' ? 'font-semibold' : 'font-medium'}`} style={{ color: app.color }}>
                      {app.subtitle}
                    </p>

                    <div className={`space-y-4 overflow-hidden transition-all duration-700 ${activeApp === app.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <p className="text-[#eed2cc]/80 leading-relaxed">
                        {app.description}
                      </p>
                      <div className="pt-4 border-t border-[#eed2cc]/10">
                        <span className="text-xs uppercase tracking-widest text-[#eed2cc]/50 block mb-2">Use Case</span>
                        <p className="text-sm text-[#eed2cc]/70">{app.useCase}</p>
                      </div>
                      <a
                        href={app.learnMoreUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-block text-sm text-white underline decoration-2 underline-offset-4 hover:decoration-white transition-colors"
                        style={{ textDecorationColor: app.color }}
                      >
                        Learn more
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </RevealOnScroll>
      </section>

      {/* Verde Protocol Section */}
      <section id="verde" className="py-24 relative overflow-hidden">
        {/* Background Graphic */}
        <div className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="none" stroke="#eed2cc" strokeWidth="0.1" />
            <path d="M0 100 C 30 20 70 20 100 100 Z" fill="none" stroke="#eed2cc" strokeWidth="0.1" />
            <path d="M0 100 C 40 40 60 40 100 100 Z" fill="none" stroke="#eed2cc" strokeWidth="0.1" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <RevealOnScroll>
              <h2 className="text-5xl md:text-7xl font-display text-[#eed2cc] leading-tight mb-8">
                Trustless Verification: <br />
                <span className="text-[#1d4ed8]">The Verde Protocol</span>
              </h2>
              <p className="text-xl text-[#eed2cc]/80 mb-8 leading-relaxed">
                Verde enables bitwise-exact reproducibility across any hardware.
                Disputes are resolved by pinpointing the exact operation in question,
                eliminating the need to re-run entire tasks.
              </p>

              <ul className="space-y-6 mb-10">
                {[
                  "Deterministic Kernels & Proprietary Compiler",
                  "Lightweight Dispute Resolution",
                  "Reproducible Operators (RepOps)",
                  "Guaranteed Correctness via 1-of-N Honesty"
                ].map((item, i) => (
                  <li key={i} className="flex items-center space-x-4">
                    <div className="w-6 h-6 rounded-full border border-[#1d4ed8] flex items-center justify-center text-[#1d4ed8]">
                      <CheckCircle2 size={14} />
                    </div>
                    <span className="text-[#eed2cc] font-light text-lg">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-4">
                <a href="https://docs.gensyn.ai/litepaper" target="_blank" rel="noopener noreferrer" className="px-6 py-3 border border-[#eed2cc]/30 rounded-full text-[#eed2cc] hover:bg-[#eed2cc] hover:text-[#200b01] transition-all duration-300">
                  Read the Whitepaper
                </a>
                <a href="https://docs.gensyn.ai" target="_blank" rel="noopener noreferrer" className="px-6 py-3 text-[#eed2cc]/60 hover:text-[#eed2cc] transition-colors">
                  View Technical Docs
                </a>
              </div>
            </RevealOnScroll>

            <RevealOnScroll className="relative">
              <div className="glass-card rounded-[2rem] p-1 border border-[#eed2cc]/10 aspect-square flex items-center justify-center relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#1d4ed8]/20 to-transparent rounded-[2rem]"></div>

                {/* Abstract Visualization of Verification */}
                <div className="relative w-3/4 h-3/4 grid grid-cols-2 gap-4">
                  <div className="bg-[#200b01]/60 backdrop-blur-sm rounded-xl border border-[#eed2cc]/10 p-6 flex flex-col justify-between">
                    <Cpu className="text-[#eed2cc] w-8 h-8 opacity-80" />
                    <span className="text-sm text-[#eed2cc]/60">Solver</span>
                  </div>
                  <div className="bg-[#200b01]/60 backdrop-blur-sm rounded-xl border border-[#eed2cc]/10 p-6 flex flex-col justify-between">
                    <ShieldCheck className="text-[#1d4ed8] w-8 h-8 opacity-80" />
                    <span className="text-sm text-[#eed2cc]/60">Verifier</span>
                  </div>
                  <div className="col-span-2 bg-[#eed2cc]/5 rounded-xl border border-[#eed2cc]/10 p-6 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[#eed2cc] font-display text-xl">State Hash</span>
                      <span className="text-[#eed2cc]/40 text-xs font-mono">0x7f...3a2b</span>
                    </div>
                    <div className="h-2 w-24 bg-[#200b01] rounded-full overflow-hidden">
                      <div className="h-full bg-[#1d4ed8] w-[80%]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-[#1a0901]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <RevealOnScroll className="text-center mb-16">
            <h2 className="text-4xl font-display text-[#eed2cc] mb-4">Why Gensyn Matters</h2>
            <p className="text-[#eed2cc]/60 max-w-2xl mx-auto">
              Moving beyond centralized APIs to a permissionless protocol for the world's intelligence.
            </p>
          </RevealOnScroll>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Globe,
                title: "Permissionless",
                desc: "Anyone can contribute compute or train models. No gatekeepers, no API limits."
              },
              {
                icon: Zap,
                title: "Cost Efficient",
                desc: "Market-driven pricing for compute power, utilizing idle hardware globally."
              },
              {
                icon: Users,
                title: "Sovereign",
                desc: "Train models on your own terms. Your data, your parameters, your intelligence."
              }
            ].map((feature, idx) => (
              <RevealOnScroll key={idx} className={`delay-[${idx * 100}ms]`}>
                <div className="liquid-glass-card p-8 rounded-3xl h-full">
                  <div className="glass-icon-container w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-[#eed2cc]">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-display text-[#eed2cc] mb-3">{feature.title}</h3>
                  <p className="text-[#eed2cc]/70 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#200b01] to-[#150701]"></div>
        <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>

        <RevealOnScroll className="relative z-10 max-w-3xl mx-auto space-y-8">
          <h2 className="text-5xl md:text-7xl font-display text-[#eed2cc]">
            Ready to Build?
          </h2>
          <p className="text-xl text-[#eed2cc]/60">
            Join the testnet today and start training on the world's largest distributed machine learning cluster.
          </p>
          <div className="pt-4">
            <ShinyButton text="Launch Console" href="https://dashboard.gensyn.ai/" />
          </div>
        </RevealOnScroll>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#eed2cc]/10 bg-[#150701] pt-16 pb-8 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2 md:col-span-1">
              <span className="text-2xl font-display font-bold text-[#eed2cc]">GENSYN</span>
              <p className="mt-4 text-[#eed2cc]/40 text-sm">
                Decentralizing the future of machine intelligence.
              </p>
            </div>

            <div>
              <h4 className="text-[#eed2cc] font-medium mb-4">Protocol</h4>
              <ul className="space-y-2 text-sm text-[#eed2cc]/60">
                <li><a href="https://docs.gensyn.ai/litepaper" target="_blank" rel="noopener noreferrer" className="hover:text-[#eed2cc]">Verde Paper</a></li>
                <li><a href="https://docs.gensyn.ai" target="_blank" rel="noopener noreferrer" className="hover:text-[#eed2cc]">Docs</a></li>
                <li><a href="https://github.com/gensyn-ai" target="_blank" rel="noopener noreferrer" className="hover:text-[#eed2cc]">Github</a></li>
                <li><a href="https://gensyn-testnet.explorer.alchemy.com/stats" target="_blank" rel="noopener noreferrer" className="hover:text-[#eed2cc]">Testnet Stats</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[#eed2cc] font-medium mb-4">Community</h4>
              <ul className="space-y-2 text-sm text-[#eed2cc]/60">
                <li><a href="https://discord.gg/gensyn" target="_blank" rel="noopener noreferrer" className="hover:text-[#eed2cc]">Discord</a></li>
                <li><a href="https://x.com/gensynai" target="_blank" rel="noopener noreferrer" className="hover:text-[#eed2cc]">Twitter / X</a></li>
                <li><a href="https://blog.gensyn.ai/" target="_blank" rel="noopener noreferrer" className="hover:text-[#eed2cc]">Blog</a></li>
                <li><a href="https://www.gensyn.ai/careers" target="_blank" rel="noopener noreferrer" className="hover:text-[#eed2cc]">Careers</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[#eed2cc] font-medium mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-[#eed2cc]/60">
                <li><a href="https://www.gensyn.ai/privacy-policy" target="_blank" rel="noopener noreferrer" className="hover:text-[#eed2cc]">Privacy</a></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-[#eed2cc]/5">
            <p className="text-[#eed2cc]/20 text-xs">
              © {new Date().getFullYear()} Gensyn. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-[#eed2cc]/40 text-xs font-mono">System Operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;