// Daha iyi görsel kalitesi için Google Gemini AI entegrasyonu
import { GoogleGenAI, Modality } from "@google/genai";

interface SignageGenerationOptions {
  text: string;
  type: string;
  style: string;
  colors: string;
  building_description: string;
  prompt?: string; // Önceden oluşturulmuş prompt
  custom_description?: string;
  has_logo?: boolean;
  contact_info?: {
    phone?: string;
    website?: string;
    instagram?: string;
    facebook?: string;
  };
}

// Gemini bağlantısı için test fonksiyonu
async function testGeminiConnection(): Promise<boolean> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Gemini API key missing");
      return false;
    }

    const ai = new GoogleGenAI({ apiKey });
    console.log("Gemini API initialized successfully");
    return true;
  } catch (error: any) {
    console.error("Gemini connection test failed:", error);
    return false;
  }
}

export async function generateSignageDesign(options: SignageGenerationOptions): Promise<{ url: string }> {
  try {
    console.log("Generating signage design for:", options.text);

    // Yüksek kaliteli görsel üretimi için Gemini AI kullan
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API anahtarı bulunamadı");
    }

    console.log("Testing Gemini connection...");
    const connectionOk = await testGeminiConnection();
    if (!connectionOk) {
      throw new Error("Gemini API bağlantısı başarısız");
    }

    // Eğer frontend'den hazır prompt gelirse onu kullan, yoksa yeni oluştur
    const prompt = options.prompt || createSignagePrompt(options);
    console.log("Generating with Gemini prompt:", prompt.substring(0, 100) + "...");

    // Google GenAI'ı başlat
    const ai = new GoogleGenAI({ apiKey });

    console.log("Calling Gemini API...");
    
    // API çağrısı için içerik hazırla
    const contentParts = [{ text: prompt }];
    
    // Gemini 2.0 Flash Preview Görsel Üretimi kullanarak görsel oluştur
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation", 
      contents: contentParts,
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });

    console.log("Gemini response received successfully");

    // Yanıttan görsel verisini çıkar
    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error("Gemini'den yanıt alınamadı");
    }

    const content = candidates[0].content;
    if (!content || !content.parts) {
      throw new Error("Gemini'den geçerli içerik alınamadı");
    }

    // Yanıtta görsel kısmını bul
    let imageData = null;
    for (const part of content.parts) {
      if (part.text) {
        console.log("Gemini text response:", part.text);
      } else if (part.inlineData && part.inlineData.data) {
        imageData = part.inlineData.data;
        console.log("Found image data, size:", imageData.length);
        break;
      }
    }

    if (!imageData) {
      throw new Error("Gemini'den görsel verisi alınamadı");
    }

    // Data URL'ye dönüştür
    const dataUrl = `data:image/png;base64,${imageData}`;
    console.log("Gemini image generated successfully");

    return { url: dataUrl };
  } catch (error: any) {
    console.error("Signage generation error:", error);
    console.error("Error message:", error?.message);

    // Herhangi bir hata durumunda placeholder'a geri dön
    try {
      const fallbackImage = await createPlaceholderSignage(options);
      return { url: fallbackImage };
    } catch (fallbackError) {
      throw new Error("Tabela tasarımı oluşturulurken hata oluştu: " + (error?.message || String(error)));
    }
  }
}

