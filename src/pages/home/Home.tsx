import { Hero } from '../../components/sections/Hero';
import { Intro } from '../../components/sections/Intro';
import { Divisions } from '../../components/sections/Divisions';
import { EducationShowcase } from '../../components/sections/EducationShowcase';
import { BusinessIT } from '../../components/sections/BusinessIT';
import { WhyChooseUs } from '../../components/sections/WhyChooseUs';
import { Process } from '../../components/sections/Process';
import { PortfolioPreview } from '../../components/sections/PortfolioPreview';
import { FinalCTA } from '../../components/sections/FinalCTA';

export function Home() {
  return (
    <>
      <Hero />
      <Intro />
      <Divisions />
      <EducationShowcase />
      <BusinessIT />
      <WhyChooseUs />
      <Process />
      <PortfolioPreview />
      <FinalCTA />
    </>
  );
}