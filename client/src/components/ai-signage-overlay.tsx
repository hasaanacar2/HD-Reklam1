import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function AISignageOverlay() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [imageAnalysis, setImageAnalysis] = useState<string | null>(null);
  const [signageText, setSignageText] = useState("İŞLETME ADI");
  const [signageType, setSignageType] = useState("led");
  const [signageStyle, setSignageStyle] = useState("modern");
  const [signageColors, setSignageColors] = useState("professional");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const generateSignageMutation = useMutation({
    mutationFn: async (data: {
      text: string;
      type: string;
      style: string;
      colors: string;
      building_description: string;
    }) => {
      return await apiRequest("POST", "/api/ai-signage/generate", data);
    },
    onSuccess: (data: any) => {
      setProcessedImage(data.data.url);
      toast({
        title: "Başarılı!",
        description: "AI tabela tasarımı oluşturuldu.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Tabela tasarımı oluşturulurken hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const analyzeImageMutation = useMutation({
    mutationFn: async (imageData: string) => {
      return await apiRequest("POST", "/api/ai-signage/analyze", { image: imageData });
    },
    onSuccess: (data: any) => {
      setImageAnalysis(data.analysis);
      toast({
        title: "Analiz Tamamlandı",
        description: "Görsel analizi başarıyla yapıldı.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Görsel analizi yapılırken hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setUploadedImage(imageData);
        setProcessedImage(null);
        setImageAnalysis(null);
        
        // Automatically analyze the uploaded image
        analyzeImageMutation.mutate(imageData);
      };
      reader.readAsDataURL(file);
    } else {
      toast({
        title: "Geçersiz dosya",
        description: "Lütfen geçerli bir resim dosyası seçin.",
        variant: "destructive",
      });
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setUploadedImage(imageData);
        setProcessedImage(null);
        setImageAnalysis(null);
        
        // Automatically analyze the uploaded image
        analyzeImageMutation.mutate(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const processImage = async () => {
    if (!uploadedImage) return;

    const buildingDescription = imageAnalysis || "commercial building facade";
    
    generateSignageMutation.mutate({
      text: signageText,
      type: signageType,
      style: signageStyle,
      colors: signageColors,
      building_description: buildingDescription
    });
  };

  const reset = () => {
    setUploadedImage(null);
    setProcessedImage(null);
    setImageAnalysis(null);
    setSignageText("İŞLETME ADI");
    setSignageType("led");
    setSignageStyle("modern");
    setSignageColors("professional");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const shareToWhatsApp = () => {
    const typeText = signageType === 'led' ? 'LED' : 
                     signageType === 'neon' ? 'Neon' : 
                     signageType === 'lightbox' ? 'Işıklı Kutu Harf' : 'Dijital Baskı';
    const message = encodeURIComponent(`Merhaba HD Reklam, ${signageText} işletmem için ${typeText} tabela yapmak istiyorum. AI tasarımını yaptırdım ve beğendim.`);
    window.open(`https://wa.me/905551234567?text=${message}`, '_blank');
  };

  const downloadImage = () => {
    if (processedImage) {
      const link = document.createElement('a');
      link.href = processedImage;
      link.download = 'hd-reklam-tabela-simulasyon.png';
      link.click();
    }
  };

  return (
    <section id="ai-tabela" className="py-20 bg-gradient-to-br from-slate-100 to-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">AI Tabela Simülatörü</h2>
          <p className="text-xl text-secondary max-w-3xl mx-auto">
            OpenAI yapay zeka teknolojisi ile işletmenizin fotoğrafını analiz edip, profesyonel tabela tasarımları oluşturun.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Fotoğrafınızı Yükleyin</h3>
              
              {!uploadedImage ? (
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary transition-colors cursor-pointer bg-gray-50"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"></i>
                  <p className="text-lg text-gray-600 mb-2">Fotoğrafınızı buraya sürükleyin</p>
                  <p className="text-sm text-gray-500 mb-4">veya tıklayarak dosya seçin</p>
                  <Button className="bg-primary hover:bg-blue-700">
                    Dosya Seç
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <img 
                    src={uploadedImage} 
                    alt="Önizleme" 
                    className="w-full rounded-xl shadow-lg"
                  />
                  <div className="flex gap-3">
                    <Button 
                      onClick={processImage}
                      disabled={generateSignageMutation.isPending}
                      className="bg-accent hover:bg-yellow-500 flex-1"
                    >
                      <i className="fas fa-magic mr-2"></i>
                      {generateSignageMutation.isPending ? "AI Tasarım Oluşturuluyor..." : "AI Tabela Tasarımı Oluştur"}
                    </Button>
                    <Button 
                      onClick={reset}
                      variant="secondary"
                    >
                      <i className="fas fa-redo mr-2"></i>
                      Sıfırla
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Tabela Ayarları</h3>
              
              <div className="space-y-6">
                <div>
                  <Label htmlFor="signageText">Tabela Metni</Label>
                  <Input
                    id="signageText"
                    value={signageText}
                    onChange={(e) => setSignageText(e.target.value)}
                    placeholder="Tabela metninizi girin"
                  />
                </div>
                
                <div>
                  <Label htmlFor="signageType">Tabela Tipi</Label>
                  <Select value={signageType} onValueChange={setSignageType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tabela tipi seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="led">LED Tabela</SelectItem>
                      <SelectItem value="neon">Neon Tabela</SelectItem>
                      <SelectItem value="lightbox">Işıklı Kutu Harf</SelectItem>
                      <SelectItem value="digital">Dijital Baskı</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="signageStyle">Tasarım Stili</Label>
                  <Select value={signageStyle} onValueChange={setSignageStyle}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tasarım stili seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="modern">Modern</SelectItem>
                      <SelectItem value="classic">Klasik</SelectItem>
                      <SelectItem value="minimalist">Minimalist</SelectItem>
                      <SelectItem value="bold">Cesur/Dikkat Çekici</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="signageColors">Renk Paleti</Label>
                  <Select value={signageColors} onValueChange={setSignageColors}>
                    <SelectTrigger>
                      <SelectValue placeholder="Renk paleti seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Profesyonel (Mavi/Beyaz)</SelectItem>
                      <SelectItem value="warm">Sıcak Renkler (Kırmızı/Turuncu)</SelectItem>
                      <SelectItem value="cool">Soğuk Renkler (Mavi/Yeşil)</SelectItem>
                      <SelectItem value="bold">Canlı Renkler</SelectItem>
                      <SelectItem value="monochrome">Siyah/Beyaz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Image Analysis */}
              {imageAnalysis && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">AI Görsel Analizi</h4>
                  <p className="text-gray-700 text-sm">{imageAnalysis}</p>
                </div>
              )}

              {generateSignageMutation.isPending && (
                <div className="mt-6 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-gray-600">AI tabela tasarımı oluşturuluyor...</p>
                </div>
              )}

              {analyzeImageMutation.isPending && (
                <div className="mt-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-2"></div>
                  <p className="text-gray-600 text-sm">Görsel analiz ediliyor...</p>
                </div>
              )}

              {processedImage && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Sonuç</h4>
                  <img 
                    src={processedImage} 
                    alt="Sonuç" 
                    className="w-full rounded-xl shadow-lg mb-4"
                  />
                  <div className="flex gap-3">
                    <Button 
                      onClick={shareToWhatsApp}
                      className="bg-success hover:bg-green-600 flex-1"
                    >
                      <i className="fab fa-whatsapp mr-2"></i>
                      WhatsApp Gönder
                    </Button>
                    <Button 
                      onClick={downloadImage}
                      className="bg-primary hover:bg-blue-700"
                    >
                      <i className="fas fa-download mr-2"></i>
                      İndir
                    </Button>
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