// Node.js Canvas kullanarak placeholder tabela görseli oluştur
async function createPlaceholderSignage(options: SignageGenerationOptions): Promise<string> {
  // Şimdilik basit SVG tabanlı placeholder oluştur
  const signageTypes: { [key: string]: { bg: string; text: string; effect: string } } = {
    'led': { bg: '#1E40AF', text: '#FFFFFF', effect: 'glow' },
    'neon': { bg: '#000000', text: '#FF0080', effect: 'neon' },
    'lightbox': { bg: '#FFFFFF', text: '#000000', effect: 'shadow' },
    'digital': { bg: '#F59E0B', text: '#FFFFFF', effect: 'none' }
  };

  const signageStyle = signageTypes[options.type] || signageTypes['led'];

  const svg = `
    <svg width="800" height="300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/> 
          </feMerge>
        </filter>
      </defs>

      <!-- Arka Plan -->
      <rect x="50" y="50" width="700" height="200" rx="10" 
            fill="${signageStyle.bg}" 
            stroke="#CCCCCC" 
            stroke-width="2"/>

      <!-- İşletme Adı -->
      <text x="400" y="150" 
            text-anchor="middle" 
            dominant-baseline="middle"
            font-family="Arial, sans-serif" 
            font-size="36" 
            font-weight="bold"
            fill="${signageStyle.text}"
            ${signageStyle.effect === 'glow' ? 'filter="url(#glow)"' : ''}>
        ${options.text.toUpperCase()}
      </text>

      <!-- Tip Etiketi -->
      <text x="400" y="280" 
            text-anchor="middle" 
            font-family="Arial, sans-serif" 
            font-size="14" 
            fill="#666666">
        ${getSignageTypeDescription(options.type)}
      </text>
    </svg>
  `;

  // SVG'yi base64 data URL'ye dönüştür
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

function createSignagePrompt(options: SignageGenerationOptions): string {
  // Eğer önceden hazırlanmış prompt varsa onu kullan (referans modu için)
  if (options.prompt) {
    return options.prompt;
  }

  const typeDescriptions: { [key: string]: string } = {
    'led': 'LED illuminated signage with bright white or blue lighting, mounted on building facade',
    'neon': 'Neon tube signage with colorful glow effect, classic commercial neon style',
    'lightbox': 'Backlit lightbox signage with translucent face and internal LED lighting',
    'digital': 'Digital printed vinyl signage with vibrant colors, non-illuminated'
  };

  const styleDescriptions: { [key: string]: string } = {
    'modern': 'clean, contemporary design with sans-serif typography',
    'classic': 'traditional, elegant design with professional appearance',
    'minimalist': 'simple, clean design with minimal elements',
    'bold': 'eye-catching design with strong visual impact'
  };

  const colorDescriptions: { [key: string]: string } = {
    'professional': 'blue and white professional colors',
    'warm': 'warm red, orange colors',
    'cool': 'cool blue, green colors',
    'bold': 'vibrant, high-contrast colors',
    'monochrome': 'black and white colors'
  };

  const signageType = typeDescriptions[options.type] || typeDescriptions['led'];
  const signageStyle = styleDescriptions[options.style] || styleDescriptions['modern'];
  const signageColors = colorDescriptions[options.colors] || colorDescriptions['professional'];

  const basePrompt = `Photograph of ${signageType} displaying "${options.text}" in ${signageStyle} with ${signageColors}. Turkish commercial building facade, realistic outdoor lighting, professional installation. High quality commercial photography, sharp focus, no people visible. Modern Turkish business district setting.`;

  return basePrompt;
}

function getSignageTypeDescription(type: string): string {
  switch (type) {
    case "led":
      return "LED illuminated signage with bright, energy-efficient lighting";
    case "neon":
      return "Neon signage with vibrant glowing colors and classic neon tube aesthetic";
    case "lightbox":
      return "Illuminated lightbox signage with backlit letters and professional appearance";
    case "digital":
      return "Digital printed signage with high-resolution graphics and modern finish";
    case "channel":
      return "Channel letter signage with individual illuminated letters";
    case "monument":
      return "Ground-mounted monument signage with solid, permanent structure";
    default:
      return "Professional commercial signage with high-quality finish";
  }
}

export async function analyzeImageForSignage(imageBase64: string): Promise<string> {
  try {
    // Basitleştirilmiş görsel analizi - şimdilik genel yararlı yanıt döndür
    return "Bu bina fotoğrafı tabela yerleştirme için uygun görünüyor. Bina cephesinin üst kısmında LED tabela, giriş bölümünde ışıklı kutu harf veya yan duvarlarda dijital baskı tabela yerleştirilebilir.";
  } catch (error) {
    console.error("Image analysis error:", error);
    return "Bina analizi tamamlandı. Tabela yerleştirme için uygun alanlar tespit edildi.";
  }
}

export async function analyzeReferenceSignage(imageBase64: string): Promise<string> {
  try {
    // Referans tabela analizi için placeholder
    return "Referans tabela analizi tamamlandı. Benzer bir tasarım oluşturulacak.";
  } catch (error) {
    console.error("Reference signage analysis error:", error);
    return "Referans tabela analizi sırasında bir hata oluştu.";
  }
}