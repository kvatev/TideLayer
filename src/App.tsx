import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { Home } from './pages/home/Home';
import { Admin } from './pages/admin/Admin';

// Import page components
import { WebSolutions } from './pages/web-solutions/WebSolutions';
import { WebsiteDevelopment } from './pages/web-solutions/WebsiteDevelopment';
import { WebApplications } from './pages/web-solutions/WebApplications';
import { WebsiteMaintenance } from './pages/web-solutions/WebsiteMaintenance';
import { EducationSolutions } from './pages/education-solutions/EducationSolutions';
import { DutyScheduler } from './pages/education-solutions/DutyScheduler';
import { SchoolTicketing } from './pages/education-solutions/SchoolTicketing';
import { SchoolInventory } from './pages/education-solutions/SchoolInventory';
import { SchoolItSupport } from './pages/education-solutions/SchoolItSupport';
import { NetworksIt } from './pages/networks-it/NetworksIt';
import { NetworkInstallation } from './pages/networks-it/NetworkInstallation';
import { WifiLan } from './pages/networks-it/WifiLan';
import { ServersNas } from './pages/networks-it/ServersNas';
import { MonthlySupport } from './pages/networks-it/MonthlySupport';
import { HardwareService } from './pages/hardware-service/HardwareService';
import { Portfolio } from './pages/portfolio/Portfolio';
import { About } from './pages/about/About';
import { Contact } from './pages/contact/Contact';
import { PrivacyPolicy } from './pages/legal/PrivacyPolicy';
import { Terms } from './pages/legal/Terms';
import { NotFound } from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin panel — standalone layout (no header/footer) */}
        <Route path="admin" element={<Admin />} />

        {/* Public site */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          
          {/* Web Solutions */}
          <Route path="web-solutions" element={<WebSolutions />} />
          <Route path="web-solutions/website-development" element={<WebsiteDevelopment />} />
          <Route path="web-solutions/web-applications" element={<WebApplications />} />
          <Route path="web-solutions/website-maintenance" element={<WebsiteMaintenance />} />
          
          {/* Education Solutions */}
          <Route path="education-solutions" element={<EducationSolutions />} />
          <Route path="education-solutions/duty-scheduler" element={<DutyScheduler />} />
          <Route path="education-solutions/school-ticketing" element={<SchoolTicketing />} />
          <Route path="education-solutions/school-inventory" element={<SchoolInventory />} />
          <Route path="education-solutions/school-it-support" element={<SchoolItSupport />} />
          
          {/* Networks & IT */}
          <Route path="networks-it" element={<NetworksIt />} />
          <Route path="networks-it/network-installation" element={<NetworkInstallation />} />
          <Route path="networks-it/wifi-lan" element={<WifiLan />} />
          <Route path="networks-it/servers-nas" element={<ServersNas />} />
          <Route path="networks-it/monthly-support" element={<MonthlySupport />} />
          
          {/* Hardware Service */}
          <Route path="hardware-service" element={<HardwareService />} />
          
          {/* Other pages */}
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          <Route path="terms" element={<Terms />} />
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;