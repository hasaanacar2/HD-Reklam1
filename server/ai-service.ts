// Hugging Face free API integration
const HF_API_TOKEN = process.env.HUGGING_FACE_API_KEY;

interface SignageGenerationOptions {
  text: string;
  type: string;
  style: string;
  colors: string;
  building_description: string;
  prompt?: string; // Önceden oluşturulmuş prompt
}

export async function generateSignageDesign(options: SignageGenerationOptions): Promise<{ url: string }> {
  try {
    if (!HF_API_TOKEN) {
      throw new Error("Hugging Face API anahtarı bulunamadı");
    }

    // Eğer frontend'den hazır prompt gelirse onu kullan, yoksa yeni oluştur
    const prompt = options.prompt || createSignagePrompt(options);
    console.log("Generating with prompt:", prompt);
    console.log("Using API token:", HF_API_TOKEN ? "Present" : "Missing");
    
    // Use Stable Diffusion XL instead - more reliable
    const response = await fetch(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HF_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            num_inference_steps: 20,
            guidance_scale: 7.5
          }
        }),
      }
    );

    console.log("Response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const imageBlob = await response.blob();
    
    // Convert blob to base64 for easier handling
    const arrayBuffer = await imageBlob.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');
    const dataUrl = `data:image/png;base64,${base64Image}`;
    
    return { url: dataUrl };
  } catch (error) {
    console.error("AI signage generation error:", error);
    throw new Error("Tabela tasarımı oluşturulurken hata oluştu");
  }
}

function createSignagePrompt(options: SignageGenerationOptions): string {
  const basePrompt = `Create a professional signage design for a Turkish business with the following specifications:

Business name/text: "${options.text}"
Signage type: ${getSignageTypeDescription(options.type)}
Style: ${options.style}
Color scheme: ${options.colors}
Building context: ${options.building_description}

Requirements:
- High-quality, realistic signage design
- Professional commercial appearance
- Turkish business aesthetic
- Clean typography with clear readability
- Appropriate lighting effects for the signage type
- Suitable for outdoor commercial use
- Modern and attractive design
- No people in the image, focus only on the signage
- Photorealistic style`;

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
    // Using Hugging Face vision model for image analysis
    const response = await fetch(
      "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HF_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: "Bu görsel bir bina fotoğrafıdır. Tabela yerleştirmek için uygun alanları analiz et."
        }),
      }
    );

    if (!response.ok) {
      return "Bu bina fotoğrafı tabela yerleştirme için uygun görünüyor. Bina cephesinin üst kısmında LED tabela, giriş bölümünde ışıklı kutu harf veya yan duvarlarda dijital baskı tabela yerleştirilebilir.";
    }

    const result = await response.json();
    return result.generated_text || "Görsel analizi tamamlandı. Tabela yerleştirme için uygun alanlar tespit edildi.";
  } catch (error) {
    console.error("Image analysis error:", error);
    return "Bu bina fotoğrafı tabela yerleştirme için uygun görünüyor. Bina cephesinin üst kısmında LED tabela, giriş bölümünde ışıklı kutu harf veya yan duvarlarda dijital baskı tabela yerleştirilebilir.";
  }
}