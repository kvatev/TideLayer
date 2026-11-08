import { Link } from 'react-router-dom';
import { Icon } from '../../components/ui/Icon';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { networksItServices, faqs } from '../../data';
import { PageHero } from '../../components/ui/PageHero';

const service = networksItServices.find(s => s.id === 'servers-nas');

export function ServersNas() {
  if (!service) return null;

  return (
    <div>
      {/* Hero */}
      <PageHero theme="servers" ariaLabelledby="sn-title">
        <div className="container">
          <div className="max-w-3xl animate-fade-in">
            <Badge variant="primary" size="md" className="mb-4">
              03. Мрежи и ИТ инфраструктура / Сървъри, NAS и Backup
            </Badge>
            <h1 id="sn-title" className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 leading-tight">
              {service.title}
            </h1>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl leading-relaxed">
              {service.description}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link to="/contact?service=servers-nas">Обсудете backup стратегия</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-white/30 text-white hover:bg-white/10">
                <Link to="/networks-it">Назад към услугите</Link>
              </Button>
            </div>
          </div>
        </div>
      </PageHero>

      {/* Features */}
      <section className="section bg-white" aria-labelledby="sn-features">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in">
            <h2 id="sn-features" className="text-4xl md:text-5xl font-heading font-bold text-navy-900 mb-4">
              Какво включва услугата
            </h2>
            <p className="text-lg text-slate-600">
              От хардуер до disaster recovery — пълно покритие на данните ви.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {service.features.map((feature, index) => (
              <Card key={feature} variant="elevated" padding="lg" hover className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <h3 className="text-xl font-heading font-bold text-navy-900 mb-3">
                  {feature}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Детайли за {feature.toLowerCase()} ще бъдат добавени при финализиране на офертата.
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section bg-slate-50" aria-labelledby="sn-benefits">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-video bg-slate-100 rounded-2xl overflow-hidden animate-scale-in shadow-lg">
              <img
                src="/images/sections/servers.webp"
                alt="Сървърно помещение и NAS системи"
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="animate-fade-in">
              <h2 id="sn-benefits" className="text-3xl md:text-4xl font-heading font-bold text-navy-900 mb-6">
                Защо да ни повярвате критичните данни
              </h2>
              <ul className="space-y-4">
                {service.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Icon name="ArrowRight" size={16} className="text-blue-600" />
                    </div>
                    <p className="text-slate-600 leading-relaxed">{benefit}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Virtualization Platforms */}
      <section className="section bg-white" aria-labelledby="sn-virt">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in">
            <h2 id="sn-virt" className="text-4xl md:text-5xl font-heading font-bold text-navy-900 mb-4">
              Платформи за виртуализация
            </h2>
            <p className="text-lg text-slate-600">
              Работим с водещите хипервизори и управляваме среди от всякакъв мащаб.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: 'Cpu', title: 'Proxmox VE', desc: 'Open-source, KVM + LXC, HA, Ceph integration' },
              { icon: 'Server', title: 'VMware vSphere', desc: 'Enterprise-grade, vCenter, DRS, HA, vSAN' },
              { icon: 'Monitor', title: 'Microsoft Hyper-V', desc: 'Windows Server integration, Shielded VMs, nested virtualization' },
            ].map((item, index) => (
              <Card key={item.title} variant="outlined" padding="lg" className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex-shrink-0 w-12 h-12 mb-4 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Icon name={item.icon} size={24} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-heading font-bold text-navy-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* NAS & Storage */}
      <section className="section bg-slate-50" aria-labelledby="sn-nas">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in">
            <h2 id="sn-nas" className="text-4xl md:text-5xl font-heading font-bold text-navy-900 mb-4">
              Хранилища и NAS решения
            </h2>
            <p className="text-lg text-slate-600">
              Надежно съхранение с възможност за мащабиране и висока достъпност.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: 'Database', title: 'TrueNAS (ZFS)', desc: 'OpenZFS, snapshots, replication, SMB/NFS/iSCSI, plugins' },
              { icon: 'HardDrive', title: 'Synology / QNAP', desc: 'User-friendly DSM/QTS, App Center, Active Backup, Virtualization Station' },
              { icon: 'Cloud', title: 'Облачни / Хибридни', desc: 'S3-compatible, Wasabi, Backblaze B2, Azure Blob, AWS S3 tiering' },
            ].map((item, index) => (
              <Card key={item.title} variant="elevated" padding="lg" className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex-shrink-0 w-12 h-12 mb-4 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Icon name={item.icon} size={24} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-heading font-bold text-navy-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Backup & DR */}
      <section className="section bg-white" aria-labelledby="sn-backup">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in">
            <h2 id="sn-backup" className="text-4xl md:text-5xl font-heading font-bold text-navy-900 mb-4">
              Backup и Disaster Recovery
            </h2>
            <p className="text-lg text-slate-600">
              3-2-1 стратегия, автоматизирани тестове за възстановяване, RPO/RTO съответствие.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              'Veeam Backup & Replication',
              'BorgBackup / Restic / Rclone',
              'Облачен backup (Immutable storage)',
              'Автоматизирани тестове за restore',
              'DR планове и runbook-и',
              'Мониторинг и аларми за неуспехи'
            ].map((item, index) => (
              <Card key={item} variant="outlined" padding="lg" className="text-center animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex-shrink-0 w-12 h-12 mx-auto mb-4 rounded-full bg-green-50 flex items-center justify-center">
                  <Icon name="Shield" size={24} className="text-green-600" />
                </div>
                <h3 className="text-lg font-heading font-bold text-navy-900">{item}</h3>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section bg-slate-50" aria-labelledby="sn-faq">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-in">
            <h2 id="sn-faq" className="text-4xl md:text-5xl font-heading font-bold text-navy-900 mb-4">
              Често задавани въпроси
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.filter(f => ['networks-emergency'].includes(f.id)).map((faq, index) => (
              <details key={faq.id} className="group animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <summary className="flex items-center justify-between p-5 bg-white rounded-xl cursor-pointer list-none transition-colors border border-slate-200">
                  <h3 className="text-lg font-semibold text-navy-900 pr-8">{faq.question}</h3>
                  <Icon name="ChevronDown" size={20} className="text-slate-400 group-open:rotate-180 transition-transform duration-200" />
                </summary>
                <div className="p-5 pt-0 text-slate-600 leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-navy-900 text-white" aria-labelledby="sn-cta">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center animate-fade-in">
            <h2 id="sn-cta" className="text-4xl md:text-5xl font-heading font-bold mb-4">
              Искате ли да гарантирате сигурността на данните си?
            </h2>
            <p className="text-slate-300 mb-8">
              Ще проектираме backup стратегия, отговаряща на RPO/RTO изискванията ви, и ще внедрим автоматизиран процес с редовни тестове.
            </p>
            <Button size="lg" variant="primary" asChild className="w-full sm:w-auto">
              <Link to="/contact?service=servers-nas">Обсудете backup стратегия</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}