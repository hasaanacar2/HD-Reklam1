import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface SignageGenerationOptions {
  text: string;
  type: string;
  style: string;
  colors: string;
  building_description: string;
}

export async function generateSignageDesign(options: SignageGenerationOptions): Promise<{ url: string }> {
  try {
    const prompt = createSignagePrompt(options);
    
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    if (!response.data?.[0]?.url) {
      throw new Error("AI servisinden geçerli yanıt alınamadı");
    }
    
    return { url: response.data[0].url };
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
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Bu bina fotoğrafını analiz et ve tabela yerleştirmek için en uygun konumları, bina tipini ve önerilen tabela türlerini Türkçe olarak açıkla. Maksimum 200 kelime."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ],
        },
      ],
      max_tokens: 300,
    });

    return response.choices[0].message.content || "Görüntü analiz edilemedi.";
  } catch (error) {
    console.error("Image analysis error:", error);
    return "Görüntü analizi yapılırken hata oluştu.";
  }
}