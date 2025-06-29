export default function WhatsAppButton() {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <a 
        href="https://wa.me/905551234567?text=Merhaba%20HD%20Reklam,%20tabela%20hizmetleriniz%20hakkında%20bilgi%20almak%20istiyorum." 
        className="bg-success hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center group"
        target="_blank"
        rel="noopener noreferrer"
      >
        <i className="fab fa-whatsapp text-2xl"></i>
        <span className="ml-2 hidden group-hover:inline-block text-sm font-medium whitespace-nowrap">WhatsApp</span>
      </a>
    </div>
  );
}
