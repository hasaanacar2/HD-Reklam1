import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  serviceType: string;
  message: string;
}

export default function ContactSection() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    serviceType: "",
    message: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const submitContactForm = useMutation({
    mutationFn: async (data: ContactFormData) => {
      return await apiRequest("POST", "/api/contact", data);
    },
    onSuccess: () => {
      toast({
        title: "Başarılı!",
        description: "Talebiniz alındı. En kısa sürede size dönüş yapacağız.",
      });
      setFormData({
        name: "",
        email: "",
        phone: "",
        serviceType: "",
        message: ""
      });
      queryClient.invalidateQueries({ queryKey: ["/api/contact"] });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Form gönderilirken bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.serviceType || !formData.message) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen tüm alanları doldurun.",
        variant: "destructive",
      });
      return;
    }
    submitContactForm.mutate(formData);
  };

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <section id="iletisim" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">İletişime Geçin</h2>
          <p className="text-xl text-secondary max-w-3xl mx-auto">
            Projeniz için ücretsiz keşif ve teklif almak için bizimle iletişime geçin.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="flex items-start">
              <div className="bg-primary text-white w-12 h-12 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Adresimiz</h3>
                <p className="text-secondary">Ermenek Mah. Şehit Ali Daniyar Cd. HD Reklam Muratpaşa/ANTALYA</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-primary text-white w-12 h-12 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                <i className="fas fa-phone"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Telefon</h3>
                <p className="text-secondary">05325518051</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-primary text-white w-12 h-12 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                <i className="fas fa-envelope"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">E-posta</h3>
                <p className="text-secondary">hdreklam@gmail.com</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-primary text-white w-12 h-12 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                <i className="fas fa-clock"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Çalışma Saatleri</h3>
                <p className="text-secondary">Pazartesi - Cumartesi: 08:00 - 18:00</p>
                <p className="text-secondary">Pazar: 10:00 - 16:00</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-success to-green-600 rounded-xl p-6 text-white">
              <h3 className="text-xl font-semibold mb-3">Hızlı İletişim</h3>
              <p className="mb-4">WhatsApp üzerinden anında iletişime geçin!</p>
              <a 
                href="https://wa.me/905325518051?text=Merhaba%20HD%20Reklam,%20tabela%20hizmetleriniz%20hakkında%20bilgi%20almak%20istiyorum." 
                className="bg-white text-success hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center"
              >
                <i className="fab fa-whatsapp mr-2"></i>
                WhatsApp ile İletişim
              </a>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Teklif Talep Formu</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Ad Soyad</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Adınız ve soyadınız"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="Telefon numaranız"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="E-posta adresiniz"
                />
              </div>

              <div>
                <Label htmlFor="serviceType">Hizmet Türü</Label>
                <Select value={formData.serviceType} onValueChange={(value) => handleInputChange("serviceType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Hizmet türü seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="led">Işıklı Tabela</SelectItem>
                    <SelectItem value="digital">Dijital Baskı</SelectItem>
                    <SelectItem value="facade">Cephe Giydirme</SelectItem>
                    <SelectItem value="vehicle">Araç Giydirme</SelectItem>
                    <SelectItem value="directional">Yönlendirme Tabelası</SelectItem>
                    <SelectItem value="other">Diğer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="message">Proje Detayları</Label>
                <Textarea
                  id="message"
                  rows={4}
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  placeholder="Projeniz hakkında detaylı bilgi verin..."
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-blue-700 text-white py-4 text-lg font-semibold"
                disabled={submitContactForm.isPending}
              >
                <i className="fas fa-paper-plane mr-2"></i>
                {submitContactForm.isPending ? "Gönderiliyor..." : "Teklif Talep Et"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
