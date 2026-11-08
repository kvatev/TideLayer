import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useSiteControl } from '../../data/siteControl';

export function PortfolioPreview() {
  const siteControl = useSiteControl();
  const hiddenIds = new Set(siteControl.hiddenProjectIds);
  const featuredProjects = siteControl.projects
    .filter((p) => !hiddenIds.has(p.id))
    .slice(0, 3);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  if (featuredProjects.length === 0) return null;

  const handleImgError = (id: string) => {
    setImgErrors((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <section className="section bg-white" aria-labelledby="portfolio-preview-title">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10 sm:mb-12 animate-fade-in">
          <div className="min-w-0">
            <h2 id="portfolio-preview-title" className="text-2xl min-[375px]:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-navy-900 mb-2">
              Реализирани проекти
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              Уебсайтове и приложения, създадени от нас — работещи в момента онлайн.
            </p>
          </div>
          <Link
            to="/portfolio"
            className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 transition-colors mt-2 md:mt-0 whitespace-nowrap self-start md:self-auto"
          >
            Всички проекти
            <Icon name="ArrowRight" size={18} />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {featuredProjects.map((project) => (
            <a
              key={project.id}
              href={project.url ?? '/portfolio'}
              target={project.url ? '_blank' : undefined}
              rel={project.url ? 'noopener noreferrer' : undefined}
              className="group min-w-0"
            >
              <Card variant="elevated" padding="lg" hover className="h-full flex flex-col">
                <div className="relative aspect-video bg-slate-100 rounded-xl mb-5 overflow-hidden group-hover:opacity-90 transition-opacity">
                  {!imgErrors[project.id] && project.image ? (
                    <img
                      src={project.image}
                      alt={`Преглед на ${project.title}`}
                      className="w-full h-full object-cover object-top"
                      onError={() => handleImgError(project.id)}
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400">
                      <Icon name="Globe" size={40} />
                    </div>
                  )}
                </div>

                <Badge variant="secondary" size="sm" className="mb-3 self-start">
                  {project.category}
                </Badge>
                <h3 className="text-lg sm:text-xl font-heading font-bold text-navy-900 mb-2 group-hover:text-blue-600 transition-colors leading-snug">
                  {project.title}
                </h3>
                <p className="text-slate-600 text-sm mb-4 flex-1 leading-relaxed">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.tags.slice(0, 4).map((tag) => (
                    <span key={tag} className="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="inline-flex items-center gap-1.5 text-blue-600 font-medium group-hover:gap-2 transition-all">
                  <span>Отвори сайта</span>
                  <Icon name="ExternalLink" size={14} />
                </div>
              </Card>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
