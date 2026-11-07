import { Link } from 'react-router-dom';
import { Icon } from '../components/ui/Icon';
import { Button } from '../components/ui/Button';
import { brandConfig } from '../config/brand';

// SVG pattern as a constant to avoid JSX escaping issues
const patternSvg = "data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E";

const CURRENT_YEAR = new Date().getFullYear();

export function NotFound() {
  const { name } = brandConfig;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero - Full Screen */}
      <section className="flex-1 flex items-center justify-center bg-navy-900 text-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-center" style={{ backgroundImage: `url("${patternSvg}")` }} />
        </div>

        <div className="container relative z-10 text-center animate-fade-in">
          {/* Error Code */}
          <div className="mb-8">
            <span className="text-9xl md:text-[12rem] lg:text-[14rem] font-heading font-bold text-white/10 tracking-tighter leading-none">
              404
            </span>
          </div>

          {/* Message */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4">
            Страницата не е намерена
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-xl mx-auto leading-relaxed">
            Съжаляваме, но страницата, която търсите, не съществува или е преместена.
            Може да е имало грешка в адреса или страницата е изтрита.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button size="lg" variant="primary" asChild className="w-full sm:w-auto min-w-[200px]">
              <Link to="/">Начало</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-white/30 text-white hover:bg-white/10 w-full sm:w-auto min-w-[200px]">
              <Link to="/contact">Свържете се с нас</Link>
            </Button>
          </div>

          {/* Helpful Links */}
          <div className="max-w-md mx-auto">
            <p className="text-slate-400 text-sm mb-4">Може би търсите някоя от основните ни страници:</p>
            <div className="grid sm:grid-cols-2 gap-3 text-left">
              {[
                { href: '/web-solutions', label: 'Уеб решения' },
                { href: '/education-solutions', label: 'Училищни решения' },
                { href: '/networks-it', label: 'Мрежи и ИТ' },
                { href: '/hardware-service', label: 'Хардуерен сервиз' },
                { href: '/portfolio', label: 'Портфолио' },
                { href: '/about', label: 'За нас' },
              ].map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-sm"
                >
                  <Icon name="ArrowRight" size={14} className="text-blue-400" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative floating elements */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-navy-900 to-transparent pointer-events-none" />
      </section>

      {/* Footer */}
      <footer className="bg-navy-950 border-t border-white/10">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <p className="text-slate-500 text-sm">
              © {CURRENT_YEAR} {name}. Всички права запазени.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <Link to="/privacy-policy" className="text-slate-500 hover:text-slate-300 transition-colors">
                Политика за поверителност
              </Link>
              <Link to="/terms" className="text-slate-500 hover:text-slate-300 transition-colors">
                Общи условия
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}