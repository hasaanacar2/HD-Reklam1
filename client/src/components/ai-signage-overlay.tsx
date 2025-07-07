import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { generateAdvancedSignagePrompt, validatePromptData, turkishToEnglish } from "@/lib/prompt-generator";

export default function AISignageOverlay() {
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [signageText, setSignageText] = useState("İŞLETME ADI");
  const [signageType, setSignageType] = useState("led");
  const [signageStyle, setSignageStyle] = useState("modern");
  const [signageColors, setSignageColors] = useState("professional");
  const { toast } = useToast();

  const generateSignageMutation = useMutation({
    mutationFn: async (data: {
      text: string;
      type: string;
      style: string;
      colors: string;
      prompt?: string;
    }) => {
      const response = await apiRequest("POST", "/api/ai-signage/generate", {
        text: data.text,
        type: data.type,
        style: data.style,
        colors: data.colors,
        building_description: "modern Turkish commercial building facade",
        prompt: data.prompt
      });
      return await response.json();
    },
    onSuccess: (data: any) => {
      if (data.success && data.data && data.data.url) {
        setGeneratedImage(data.data.url);
        toast({
          title: "Başarılı!",
          description: "AI tabela tasarımı oluşturuldu.",
        });
      }
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Tabela tasarımı oluşturulurken hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const generateSignage = () => {
    // Form verilerini validate et
    const validation = validatePromptData({
      text: signageText,
      type: signageType,
      style: signageStyle,
      colors: signageColors
    });

    if (!validation.isValid) {
      toast({
        title: "Hata",
        description: validation.errors.join(', '),
        variant: "destructive",
      });
      return;
    }

    // Gelişmiş İngilizce prompt oluştur
    const englishPrompt = generateAdvancedSignagePrompt({
      text: signageText,
      type: signageType,
      style: signageStyle,
      colors: signageColors,
      building_description: "modern Turkish commercial building facade"
    });

    // Türkçe karakterleri düzeltilmiş işletme adını göster
    const cleanBusinessName = turkishToEnglish(signageText);
    
    console.log("Original text:", signageText);
    console.log("Cleaned text:", cleanBusinessName);
    console.log("Generated prompt:", englishPrompt);
    
    generateSignageMutation.mutate({
      text: cleanBusinessName,
      type: signageType,
      style: signageStyle,
      colors: signageColors,
      prompt: englishPrompt
    } as any);
  };

  const shareToWhatsApp = () => {
    // Türkçe karakterleri düzeltilmiş işletme adını kullan
    const cleanBusinessName = turkishToEnglish(signageText);
    
    const typeText = signageType === 'led' ? 'LED' : 
                     signageType === 'neon' ? 'Neon' : 
                     signageType === 'lightbox' ? 'Işıklı Kutu Harf' : 'Dijital Baskı';
    
    const styleText = signageStyle === 'modern' ? 'Modern' :
                      signageStyle === 'classic' ? 'Klasik' :
                      signageStyle === 'minimalist' ? 'Minimalist' : 'Cesur';
    
    const message = encodeURIComponent(
      `Merhaba HD Reklam, "${cleanBusinessName}" işletmem için ${typeText} tabela yapmak istiyorum. ` +
      `${styleText} tasarım stilinde AI tasarımını yaptırdım ve beğendim. ` +
      `Detaylı bilgi alabilir miyim?`
    );
    
    window.open(`https://wa.me/905551234567?text=${message}`, '_blank');
  };

  const downloadImage = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = 'hd-reklam-ai-tabela-tasarim.png';
      link.click();
    }
  };

  const reset = () => {
    setGeneratedImage(null);
    setSignageText("İŞLETME ADI");
    setSignageType("led");
    setSignageStyle("modern");
    setSignageColors("professional");
  };

  return (
    <section id="ai-tabela" className="py-20 bg-gradient-to-br from-slate-100 to-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">🤖 AI Tabela Tasarımcısı</h2>
          <p className="text-xl text-secondary max-w-3xl mx-auto">
            Ücretsiz Hugging Face AI teknolojisi ile işletmeniz için profesyonel tabela tasarımları oluşturun.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            
            {/* Tabela Ayarları */}
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Tabela Ayarları</h3>
              
              <div className="space-y-6">
                <div>
                  <Label htmlFor="signageText">Tabela Metni</Label>
                  <Input
                    id="signageText"
                    value={signageText}
                    onChange={(e) => setSignageText(e.target.value)}
                    placeholder="İşletmenizin adını girin"
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label htmlFor="signageType">Tabela Tipi</Label>
                  <Select value={signageType} onValueChange={setSignageType}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Tabela tipi seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="led">💡 LED Tabela</SelectItem>
                      <SelectItem value="neon">🌈 Neon Tabela</SelectItem>
                      <SelectItem value="lightbox">📦 Işıklı Kutu Harf</SelectItem>
                      <SelectItem value="digital">🖨️ Dijital Baskı</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="signageStyle">Tasarım Stili</Label>
                  <Select value={signageStyle} onValueChange={setSignageStyle}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Tasarım stili seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="modern">🔥 Modern</SelectItem>
                      <SelectItem value="classic">⭐ Klasik</SelectItem>
                      <SelectItem value="minimalist">✨ Minimalist</SelectItem>
                      <SelectItem value="bold">💥 Cesur/Dikkat Çekici</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="signageColors">Renk Paleti</Label>
                  <Select value={signageColors} onValueChange={setSignageColors}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Renk paleti seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">🔵 Profesyonel (Mavi/Beyaz)</SelectItem>
                      <SelectItem value="warm">🔴 Sıcak Renkler (Kırmızı/Turuncu)</SelectItem>
                      <SelectItem value="cool">🟢 Soğuk Renkler (Mavi/Yeşil)</SelectItem>
                      <SelectItem value="bold">🌈 Canlı Renkler</SelectItem>
                      <SelectItem value="monochrome">⚫ Siyah/Beyaz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4">
                  <Button 
                    onClick={generateSignage}
                    disabled={generateSignageMutation.isPending}
                    className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg"
                  >
                    {generateSignageMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        AI Tasarım Oluşturuluyor...
                      </>
                    ) : (
                      <>
                        🎨 AI Tabela Tasarımı Oluştur
                      </>
                    )}
                  </Button>
                </div>

                {generateSignageMutation.isPending && (
                  <div className="text-center text-sm text-gray-600">
                    ⏱️ Yapay zeka tasarım oluşturuyor... (5-10 saniye)
                  </div>
                )}
              </div>
            </div>

            {/* Sonuç Alanı */}
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">AI Tabela Tasarımı</h3>
              
              {!generatedImage && !generateSignageMutation.isPending && (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
                  <div className="text-6xl mb-4">🎨</div>
                  <p className="text-gray-600 text-lg">
                    Sol taraftan tabela ayarlarını yapın ve<br />
                    "AI Tabela Tasarımı Oluştur" butonuna basın
                  </p>
                </div>
              )}

              {generateSignageMutation.isPending && (
                <div className="border-2 border-dashed border-blue-300 rounded-xl p-12 text-center bg-blue-50">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-blue-700 text-lg font-medium">
                    🤖 Hugging Face AI tabela tasarımınızı oluşturuyor...
                  </p>
                  <p className="text-blue-600 text-sm mt-2">
                    Bu işlem 5-10 saniye sürebilir
                  </p>
                </div>
              )}

              {generatedImage && (
                <div>
                  <img 
                    src={generatedImage} 
                    alt="AI Tabela Tasarımı" 
                    className="w-full rounded-xl shadow-lg mb-6"
                  />
                  <div className="grid grid-cols-1 gap-3">
                    <Button 
                      onClick={shareToWhatsApp}
                      className="bg-success hover:bg-green-600 text-white font-bold py-3"
                    >
                      📱 WhatsApp'tan Sipariş Ver
                    </Button>
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        onClick={downloadImage}
                        className="bg-secondary hover:bg-gray-600 text-white"
                      >
                        💾 İndir
                      </Button>
                      <Button 
                        onClick={reset}
                        variant="outline"
                        className="border-gray-300"
                      >
                        🔄 Yeniden Başlat
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}