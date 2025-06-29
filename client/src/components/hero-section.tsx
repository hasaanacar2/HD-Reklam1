export default function HeroSection() {
  return (
    <section id="anasayfa" className="relative bg-gradient-to-r from-primary to-blue-700 text-white py-20 lg:py-32">
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <div 
        className="absolute inset-0" 
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      ></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            Profesyonel Tabela ve<br />
            <span className="text-accent">Reklam Çözümleri</span>
          </h1>
          <p className="text-xl lg:text-2xl mb-8 text-gray-200 max-w-3xl mx-auto">
            HD Reklam olarak, işletmenizin görünürlüğünü artıracak yüksek kaliteli tabela ve reklam ürünleri sunuyoruz.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="#ai-tabela" 
              className="bg-accent hover:bg-yellow-500 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 hover:transform hover:scale-105 inline-flex items-center justify-center"
            >
              <i className="fas fa-robot mr-2"></i>
              AI Tabela Dene
            </a>
            <a 
              href="https://wa.me/905551234567?text=Merhaba%20HD%20Reklam,%20tabela%20hizmetleriniz%20hakkında%20bilgi%20almak%20istiyorum." 
              className="bg-transparent border-2 border-white hover:bg-white hover:text-primary text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 inline-flex items-center justify-center"
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
