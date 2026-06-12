import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { Star, ChevronDown } from 'lucide-react';
import EnergyTerrain from './EnergyTerrain';

export default function Hero() {
  const tagRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const trustRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.to(tagRef.current, { opacity: 1, y: 0, duration: 0.8, delay: 0.4 })
      .to(headlineRef.current, { opacity: 1, y: 0, duration: 0.8 }, '-=0.6')
      .to(subRef.current, { opacity: 1, y: 0, duration: 0.8 }, '-=0.6')
      .to(ctaRef.current, { opacity: 1, y: 0, duration: 0.8 }, '-=0.6')
      .to(trustRef.current, { opacity: 1, y: 0, duration: 0.8 }, '-=0.6');

    return () => { tl.kill(); };
  }, []);

  return (
    <section id="hero" className="relative w-full" style={{ height: '100vh', background: '#002A54' }}>
      <EnergyTerrain />

      <div
        className="relative z-10 flex flex-col items-center justify-center h-full px-6"
        style={{ maxWidth: '1200px', margin: '0 auto' }}
      >
        {/* Tag pill */}
        <div
          ref={tagRef}
          className="opacity-0"
          style={{ transform: 'translateY(-20px)' }}
        >
          <span
            className="inline-block px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
            style={{
              background: 'rgba(0,169,224,0.12)',
              border: '1px solid rgba(0,169,224,0.25)',
              color: '#00A9E0',
              borderRadius: '100px',
            }}
          >
            The All-in-One Real Estate Platform
          </span>
        </div>

        {/* Headline */}
        <h1
          ref={headlineRef}
          className="opacity-0 text-glow text-center mt-6"
          style={{
            color: '#F5F6F8',
            fontSize: 'clamp(36px, 5vw, 64px)',
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: '-0.02em',
            maxWidth: '720px',
            transform: 'translateY(20px)',
          }}
        >
          Command Your Real Estate Business — From Lead to Close
        </h1>

        {/* Subheadline */}
        <p
          ref={subRef}
          className="opacity-0 text-center mt-5"
          style={{
            color: '#A8D0E6',
            fontSize: '20px',
            fontWeight: 400,
            maxWidth: '560px',
            lineHeight: 1.65,
            transform: 'translateY(20px)',
          }}
        >
          More than a CRM. An integrated suite of interconnected tools designed specifically for Keller Williams agents to manage leads, listings, and leverage — all in one place.
        </p>

        {/* CTA Group */}
        <div
          ref={ctaRef}
          className="opacity-0 flex flex-wrap items-center justify-center gap-4 mt-8"
          style={{ transform: 'translateY(20px)' }}
        >
          <button
            className="font-semibold transition-all duration-300"
            style={{
              backgroundColor: '#00A9E0',
              color: '#002A54',
              borderRadius: '32px',
              padding: '14px 32px',
              fontSize: '16px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 20px rgba(0,169,224,0.4)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Download the App
          </button>
          <button
            className="font-semibold transition-all duration-300"
            style={{
              backgroundColor: 'transparent',
              border: '1px solid rgba(245,246,248,0.3)',
              color: '#F5F6F8',
              borderRadius: '32px',
              padding: '14px 32px',
              fontSize: '16px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(245,246,248,0.6)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(245,246,248,0.3)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Watch Demo
          </button>
        </div>

        {/* Trust badges */}
        <div
          ref={trustRef}
          className="opacity-0 flex flex-wrap items-center justify-center gap-8 mt-12"
          style={{ transform: 'translateY(20px)' }}
        >
          <div className="flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="#00A9E0" color="#00A9E0" />
              ))}
            </div>
            <span className="text-sm font-medium" style={{ color: '#A8D0E6' }}>4.3/5 Rating</span>
          </div>
          <span className="text-sm font-medium" style={{ color: '#A8D0E6' }}>323+ Reviews</span>
          <span className="text-sm font-medium" style={{ color: '#A8D0E6' }}>Free for KW Agents</span>
          <span className="text-sm font-medium" style={{ color: '#A8D0E6' }}>180K+ Agents Using Command</span>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bob">
        <ChevronDown size={28} style={{ color: 'rgba(0,169,224,0.5)' }} />
      </div>
    </section>
  );
}
