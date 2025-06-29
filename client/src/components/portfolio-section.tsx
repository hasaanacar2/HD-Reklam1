export default function PortfolioSection() {
  const portfolioItems = [
    {
      image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      title: "Restaurant LED Tabelası",
      type: "Işıklı Kutu Harf"
    },
    {
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      title: "AVM Dijital Tabela",
      type: "Dijital Baskı"
    },
    {
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      title: "Ofis Binası Cephe",
      type: "Cephe Giydirme"
    },
    {
      image: "https://images.unsplash.com/photo-1543346263-2a1e8b2e8e2a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      title: "Araç Giydirme",
      type: "Tam Araç Folyo"
    },
    {
      image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      title: "Mağaza Neon Tabela",
      type: "Neon Işıklı"
    },
    {
      image: "https://images.unsplash.com/photo-1586882829491-b81178aa622e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      title: "Hastane Yönlendirme",
      type: "Yönlendirme Sistemi"
    }
  ];

  return (
    <section id="galeri" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Projelerimiz</h2>
          <p className="text-xl text-secondary max-w-3xl mx-auto">
            Tamamladığımız projelere göz atın ve kalitemizi görün.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {portfolioItems.map((item, index) => (
            <div key={index} className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <img 
                src={item.image} 
                alt={item.title}
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="text-sm text-gray-200">{item.type}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <a 
            href="https://wa.me/905551234567?text=Merhaba%20HD%20Reklam,%20portföyünüzdeki%20projeler%20hakkında%20detaylı%20bilgi%20almak%20istiyorum." 
            className="bg-primary hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors inline-flex items-center"
          >
            <i className="fab fa-whatsapp mr-2"></i>
            Detaylı Portföy İçin İletişime Geçin
          </a>
        </div>
      </div>
    </section>
  );
}
