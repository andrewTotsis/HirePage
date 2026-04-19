import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Stats from '@/components/Stats';
import WhyHirePage from '@/components/WhyHirePage';
import HowItWorks from '@/components/HowItWorks';
import Examples from '@/components/Examples';
import Pricing from '@/components/Pricing';
import FAQ from '@/components/FAQ';
import FinalCTA from '@/components/FinalCTA';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main id="main">
        <Hero />
        <Stats />
        <WhyHirePage />
        <HowItWorks />
        <Examples />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
