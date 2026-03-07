import { LandingNavbar } from './LandingNavbar';
import { HeroSection } from './HeroSection';
import { FeaturesSection } from './FeaturesSection';
import { HowItWorks } from './HowItWorks';
import { TechMarquee } from './TechMarquee';
import { StatsSection } from './StatsSection';
import { CTASection } from './CTASection';
import { Footer } from './Footer';

export function LandingPage() {
  return (
    <div className="light min-h-screen bg-white text-gray-900 overflow-x-hidden">
      <LandingNavbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorks />
      <TechMarquee />
      <StatsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
