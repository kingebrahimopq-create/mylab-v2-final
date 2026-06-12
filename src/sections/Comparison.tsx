import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check, X } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const rows = [
  { feature: 'Lead Management', kw: true, other: 'extra' },
  { feature: 'Email Campaigns', kw: true, other: 'limited' },
  { feature: 'Social Media Ads', kw: true, other: false },
  { feature: 'Transaction Mgmt', kw: true, other: false },
  { feature: 'Website Builder', kw: true, other: false },
  { feature: 'DocuSign Integration', kw: true, other: false },
  { feature: 'Referral Network', kw: true, other: false },
];

export default function Comparison() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

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
        tableRef.current,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: tableRef.current,
            start: 'top 75%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="comparison"
      ref={sectionRef}
      className="w-full"
      style={{
        background: '#002A54',
        padding: '120px 24px',
      }}
    >
      <div className="max-w-3xl mx-auto">
        {/* Section Header */}
        <div ref={headerRef} className="text-center mb-12">
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
            The Best Things in Business Are Free
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
            While other CRMs could cost you up to $1,000/month with setup, advertising, and add-ons — Command is included with your KW technology fee.
          </p>
        </div>

        {/* Comparison Table */}
        <div
          ref={tableRef}
          className="overflow-hidden"
          style={{
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {/* Table Header */}
          <div
            className="grid grid-cols-3 gap-4 px-6 py-4"
            style={{ background: 'rgba(0,169,224,0.15)' }}
          >
            <span className="font-semibold text-sm" style={{ color: '#00A9E0' }}>Feature</span>
            <span className="font-semibold text-sm text-center" style={{ color: '#00A9E0' }}>KW Command</span>
            <span className="font-semibold text-sm text-center" style={{ color: '#00A9E0' }}>Other CRMs</span>
          </div>

          {/* Table Rows */}
          {rows.map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-3 gap-4 px-6 py-4"
              style={{
                background: i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              <span className="text-sm" style={{ color: '#F5F6F8' }}>{row.feature}</span>
              <div className="flex justify-center">
                {row.kw ? (
                  <div className="flex items-center gap-1">
                    <Check size={18} color="#00A9E0" />
                    {row.other === 'limited' && <span className="text-xs" style={{ color: '#00A9E0' }}>Unlimited</span>}
                    {row.other === 'extra' && <span className="text-xs" style={{ color: '#00A9E0' }}>Included</span>}
                  </div>
                ) : (
                  <X size={18} color="#A8D0E6" opacity={0.5} />
                )}
              </div>
              <div className="flex justify-center">
                {row.other === true ? (
                  <Check size={18} color="#A8D0E6" opacity={0.5} />
                ) : row.other === 'limited' ? (
                  <span className="text-xs" style={{ color: '#A8D0E6' }}>Limited</span>
                ) : row.other === 'extra' ? (
                  <span className="text-xs" style={{ color: '#A8D0E6' }}>Extra cost</span>
                ) : (
                  <X size={18} color="#A8D0E6" opacity={0.5} />
                )}
              </div>
            </div>
          ))}

          {/* Cost Row - Highlighted */}
          <div
            className="grid grid-cols-3 gap-4 px-6 py-5"
            style={{ background: 'rgba(0,169,224,0.1)' }}
          >
            <span className="font-semibold text-sm" style={{ color: '#F5F6F8' }}>Monthly Cost</span>
            <div className="text-center">
              <span
                className="inline-block px-3 py-1 text-sm font-bold"
                style={{
                  background: '#00A9E0',
                  color: '#002A54',
                  borderRadius: '100px',
                }}
              >
                $0 Included
              </span>
            </div>
            <span className="text-sm text-center" style={{ color: '#A8D0E6' }}>$200–$1,000+</span>
          </div>
        </div>
      </div>
    </section>
  );
}
