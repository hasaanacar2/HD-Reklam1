export default function ServicesSection() {
  const services = [
    {
      icon: "fas fa-store",
      title: "Işıklı Tabela",
      description: "LED ve neon teknolojisi ile gece gündüz görünür, enerji tasarruflu ışıklı tabela çözümleri.",
      features: ["LED Tabela", "Neon Tabela", "Işıklı Kutu Harf"]
    },
    {
      icon: "fas fa-paint-brush",
      title: "Dijital Baskı",
      description: "Yüksek çözünürlüklü dijital baskı teknolojisi ile canlı renkler ve net görüntü kalitesi.",
      features: ["Vinil Baskı", "Forex Baskı", "Akrilik Baskı"]
    },
    {
      icon: "fas fa-building",
      title: "Web Sitesi Hizmetleri",
      description: "İşletmenize özel profesyonel web sitesi tasarımı ve geliştirme hizmetleri.",
      features: ["Özel Web Tasarımı", "SEO Optimizasyonu", "Mobil Uyumlu Siteler"]
    },
    {
      icon: "fas fa-map-signs",
      title: "Yönlendirme Tabelası",
      description: "İç ve dış mekan yönlendirme sistemleri ile müşterilerinizi doğru yönlendirin.",
      features: ["İç Mekan Tabelası", "Dış Mekan Tabelası", "Dijital Yönlendirme"]
    },
    {
      icon: "fas fa-hotel",
      title: "Proje Bazlı Otel Tabela İşleri",
      description: "Oteller için özel tasarlanmış tabela ve yönlendirme sistemleri ile misafir deneyimini artırın.",
      features: ["Özel Tasarım Tabelalar", "Yönlendirme Sistemleri", "Dış Mekan Çözümleri"]
    },
    {
      icon: "fas fa-tools",
      title: "Montaj ve Bakım",
      description: "Profesyonel montaj ekibimiz ve 7/24 bakım hizmetiyle tabelalarınız her zaman aktif.",
      features: ["Profesyonel Montaj", "Periyodik Bakım", "Acil Onarım"]
    }
  ];

  return (
    <section id="hizmetler" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Hizmetlerimiz</h2>
          <p className="text-xl text-secondary max-w-3xl mx-auto">
            Modern teknoloji ve deneyimli ekibimizle her türlü tabela ve reklam ihtiyacınıza çözüm sunuyoruz.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-8 hover:shadow-lg transition-shadow duration-300">
              <div className="bg-primary text-white w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                <i className={`${service.icon} text-2xl`}></i>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">{service.title}</h3>
              <p className="text-secondary mb-6">{service.description}</p>
              <ul className="text-sm text-secondary space-y-2">
                {service.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <i className="fas fa-check text-success mr-2"></i>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
