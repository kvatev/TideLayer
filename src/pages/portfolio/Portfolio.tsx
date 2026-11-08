import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { useSiteControl } from '../../data/siteControl';
import type { Project } from '../../types';
import { PageHero } from '../../components/ui/PageHero';

export function Portfolio() {
  const siteControl = useSiteControl();
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState('Всички');

  const hiddenSet = new Set(siteControl.hiddenProjectIds);
  const visibleProjects = siteControl.projects.filter((p) => !hiddenSet.has(p.id));

  const categories = ['Всички', ...Array.from(new Set(visibleProjects.map((p) => p.category)))];
  const currentCategory = categories.includes(activeCategory) ? activeCategory : 'Всички';

  const handleImgError = (id: string) => {
    setImgErrors((prev) => ({ ...prev, [id]: true }));
  };

  const filtered = currentCategory === 'Всички'
    ? visibleProjects
    : visibleProjects.filter((p) => p.category === currentCategory);

  // First two "Уеб решения" go side-by-side when viewing all or that category; rest in standard grid
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
      className="animate-slide-up overflow-hidden flex flex-col min-w-0 group"
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
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400 p-4 text-center">
            <Icon name="Globe" size={40} />
            <span className="text-xs break-all">{project.url ?? ''}</span>
          </div>
        )}
        {/* Category overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-3">
          <span className="text-xs font-medium text-slate-200">{project.category}</span>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4 sm:p-6 flex flex-col flex-1 min-w-0">
        <h3 className="text-lg sm:text-xl font-heading font-bold text-navy-900 mb-2 leading-snug">
          {project.title}
        </h3>

        <p className="text-slate-600 mb-5 leading-relaxed line-clamp-3 flex-1 text-sm">
          {project.description}
        </p>

        {/* Actions */}
        {project.url && (
          <div className="flex gap-3 mt-auto">
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
          </div>
        )}
      </div>
    </Card>
  );

  return (
    <div>
      {/* Hero */}
      <PageHero theme="portfolio" ariaLabelledby="portfolio-title">
        <div className="container">
          <div className="max-w-3xl animate-fade-in">
            <h1 id="portfolio-title" className="text-2xl min-[375px]:text-3xl sm:text-5xl lg:text-6xl font-heading font-bold mb-4 leading-tight">
              Реализирани проекти
            </h1>
            <p className="text-base sm:text-lg text-slate-300 mb-8 max-w-2xl leading-relaxed">
              Уебсайтове и уеб приложения, създадени от нас — реални проекти, работещи в момента онлайн.
            </p>
          </div>
        </div>
      </PageHero>

      {/* Filter + Grid */}
      <section className="section bg-white" aria-label="Портфолио проекти">
        <div className="container">
          {visibleProjects.length === 0 ? (
            <div className="max-w-xl mx-auto text-center py-12 px-6 bg-slate-50 rounded-2xl border border-slate-200">
              <Icon name="FolderOpen" size={44} className="text-slate-400 mx-auto mb-3" />
              <h2 className="text-xl font-heading font-bold text-navy-900 mb-2">В момента няма публикувани проекти</h2>
              <p className="text-sm text-slate-600 mb-6">
                Свържете се с нас, за да ви изпратим актуални примери и референции за подобни проекти.
              </p>
              <Button asChild>
                <Link to="/contact">Свържете се с нас</Link>
              </Button>
            </div>
          ) : (
            <>
              {/* Category Filter */}
              {categories.length > 1 && (
                <div className="flex flex-wrap gap-2.5 sm:gap-3 justify-center mb-10 sm:mb-12 animate-fade-in" role="tablist">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      role="tab"
                      aria-selected={currentCategory === cat}
                      onClick={() => setActiveCategory(cat)}
                      className={
                        'px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all ' +
                        (currentCategory === cat
                          ? 'bg-navy-900 text-white shadow-lg'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200')
                      }
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              {/* First two Уеб решения side-by-side */}
              {firstTwoWeb.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
                  {firstTwoWeb.map((project, idx) => renderProject(project, idx))}
                </div>
              )}

              {/* Rest of projects */}
              {otherProjects.length > 0 && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {otherProjects.map((project, idx) => renderProject(project, idx + firstTwoWeb.length))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-navy-900 text-white" aria-labelledby="portfolio-cta">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center animate-fade-in">
            <h2 id="portfolio-cta" className="text-2xl min-[375px]:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white mb-4">
              Имате ли проект, който искате да реализираме заедно?
            </h2>
            <p className="text-slate-300 mb-8 text-sm sm:text-base">
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
