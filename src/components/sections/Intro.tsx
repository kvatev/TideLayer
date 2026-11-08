export function Intro() {
  return (
    <section className="section bg-white" aria-labelledby="intro-title">
      <div className="container">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <h2 id="intro-title" className="text-2xl min-[375px]:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-navy-900 mb-6">
            Технологични решения, изградени около реалните нужди
          </h2>
          <div className="prose prose-slate max-w-none text-base sm:text-lg leading-relaxed space-y-5">
            <p>
              TideLayer обединява три ключови технологични направления под един покрив: уеб разработка, специализиран софтуер за образованието и мрежова ИТ инфраструктура.
              Този комбиниран подход ни позволява да разбираме бизнеса на клиентите си цялостно — от уеб присъствието, през вътрешните процеси, до хардуерната и мрежова основа.
            </p>
            <p>
              Работим с малки и средни предприятия, хотели, автосервизи, строителни фирми и образователни институции в Бургас и цяла България.
              Изграждаме дългосрочни партньорства, базирани на разбиране, прозрачност и практически резултати.
            </p>
            <p className="font-medium text-navy-900 mb-0">
              Един партньор за различни технологични потребности.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
