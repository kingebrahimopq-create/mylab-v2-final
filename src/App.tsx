import { Routes, Route } from 'react-router';
import Navigation from './sections/Navigation';
import Hero from './sections/Hero';
import Features from './sections/Features';
import MirrorReflection from './sections/MirrorReflection';
import Ecosystem from './sections/Ecosystem';
import Comparison from './sections/Comparison';
import Reviews from './sections/Reviews';
import Footer from './sections/Footer';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

function Home() {
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

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
