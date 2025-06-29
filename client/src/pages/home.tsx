import HeroSection from "@/components/hero-section";
import ServicesSection from "@/components/services-section";
import AISignageOverlay from "@/components/ai-signage-overlay";
import PortfolioSection from "@/components/portfolio-section";
import ContactSection from "@/components/contact-section";
import WhatsAppButton from "@/components/whatsapp-button";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-primary">HD Reklam</h1>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="#anasayfa" className="text-secondary hover:text-primary px-3 py-2 text-sm font-medium transition-colors">Ana Sayfa</a>
                <a href="#hizmetler" className="text-secondary hover:text-primary px-3 py-2 text-sm font-medium transition-colors">Hizmetler</a>
                <a href="#ai-tabela" className="text-secondary hover:text-primary px-3 py-2 text-sm font-medium transition-colors">AI Tabela</a>
                <a href="#galeri" className="text-secondary hover:text-primary px-3 py-2 text-sm font-medium transition-colors">Galeri</a>
                <a href="#iletisim" className="text-secondary hover:text-primary px-3 py-2 text-sm font-medium transition-colors">İletişim</a>
              </div>
            </div>
            <div className="md:hidden">
              <button className="text-secondary hover:text-primary">
                <i className="fas fa-bars text-xl"></i>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <HeroSection />
      <ServicesSection />
      <AISignageOverlay />
      <PortfolioSection />
      
      {/* Why Choose Us Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Neden HD Reklam?</h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              15 yıllık deneyimimiz ve modern teknolojimizle sektörde öncüyüz.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-white bg-opacity-20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-award text-3xl text-accent"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">15 Yıl Deneyim</h3>
              <p className="text-blue-100">Sektörde 15 yıllık tecrübemizle binlerce projeyi başarıyla tamamladık.</p>
            </div>

            <div className="text-center">
              <div className="bg-white bg-opacity-20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-tools text-3xl text-accent"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">Modern Teknoloji</h3>
              <p className="text-blue-100">Son teknoloji makineler ve yöntemlerle en kaliteli ürünleri üretiyoruz.</p>
            </div>

            <div className="text-center">
              <div className="bg-white bg-opacity-20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-clock text-3xl text-accent"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">Hızlı Teslimat</h3>
              <p className="text-blue-100">Projelerinizi zamanında teslim etme konusunda %100 başarı oranımız var.</p>
            </div>

            <div className="text-center">
              <div className="bg-white bg-opacity-20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-headset text-3xl text-accent"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">7/24 Destek</h3>
              <p className="text-blue-100">Montaj sonrası 7/24 teknik destek ve bakım hizmeti sunuyoruz.</p>
            </div>
          </div>
        </div>
      </section>

      <ContactSection />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">HD Reklam</h3>
              <p className="text-gray-300 mb-4">
                Profesyonel tabela ve reklam çözümleri ile işletmenizin görünürlüğünü artırıyoruz.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <i className="fab fa-facebook-f text-xl"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <i className="fab fa-instagram text-xl"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <i className="fab fa-linkedin text-xl"></i>
                </a>
                <a href="https://wa.me/905551234567" className="text-gray-400 hover:text-white transition-colors">
                  <i className="fab fa-whatsapp text-xl"></i>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white mb-6">Hizmetlerimiz</h4>
              <ul className="space-y-3 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Işıklı Tabela</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Dijital Baskı</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cephe Giydirme</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Araç Giydirme</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Yönlendirme Tabelası</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white mb-6">Kurumsal</h4>
              <ul className="space-y-3 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Hakkımızda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Referanslar</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Kalite Belgelerimiz</a></li>
                <li><a href="#" className="hover:text-white transition-colors">İş Ortaklığı</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Kariyer</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white mb-6">İletişim</h4>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center">
                  <i className="fas fa-map-marker-alt mr-3 text-primary"></i>
                  İkitelli/İstanbul
                </li>
                <li className="flex items-center">
                  <i className="fas fa-phone mr-3 text-primary"></i>
                  +90 555 123 45 67
                </li>
                <li className="flex items-center">
                  <i className="fas fa-envelope mr-3 text-primary"></i>
                  info@hdreklam.com
                </li>
                <li className="flex items-center">
                  <i className="fab fa-whatsapp mr-3 text-success"></i>
                  WhatsApp Destek
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 HD Reklam. Tüm hakları saklıdır. | 
              <a href="#" className="hover:text-white transition-colors ml-2">Gizlilik Politikası</a> | 
              <a href="#" className="hover:text-white transition-colors ml-2">Kullanım Şartları</a>
            </p>
          </div>
        </div>
      </footer>

      <WhatsAppButton />
    </div>
  );
}
