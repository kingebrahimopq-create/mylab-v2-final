import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FileSignature, Building2, Facebook, CalendarDays, Palette, MessageSquare, Mail, RefreshCw } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const integrations = [
  { name: 'DocuSign', icon: FileSignature },
  { name: 'Dotloop', icon: Building2 },
  { name: 'Facebook Ads', icon: Facebook },
  { name: 'Google Calendar', icon: CalendarDays },
  { name: 'Canva', icon: Palette },
  { name: 'Twilio', icon: MessageSquare },
  { name: 'MailChimp', icon: Mail },
  { name: 'PieSync', icon: RefreshCw },
];

export default function Ecosystem() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );

      gsap.fromTo(
        cardsRef.current.filter(Boolean),
        { opacity: 0, scale: 0.95 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          stagger: 0.06,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: cardsRef.current[0],
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="ecosystem"
      ref={sectionRef}
      className="w-full"
      style={{
        background: 'linear-gradient(180deg, #FFFFFF 0%, #D6EAF5 100%)',
        padding: '120px 24px',
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div ref={headerRef} className="text-center mb-14">
          <span
            className="inline-block px-4 py-1.5 text-xs font-semibold uppercase tracking-widest mb-6"
            style={{
              background: 'rgba(0,42,84,0.08)',
              color: '#002A54',
              borderRadius: '100px',
              letterSpacing: '0.08em',
            }}
          >
            Open Ecosystem
          </span>
          <h2
            style={{
              color: '#002A54',
              fontSize: 'clamp(28px, 3.5vw, 36px)',
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: '-0.01em',
            }}
          >
            Integrations That Work as Hard as You Do
          </h2>
          <p
            className="mt-5 mx-auto"
            style={{
              color: 'rgba(0,42,84,0.6)',
              fontSize: '18px',
              maxWidth: '640px',
              lineHeight: 1.65,
            }}
          >
            Command seamlessly connects with the tools you already use, creating a unified workflow that saves time and eliminates data silos.
          </p>
        </div>

        {/* Integration Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {integrations.map((integration, i) => {
            const Icon = integration.icon;
            return (
              <div
                key={i}
                ref={(el) => { cardsRef.current[i] = el; }}
                className="flex flex-col items-center text-center transition-all duration-300"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid rgba(0,42,84,0.08)',
                  borderRadius: '16px',
                  padding: '32px 24px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,42,84,0.08)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={32} color="#002A54" strokeWidth={1.5} />
                </div>
                <span
                  className="mt-4 font-semibold"
                  style={{ color: '#002A54', fontSize: '16px' }}
                >
                  {integration.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
