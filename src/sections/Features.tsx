import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Users, Target, Zap, BarChart3, Globe, Calendar } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: Users,
    title: 'Smart CRM & Contacts',
    description: 'Organize, manage, and nurture your leads and contacts. Filter, tag, and segment for easy searches. Command auto-associates contacts with neighborhoods for hyper-local relevance.',
  },
  {
    icon: Target,
    title: 'Opportunities Dashboard',
    description: 'Visual sales pipelines and forecasting. Track every opportunity from initial contact to closing with drag-and-drop pipeline stages for listings, buyers, and leases.',
  },
  {
    icon: Zap,
    title: 'SmartPlans Automation',
    description: 'Automate follow-up communications with intelligent campaigns. Birthday greetings, open house follow-ups, home anniversary touches — systemized communication at scale.',
  },
  {
    icon: BarChart3,
    title: 'Business Intelligence',
    description: 'Assess your database strength, analyze performance metrics, and track goals. Real-time Market Center dashboard widgets showing agent counts, owner profit, and company dollar.',
  },
  {
    icon: Globe,
    title: 'Referral Network',
    description: "Access the world's largest independent agent-to-agent referral network. View referral patterns, determine expansion avenues, and close more deals through your network.",
  },
  {
    icon: Calendar,
    title: 'Calendar & Tasks',
    description: 'Manage your time, goals, and transactions in one place. Integrated with Google Calendar. Task automation ensures nothing falls through the cracks.',
  },
];

export default function Features() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header animation
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

      // Cards stagger animation
      gsap.fromTo(
        cardsRef.current.filter(Boolean),
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power3.out',
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
      id="features"
      ref={sectionRef}
      className="w-full"
      style={{
        background: 'linear-gradient(180deg, #002A54 0%, #00152A 100%)',
        padding: '120px 24px',
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div ref={headerRef} className="text-center mb-16">
          <span
            className="inline-block px-4 py-1.5 text-xs font-semibold uppercase tracking-widest mb-6"
            style={{
              color: '#00A9E0',
              letterSpacing: '0.08em',
            }}
          >
            Built by Agents, For Agents
          </span>
          <h2
            className="text-glow"
            style={{
              color: '#F5F6F8',
              fontSize: 'clamp(28px, 3.5vw, 36px)',
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: '-0.01em',
            }}
          >
            Your Entire Business. One Login.
          </h2>
          <p
            className="mt-5 mx-auto"
            style={{
              color: '#A8D0E6',
              fontSize: '18px',
              maxWidth: '640px',
              lineHeight: 1.65,
            }}
          >
            From your first lead to your final close — and every relationship in between — Command gives you the systems to grow predictably, run efficiently, and build a brand that lasts.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                ref={(el) => { cardsRef.current[i] = el; }}
                className="transition-all duration-300"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '20px',
                  padding: '40px 32px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0,169,224,0.3)';
                  e.currentTarget.style.boxShadow = '0 8px 40px rgba(0,169,224,0.1)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'rgba(0,169,224,0.1)',
                  }}
                >
                  <Icon size={22} color="#00A9E0" />
                </div>
                <h3
                  className="mt-6"
                  style={{
                    color: '#F5F6F8',
                    fontSize: '20px',
                    fontWeight: 700,
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  className="mt-3"
                  style={{
                    color: '#A8D0E6',
                    fontSize: '15px',
                    lineHeight: 1.6,
                  }}
                >
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
