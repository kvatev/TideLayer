import { Link } from 'react-router-dom';
import { cn } from '../../utils/helpers';
import { Icon } from '../../components/ui/Icon';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { demoProjects } from '../../data';

export function Portfolio() {
  // Filter out UI mockups for main portfolio, or show all
  const projects = demoProjects;

  const categories = ['Всички', 'Уеб решения', 'Уеб приложения', 'Мрежи и ИТ', 'Училищни решения'];

  return (
    <div>
      {/* Hero */}
      <section className="section-xl bg-navy-900 text-white" aria-labelledby="portfolio-title">
        <div className="container">
          <div className="max-w-3xl animate-fade-in">
            <Badge variant="primary" size="md" className="mb-4">
              Портфолио
            </Badge>
            <h1 id="portfolio-title" className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 leading-tight">
              Избрани проекти и концепции
            </h1>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl leading-relaxed">
              Примери от нашата работа в уеб разработка, уеб приложения, мрежова инфраструктура и училищни софтуерни продукти.
              <strong className="text-amber-300"> Бележка: Някои проекти са демонстрационни/концептуални и са ясно маркирани като такива.</strong>
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="section bg-white" aria-labelledby="portfolio-filter">
        <div className="container">
          <div className="flex flex-wrap gap-3 justify-center mb-12 animate-fade-in" role="tablist">
            {categories.map((cat, index) => (
              <button
                key={cat}
                role="tab"
                aria-selected={index === 0}
                className={cn(
                  'px-5 py-2.5 rounded-full text-sm font-medium transition-all',
                  index === 0
                    ? 'bg-navy-900 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Projects Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <Card key={project.id} variant="elevated" padding="none" hover className="animate-slide-up overflow-hidden" style={{ animationDelay: `${index * 100}ms` }}>
                {/* Project Image Placeholder */}
                <div className="relative aspect-video bg-slate-100 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                    <Icon name="Image" size={48} />
                  </div>
                  {project.isDemo && (
                    <Badge variant="primary" size="sm" className="absolute top-4 left-4">
                      {project.demoLabel}
                    </Badge>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
                    <span className="text-xs font-medium text-slate-300">{project.category}</span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {project.tags.slice(0, 4).map((tag) => (
                      <Badge key={tag} variant="outline" size="sm">{tag}</Badge>
                    ))}
                    {project.tags.length > 4 && (
                      <Badge variant="outline" size="sm">+{project.tags.length - 4}</Badge>
                    )}
                  </div>

                  <h3 className="text-xl font-heading font-bold text-navy-900 mb-3 leading-snug">
                    {project.title}
                  </h3>

                  <p className="text-slate-600 mb-4 leading-relaxed line-clamp-3">
                    {project.description}
                  </p>

                  <Button variant="outline" asChild className="w-full">
                    <Link to={`/portfolio/${project.id}`}>Вижте подробности</Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* No results message (for future filtering) */}
          <div className="hidden text-center py-12" id="no-results">
            <Icon name="SearchX" size={48} className="text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-heading font-bold text-navy-900 mb-2">Няма намерени проекти</h3>
            <p className="text-slate-600">Опитайте с друга категория.</p>
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