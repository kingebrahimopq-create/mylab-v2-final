import Navigation from './sections/Navigation';
import Hero from './sections/Hero';
import Features from './sections/Features';
import MirrorReflection from './sections/MirrorReflection';
import Ecosystem from './sections/Ecosystem';
import Comparison from './sections/Comparison';
import Reviews from './sections/Reviews';
import Footer from './sections/Footer';

export default function App() {
  return (
    <div className="min-h-screen" style={{ background: '#002A54' }}>
      <Navigation />
      <Hero />
      <Features />
      <MirrorReflection />
      <Ecosystem />
      <Comparison />
      <Reviews />
      <Footer />
    </div>
  );
}
