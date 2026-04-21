import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import Metrics from '@/components/Metrics';
import Experience from '@/components/Experience';
import Education from '@/components/Education';
import Skills from '@/components/Skills';
import About from '@/components/About';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Metrics />
        <Experience />
        <Education />
        <Skills />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
