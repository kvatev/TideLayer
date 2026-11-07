import { cn } from '../../utils/helpers';
import { Icon } from '../ui/Icon';
import { brandConfig } from '../../config/brand';

export function Intro() {
  return (
    <section className="section bg-white" aria-labelledby="intro-title">
      <div className="container">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <h2 id="intro-title" className="text-4xl md:text-5xl font-heading font-bold text-navy-900 mb-6">
            Технологични решения, изградени около реалните нужди
          </h2>
          <div className="prose prose-slate max-w-none text-lg leading-relaxed space-y-6">
            <p>
              TideLayer Technologies обединява три ключови технологични способности под една кръчка: уеб разработка, специализиран софтуер за образованието и мрежова ИТ инфраструктура.
              Този комбиниран подход ни позволява да разбираме бизнеса на клиентите си отвсякъде — от клиентоориентирания уебсайт, през вътрешните бизнес процеси, до хардуерната и мрежова основа, която ги поддържа.
            </p>
            <p>
              Работим с малки и средни предприятия, хотели, автосервизи, строителни фирми и образователни институции в Бургас и цяла България.
              Ние не просто доставяме технологии — ние изграждаме дългосрочни партньорства, базиращи се на разбиране, прозрачност и практически резултати.
            </p>
            <p className="font-medium text-navy-900">
              Един партньор за различни технологични потребности.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}