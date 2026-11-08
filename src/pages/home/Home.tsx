import { Hero } from '../../components/sections/Hero';
import { Intro } from '../../components/sections/Intro';
import { Divisions } from '../../components/sections/Divisions';
import { EducationShowcase } from '../../components/sections/EducationShowcase';
import { BusinessIT } from '../../components/sections/BusinessIT';
import { WhyChooseUs } from '../../components/sections/WhyChooseUs';
import { Process } from '../../components/sections/Process';
import { PortfolioPreview } from '../../components/sections/PortfolioPreview';
import { FinalCTA } from '../../components/sections/FinalCTA';
import { useSiteControl } from '../../data/siteControl';

export function Home() {
  const siteControl = useSiteControl();
  const hidden = new Set(siteControl.hiddenSections);

  return (
    <>
      <Hero />
      {!hidden.has('intro') && <Intro />}
      {!hidden.has('divisions') && <Divisions />}
      {!hidden.has('educationShowcase') && <EducationShowcase />}
      {!hidden.has('businessIT') && <BusinessIT />}
      {!hidden.has('whyChooseUs') && <WhyChooseUs />}
      {!hidden.has('process') && <Process />}
      {!hidden.has('portfolioPreview') && <PortfolioPreview />}
      {!hidden.has('finalCTA') && <FinalCTA />}
    </>
  );
}
