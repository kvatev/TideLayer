import { Link } from 'react-router-dom';
import { cn } from '../../utils/helpers';
import { Icon } from '../ui/Icon';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { demoProjects } from '../../data';

export function PortfolioPreview() {
  const featuredProjects = demoProjects.slice(0, 3);

  return (
    <section className="section bg-white" aria-labelledby="portfolio-title">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12 animate-fade-in">
          <div>
            <h2 id="portfolio-title" className="text-4xl md:text-5xl font-heading font-bold text-navy-900 mb-2">
              Избрани проекти
            </h2>
            <p className="text-lg text-slate-600">
              Демонстрационни примери, илюстриращи нашите възможности в различните области.
            </p>
          </div>
          <Link
            to="/portfolio"
            className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 transition-colors mt-4 md:mt-0"
          >
            Всички проекти
            <Icon name="ArrowRight" size={18} />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProjects.map((project, index) => (
            <Link key={project.id} to="/portfolio" className="group">
              <Card variant="elevated" padding="lg" hover className="h-full flex flex-col">
                <div className="relative aspect-video bg-slate-100 rounded-xl mb-5 overflow-hidden group-hover:opacity-90 transition-opacity">
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                    <Icon name="Image" size={48} />
                  </div>
                  {project.isDemo && (
                    <Badge variant="accent" className="absolute top-3 left-3">
                      {project.demoLabel || 'Демонстрационен проект'}
                    </Badge>
                  )}
                </div>
                <Badge variant="secondary" size="sm" className="mb-3">
                  {project.category}
                </Badge>
                <h3 className="text-xl font-heading font-bold text-navy-900 mb-2 group-hover:text-blue-600 transition-colors">
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
                  {project.tags.length > 4 && (
                    <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-500 rounded">
                      +{project.tags.length - 4}
                    </span>
                  )}
                </div>
                <div className="inline-flex items-center gap-1.5 text-blue-600 font-medium group-hover:gap-2 transition-all">
                  <span>Вижте проекта</span>
                  <Icon name="ArrowRight" size={14} />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}