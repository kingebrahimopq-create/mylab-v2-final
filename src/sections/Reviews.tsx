import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const reviews = [
  {
    quote: "Command is definitely the reason we make money. The fortune is in the follow-up, and there's not a chance that any potential prospect or lead could fall through the cracks.",
    name: 'Stacey Sauls',
    title: 'CEO, Charlotte NC',
    stars: 5,
  },
  {
    quote: "I have tested every other CRM's mobile experience and Command knocks everyone else out of the water, hands down. The mobile experience is seamless while working on the go.",
    name: 'Donnie Brookman',
    title: 'Senior LABS Manager',
    stars: 5,
  },
  {
    quote: "We've been able to eliminate lead waste, and that's helped us expand, scale, and duplicate in ways we wouldn't have been able to.",
    name: 'Bobbi Huston',
    title: 'Director of Operations',
    stars: 5,
  },
];

export default function Reviews() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % reviews.length);
    }, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const goTo = (index: number) => {
    setActiveIndex(index);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % reviews.length);
    }, 5000);
  };

  const prev = () => goTo((activeIndex - 1 + reviews.length) % reviews.length);
  const next = () => goTo((activeIndex + 1) % reviews.length);

  return (
    <section
      id="reviews"
      ref={sectionRef}
      className="w-full"
      style={{
        background: 'linear-gradient(180deg, #002A54 0%, #00152A 100%)',
        padding: '100px 24px',
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div ref={headerRef} className="text-center mb-12">
          <span
            className="inline-block px-4 py-1.5 text-xs font-semibold uppercase tracking-widest mb-6"
            style={{
              color: '#00A9E0',
              letterSpacing: '0.08em',
            }}
          >
            Agent Reviews
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
            Trusted by 180,000+ Agents Worldwide
          </h2>
        </div>

        {/* Carousel */}
        <div className="relative">
          <div className="flex items-center justify-center gap-4 overflow-hidden">
            {reviews.map((review, i) => {
              const isActive = i === activeIndex;
              const isPrev = i === (activeIndex - 1 + reviews.length) % reviews.length;
              const isNext = i === (activeIndex + 1) % reviews.length;

              if (!isActive && !isPrev && !isNext) return null;

              return (
                <div
                  key={i}
                  className="flex-shrink-0 transition-all duration-500"
                  style={{
                    maxWidth: isActive ? '520px' : '420px',
                    opacity: isActive ? 1 : 0.6,
                    transform: isActive ? 'scale(1)' : 'scale(0.92)',
                    order: isActive ? 1 : isPrev ? 0 : 2,
                  }}
                >
                  <div
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '20px',
                      padding: '40px',
                    }}
                  >
                    {/* Stars */}
                    <div className="flex gap-1 mb-4">
                      {[...Array(review.stars)].map((_, j) => (
                        <Star key={j} size={18} fill="#00A9E0" color="#00A9E0" />
                      ))}
                    </div>

                    {/* Quote */}
                    <p
                      className="italic"
                      style={{
                        color: '#F5F6F8',
                        fontSize: '18px',
                        lineHeight: 1.6,
                      }}
                    >
                      "{review.quote}"
                    </p>

                    {/* Author */}
                    <div className="mt-6">
                      <p className="font-semibold" style={{ color: '#F5F6F8', fontSize: '16px' }}>
                        {review.name}
                      </p>
                      <p style={{ color: '#A8D0E6', fontSize: '14px' }}>
                        {review.title}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="flex items-center justify-center transition-all duration-300"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#F5F6F8',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#00A9E0';
                e.currentTarget.style.borderColor = '#00A9E0';
                e.currentTarget.style.color = '#002A54';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                e.currentTarget.style.color = '#F5F6F8';
              }}
            >
              <ChevronLeft size={20} />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className="transition-all duration-300"
                  style={{
                    width: i === activeIndex ? '24px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    background: i === activeIndex ? '#00A9E0' : 'rgba(255,255,255,0.3)',
                  }}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="flex items-center justify-center transition-all duration-300"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#F5F6F8',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#00A9E0';
                e.currentTarget.style.borderColor = '#00A9E0';
                e.currentTarget.style.color = '#002A54';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                e.currentTarget.style.color = '#F5F6F8';
              }}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
