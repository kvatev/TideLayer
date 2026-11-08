import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Link } from 'react-router-dom';
import { demoProjects } from '../../data';
import { PageHero } from '../../components/ui/PageHero';

type Project = typeof demoProjects[0];

export function Portfolio() {
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState('Всички');

  const handleImgError = (id: string) => {
    setImgErrors((prev) => ({ ...prev, [id]: true }));
  };

  const categories = ['Всички', 'Уеб решения', 'Уеб приложения'];

  const filtered = activeCategory === 'Всички'
    ? demoProjects
    : demoProjects.filter((p) => p.category === activeCategory);

  // First two "Уеб решения" go side-by-side; rest in the standard grid
  const webSolutions = filtered.filter((p) => p.category === 'Уеб решения');
  const firstTwoWeb = webSolutions.slice(0, 2);
  const otherProjects = filtered.filter(
    (p) => !(p.category === 'Уеб решения' && firstTwoWeb.includes(p))
  );

  const renderProject = (project: Project, index: number) => (
    <Card
      key={project.id}
      variant="elevated"
      padding="none"
      hover
      className="animate-slide-up overflow-hidden flex flex-col"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Screenshot / Preview */}
      <div className="relative aspect-video bg-slate-100 overflow-hidden">
        {!imgErrors[project.id] && project.image ? (
          <img
            src={project.image}
            alt={`Преглед на ${project.title}`}
            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
            onError={() => handleImgError(project.id)}
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400">
            <Icon name="Globe" size={40} />
            <span className="text-xs">{project.url ?? ''}</span>
          </div>
        )}
        {/* Category overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-3">
          <span className="text-xs font-medium text-slate-300">{project.category}</span>
        </div>
      </div>

      {/* Card body */}
      <div className="p-6 flex flex-col flex-1">
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {project.tags.slice(0, 4).map((tag) => (
            <Badge key={tag} variant="outline" size="sm">{tag}</Badge>
          ))}
          {project.tags.length > 4 && (
            <Badge variant="outline" size="sm">+{project.tags.length - 4}</Badge>
          )}
        </div>

        <h3 className="text-xl font-heading font-bold text-navy-900 mb-2 leading-snug">
          {project.title}
        </h3>

        <p className="text-slate-600 mb-5 leading-relaxed line-clamp-3 flex-1 text-sm">
          {project.description}
        </p>

        {/* Actions */}
        <div className="flex gap-3 mt-auto">
          {project.url && (
            <Button
              variant="primary"
              size="sm"
              asChild
              className="flex-1 flex items-center justify-center gap-2"
            >
              <a href={project.url} target="_blank" rel="noopener noreferrer">
                <Icon name="ExternalLink" size={15} />
                Отвори сайта
              </a>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div>
      {/* Hero */}
      <PageHero theme="portfolio" ariaLabelledby="portfolio-title">
        <div className="container">
          <div className="max-w-3xl animate-fade-in">
            <Badge variant="primary" size="md" className="mb-4">
              Портфолио
            </Badge>
            <h1 id="portfolio-title" className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 leading-tight">
              Реализирани проекти
            </h1>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl leading-relaxed">
              Уебсайтове и уеб приложения, създадени от нас — реални проекти, работещи в момента онлайн.
            </p>
          </div>
        </div>
      </PageHero>

      {/* Filter + Grid */}
      <section className="section bg-white" aria-label="Портфолио проекти">
        <div className="container">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-3 justify-center mb-12 animate-fade-in" role="tablist">
            {categories.map((cat) => (
              <button
                key={cat}
                role="tab"
                aria-selected={activeCategory === cat}
                onClick={() => setActiveCategory(cat)}
                className={
                  'px-5 py-2.5 rounded-full text-sm font-medium transition-all ' +
                  (activeCategory === cat
                    ? 'bg-navy-900 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200')
                }
              >
                {cat}
              </button>
            ))}
          </div>

          {/* First two Уеб решения side-by-side */}
          {firstTwoWeb.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
              {firstTwoWeb.map((project, idx) => renderProject(project, idx))}
            </div>
          )}

          {/* Rest of projects */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {otherProjects.map((project, idx) => renderProject(project, idx + firstTwoWeb.length))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-navy-900 text-white" aria-labelledby="portfolio-cta">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center animate-fade-in">
            <h2 id="portfolio-cta" className="text-4xl md:text-5xl font-heading font-bold mb-4">
              Имате ли проект, който искате да реализираме заедно?
            </h2>
            <p className="text-slate-300 mb-8">
              Всеки проект е уникален. Ще се радваме да чуем за идеята ви и да ви предложим подходящото решение.
            </p>
            <Button size="lg" variant="primary" asChild className="w-full sm:w-auto">
              <Link to="/contact">Започнете проект</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
