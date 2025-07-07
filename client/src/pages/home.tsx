import { useState } from "react";
import HeroSection from "@/components/hero-section";
import ServicesSection from "@/components/services-section";
import AISignageOverlay from "@/components/ai-signage-overlay";
import PortfolioSection from "@/components/portfolio-section";
import ContactSection from "@/components/contact-section";
import WhatsAppButton from "@/components/whatsapp-button";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white text-gray-900 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center space-x-3">
                <img 
                  src="/logo.jpeg" 
                  alt="HD Reklam Logo" 
                  className="h-12 w-auto"
                />
                <h1 className="text-3xl font-bold gradient-text brand-font">HD Reklam</h1>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="#anasayfa" className="text-gray-900 hover:text-accent px-3 py-2 text-sm font-medium transition-colors">Ana Sayfa</a>
                <a href="#hizmetler" className="text-gray-900 hover:text-accent px-3 py-2 text-sm font-medium transition-colors">Hizmetler</a>
                <a href="#ai-tabela" className="text-gray-900 hover:text-accent px-3 py-2 text-sm font-medium transition-colors">AI Tabela</a>
                <a href="#galeri" className="text-gray-900 hover:text-accent px-3 py-2 text-sm font-medium transition-colors">Galeri</a>
                <a href="#iletisim" className="text-gray-900 hover:text-accent px-3 py-2 text-sm font-medium transition-colors">İletişim</a>
              </div>
            </div>
            <div className="md:hidden">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-black border-2 border-gray-700 hover:bg-gray-900 transition-colors"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a 
                href="#anasayfa" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-gray-900 hover:text-accent hover:bg-gray-50 rounded-md transition-colors"
              >
                Ana Sayfa
              </a>
              <a 
                href="#hizmetler" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-gray-900 hover:text-accent hover:bg-gray-50 rounded-md transition-colors"
              >
                Hizmetler
              </a>
              <a 
                href="#ai-tabela" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-gray-900 hover:text-accent hover:bg-gray-50 rounded-md transition-colors"
              >
                AI Tabela
              </a>
              <a 
                href="#galeri" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-gray-900 hover:text-accent hover:bg-gray-50 rounded-md transition-colors"
              >
                Galeri
              </a>
              <a 
                href="#iletisim" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-gray-900 hover:text-accent hover:bg-gray-50 rounded-md transition-colors"
              >
                İletişim
              </a>
            </div>
          </div>
        )}
      </nav>

      <HeroSection />
      <ServicesSection />
      <AISignageOverlay />
      <PortfolioSection />

      {/* Why Choose Us Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-red-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Neden HD Reklam?</h2>
            <p className="text-xl text-red-100 max-w-3xl mx-auto">
              15 yıllık deneyimimiz ve modern teknolojimizle sektörde öncüyüz.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-white bg-opacity-20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-award text-3xl text-accent"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">15 Yıl Deneyim</h3>
              <p className="text-red-100">Sektörde 15 yıllık tecrübemizle binlerce projeyi başarıyla tamamladık.</p>
            </div>

            <div className="text-center">
              <div className="bg-white bg-opacity-20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-tools text-3xl text-accent"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">Modern Teknoloji</h3>
              <p className="text-red-100">Son teknoloji makineler ve yöntemlerle en kaliteli ürünleri üretiyoruz.</p>
            </div>

            <div className="text-center">
              <div className="bg-white bg-opacity-20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-clock text-3xl text-accent"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">Hızlı Teslimat</h3>
              <p className="text-red-100">Projelerinizi zamanında teslim etme konusunda %100 başarı oranımız var.</p>
            </div>

            <div className="text-center">
              <div className="bg-white bg-opacity-20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-headset text-3xl text-accent"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">7/24 Destek</h3>
              <p className="text-red-100">Montaj sonrası 7/24 teknik destek ve bakım hizmesi sunuyoruz.</p>
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
              <div className="flex items-center space-x-3 mb-6">
                <img 
                  src="/logo.jpeg" 
                  alt="HD Reklam Logo" 
                  className="h-10 w-auto"
                />
                <h3 className="text-2xl font-bold text-white brand-font">HD Reklam</h3>
              </div>
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
                <a href="https://wa.me/905325518051" className="text-gray-400 hover:text-white transition-colors">
                  <i className="fab fa-whatsapp text-xl"></i>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white mb-6">Hizmetlerimiz</h4>
              <ul className="space-y-3 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Işıklı Tabela</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Dijital Baskı</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Web Sitesi Hizmetleri</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Yönlendirme Tabelası</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Proje Bazlı Otel Tabela İşleri</a></li>
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
                  Ermenek Mah. Şehit Ali Daniyar Cd. HD Reklam Muratpaşa/ANTALYA
                </li>
                <li className="flex items-center">
                  <i className="fas fa-phone mr-3 text-primary"></i>
                  05325518051
                </li>
                <li className="flex items-center">
                  <i className="fas fa-envelope mr-3 text-primary"></i>
                  hdreklam@gmail.com
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
