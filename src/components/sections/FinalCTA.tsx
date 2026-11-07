import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';

export function FinalCTA() {
  return (
    <section className="section bg-navy-900 text-white" aria-labelledby="cta-title">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center animate-fade-in">
          <h2 id="cta-title" className="text-4xl md:text-5xl font-heading font-bold mb-4">
            Нека обсъдим следващия ви технологичен проект
          </h2>
          <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Имате ли идея за уебсайт, нужда от софтуер за училището си или трябва да надградите ИТ инфраструктурата?
            Ще се усмирим, ще разберем нуждите ви и ще предложим конкретно решение.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" variant="primary" asChild className="w-full sm:w-auto">
              <Link to="/contact">Свържете се с нас</Link>
            </Button>
            <Button size="lg" variant="secondary" asChild className="w-full sm:w-auto bg-white/10 text-white border-white/20 hover:bg-white/20">
              <Link to="/portfolio">Вижте проектите ни</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}