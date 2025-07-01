
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { generateAdvancedSignagePrompt, validatePromptData, turkishToEnglish } from "@/lib/prompt-generator";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Loader2 } from "lucide-react";

export default function AISignageOverlay() {
  const [signageText, setSignageText] = useState("");
  const [signageType, setSignageType] = useState("led");
  const [signageStyle, setSignageStyle] = useState("modern");
  const [signageColors, setSignageColors] = useState("professional");
  const [customDescription, setCustomDescription] = useState("");
  const [hasLogo, setHasLogo] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    phone: "",
    website: "",
    instagram: "",
    facebook: ""
  });
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [isAnalyzingReference, setIsAnalyzingReference] = useState(false);
  const [activeTab, setActiveTab] = useState("form");
  const [lastGenerationParams, setLastGenerationParams] = useState<any>(null);
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

    // Son parametreleri kaydet
    const currentParams = {
      text: signageText,
      type: signageType,
      style: signageStyle,
      colors: signageColors,
      customDescription: customDescription.trim() || undefined,
      hasLogo: hasLogo,
      contactInfo: {
        phone: contactInfo.phone.trim() || undefined,
        website: contactInfo.website.trim() || undefined,
        instagram: contactInfo.instagram.trim() || undefined,
        facebook: contactInfo.facebook.trim() || undefined
      }
    };
    setLastGenerationParams(currentParams);

    // Gelişmiş İngilizce prompt oluştur
    const englishPrompt = generateAdvancedSignagePrompt(currentParams);

    // Türkçe karakterleri düzeltilmiş işletme adını göster
    const cleanBusinessName = turkishToEnglish(signageText);

    console.log("Original text:", signageText);
    console.log("Cleaned text:", cleanBusinessName);
    console.log("Generated prompt (full):", englishPrompt);
    console.log("Prompt length:", englishPrompt.length, "characters");

    generateSignageMutation.mutate({
      text: cleanBusinessName,
      type: signageType,
      style: signageStyle,
      colors: signageColors,
      prompt: englishPrompt
    } as any);
  };

  const regenerateSignage = () => {
    if (lastGenerationParams) {
      // Son parametrelerle otomatik olarak yeniden üret
      const englishPrompt = generateAdvancedSignagePrompt(lastGenerationParams);
      const cleanBusinessName = turkishToEnglish(lastGenerationParams.text);

      generateSignageMutation.mutate({
        text: cleanBusinessName,
        type: lastGenerationParams.type,
        style: lastGenerationParams.style,
        colors: lastGenerationParams.colors,
        prompt: englishPrompt
      } as any);
    }
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
    setCustomDescription("");
    setHasLogo(false);
    setContactInfo({
      phone: "",
      website: "",
      instagram: "",
      facebook: ""
    });
    setReferenceImage(null);
    setLastGenerationParams(null);
  };

  const handleReferenceImageUpload = (event: any) => {
    const file = event.target.files[0];

    if (file) {
      setIsAnalyzingReference(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImage(reader.result as string);
        setIsAnalyzingReference(false);
        toast({
          title: "Başarılı",
          description: "Referans görsel başarıyla yüklendi.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const generateFromReference = () => {
    if (!signageText.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen şirket adını girin.",
        variant: "destructive",
      });
      return;
    }

    if (!referenceImage) {
      toast({
        title: "Hata",
        description: "Lütfen referans görsel yükleyin.",
        variant: "destructive",
      });
      return;
    }

    // Referans görselden detaylı benzerlik prompt'u oluştur
    const cleanBusinessName = turkishToEnglish(signageText);
    const referencePrompt = `Create a professional commercial signage design that closely matches the style and appearance of the provided reference image. Business name should display: "${cleanBusinessName}". Replicate the same lighting conditions, color scheme, typography style, background elements, mounting position, material textures, dimensional effects, shadows, reflections, viewing angle, and overall composition from the reference. Match all design elements, proportions, and visual characteristics while only changing the business name text. High similarity to reference image required - copy the visual style exactly but with new business name.`;

    console.log("Reference-based generation for:", cleanBusinessName);
    console.log("Reference prompt:", referencePrompt);

    // Son parametreleri kaydet (referans mod için)
    setLastGenerationParams({
      text: signageText,
      type: "reference",
      style: "reference",
      colors: "reference",
      referenceMode: true
    });

    generateSignageMutation.mutate({
      text: cleanBusinessName,
      type: "led", // Default type for API
      style: "modern", // Default style for API
      colors: "professional", // Default colors for API
      prompt: referencePrompt
    } as any);
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

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="form">📝 Form Doldur</TabsTrigger>
                  <TabsTrigger value="reference">🖼️ Örnek Yükle</TabsTrigger>
                </TabsList>

                <TabsContent value="form" className="space-y-6 mt-6">
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

                  {/* Özel Tasarım Açıklaması */}
                  <div className="space-y-2">
                    <Label htmlFor="custom-description">Özel Tasarım Açıklaması (İsteğe Bağlı)</Label>
                    <Textarea
                      id="custom-description"
                      placeholder="Özel isteklerinizi buraya yazabilirsiniz... (örn: vintage görünüm, metalik efekt)"
                      value={customDescription}
                      onChange={(e) => setCustomDescription(e.target.value)}
                      maxLength={200}
                      className="min-h-[80px]"
                    />
                    <p className="text-sm text-muted-foreground">
                      {customDescription.length}/200 karakter
                    </p>
                  </div>

                  {/* Logo Seçeneği */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="has-logo"
                      checked={hasLogo}
                      onCheckedChange={setHasLogo}
                    />
                    <Label htmlFor="has-logo">Firma logosu için yer bırak</Label>
                  </div>

                  {/* İletişim Bilgileri */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">İletişim Bilgileri (İsteğe Bağlı)</Label>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="phone" className="text-sm">Telefon</Label>
                        <Input
                          id="phone"
                          placeholder="0555 123 45 67"
                          value={contactInfo.phone}
                          onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="website" className="text-sm">Website</Label>
                        <Input
                          id="website"
                          placeholder="www.sirket.com"
                          value={contactInfo.website}
                          onChange={(e) => setContactInfo(prev => ({ ...prev, website: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="instagram" className="text-sm">Instagram</Label>
                        <Input
                          id="instagram"
                          placeholder="@sirketadi"
                          value={contactInfo.instagram}
                          onChange={(e) => setContactInfo(prev => ({ ...prev, instagram: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="facebook" className="text-sm">Facebook</Label>
                        <Input
                          id="facebook"
                          placeholder="Şirket Sayfası"
                          value={contactInfo.facebook}
                          onChange={(e) => setContactInfo(prev => ({ ...prev, facebook: e.target.value }))}
                        />
                      </div>
                    </div>
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
                </TabsContent>

                <TabsContent value="reference" className="space-y-6 mt-6">
                  <div>
                    <Label htmlFor="company-name-ref">Şirket Adı</Label>
                    <Input
                      id="company-name-ref"
                      value={signageText}
                      onChange={(e) => setSignageText(e.target.value)}
                      placeholder="Şirket adınızı girin"
                      className="mt-2"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-lg font-semibold text-gray-700">
                      🎨 Beğendiğiniz Tabela Örneği
                    </Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleReferenceImageUpload}
                        className="hidden"
                        id="reference-upload"
                      />
                      <label
                        htmlFor="reference-upload"
                        className="cursor-pointer flex flex-col items-center justify-center"
                      >
                        {referenceImage ? (
                          <div className="w-full">
                            <img
                              src={referenceImage}
                              alt="Referans tabela"
                              className="max-h-48 mx-auto rounded-lg mb-3"
                            />
                            <p className="text-sm text-green-600 text-center">
                              ✅ Referans görsel yüklendi
                            </p>
                          </div>
                        ) : (
                          <>
                            <div className="text-4xl mb-3">🖼️</div>
                            <p className="text-gray-600 text-center">
                              Beğendiğiniz bir tabela fotoğrafı yükleyin
                            </p>
                            <p className="text-sm text-gray-500 text-center mt-2">
                              AI bu görseli referans alarak benzer tasarım yapacak
                            </p>
                          </>
                        )}
                      </label>
                    </div>
                    {isAnalyzingReference && (
                      <p className="text-blue-600 text-sm mt-2 text-center">
                        🔍 Görsel yükleniyor...
                      </p>
                    )}
                  </div>

                  <div className="pt-4">
                    <Button 
                      onClick={generateFromReference}
                      disabled={generateSignageMutation.isPending}
                      className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg"
                    >
                      {generateSignageMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Referans Tabela Oluşturuluyor...
                        </>
                      ) : (
                        <>
                          🎨 Referans Tabela Oluştur
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>

              {generateSignageMutation.isPending && (
                <div className="text-center text-sm text-gray-600 mt-4">
                  ⏱️ Yapay zeka tasarım oluşturuyor... (5-10 saniye)
                </div>
              )}
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
                    <div className="grid grid-cols-3 gap-3">
                      <Button 
                        onClick={downloadImage}
                        className="bg-secondary hover:bg-gray-600 text-white"
                      >
                        💾 İndir
                      </Button>
                      <Button 
                        onClick={regenerateSignage}
                        disabled={generateSignageMutation.isPending || !lastGenerationParams}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {generateSignageMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "🔄 Tekrar Deneyin"
                        )}
                      </Button>
                      <Button 
                        onClick={reset}
                        variant="outline"
                        className="border-gray-300"
                      >
                        🗑️ Temizle
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
