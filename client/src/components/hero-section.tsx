export default function HeroSection() {
  return (
    <section id="anasayfa" className="relative bg-white text-gray-900 py-20 lg:py-32">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mb-8">
            <h1 className="text-6xl lg:text-8xl font-bold mb-4 brand-font bg-gradient-to-t from-red-900 via-red-600 to-red-400 bg-clip-text text-transparent">
              HD Reklam
            </h1>
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold mb-6 text-gray-800 heading-font">
            Profesyonel Tabela ve<br />
            <span className="text-red-600">Reklam Çözümleri</span>
          </h2>
          <p className="text-xl lg:text-2xl mb-8 text-gray-700 max-w-3xl mx-auto">
            HD Reklam olarak, işletmenizin görünürlüğünü artıracak yüksek kaliteli tabela ve reklam ürünleri sunuyoruz.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="#ai-tabela" 
              className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 hover:transform hover:scale-105 inline-flex items-center justify-center shadow-lg"
            >
              <i className="fas fa-robot mr-2"></i>
              AI Tabela Dene
            </a>
            <a 
              href="https://wa.me/905551234567?text=Merhaba%20HD%20Reklam,%20tabela%20hizmetleriniz%20hakkında%20bilgi%20almak%20istiyorum." 
              className="bg-transparent border-2 border-red-600 hover:bg-red-600 hover:text-white text-red-600 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 inline-flex items-center justify-center shadow-lg"
            >
              <i className="fab fa-whatsapp mr-2"></i>
              WhatsApp İletişim
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
