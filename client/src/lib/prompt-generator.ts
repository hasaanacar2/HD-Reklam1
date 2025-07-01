// Türkçe karakterleri İngilizce karakterlere çeviren fonksiyon
export function turkishToEnglish(text: string): string {
  const turkishChars: { [key: string]: string } = {
    'ç': 'c', 'Ç': 'C',
    'ğ': 'g', 'Ğ': 'G',
    'ı': 'i', 'I': 'I',
    'İ': 'I', 'i': 'i',
    'ö': 'o', 'Ö': 'O',
    'ş': 's', 'Ş': 'S',
    'ü': 'u', 'Ü': 'U'
  };

  return text.replace(/[çÇğĞıIİiöÖşŞüÜ]/g, (match) => turkishChars[match] || match);
}

// Tabela tiplerini İngilizce açıklamalarına çeviren fonksiyon
export function getSignageTypeDescription(type: string): string {
  const descriptions: { [key: string]: string } = {
    'led': 'LED illuminated signage with bright, energy-efficient lighting',
    'neon': 'Neon tube signage with vibrant glow effect and classic aesthetic',
    'lightbox': 'Illuminated box letters with internal lighting for maximum visibility',
    'digital': 'Digital print signage with high-resolution graphics and vibrant colors'
  };

  return descriptions[type] || 'professional commercial signage';
}

// Tasarım stillerini İngilizce açıklamalarına çeviren fonksiyon
export function getStyleDescription(style: string): string {
  const descriptions: { [key: string]: string } = {
    'modern': 'modern, sleek design with clean lines and contemporary aesthetics',
    'classic': 'classic, elegant design with timeless appeal and sophisticated look',
    'minimalist': 'minimalist design with simple, clean elements and plenty of white space',
    'bold': 'bold, eye-catching design with strong visual impact and attention-grabbing elements'
  };

  return descriptions[style] || 'professional design';
}

// Renk paletlerini İngilizce açıklamalarına çeviren fonksiyon
export function getColorDescription(colors: string): string {
  const descriptions: { [key: string]: string } = {
    'professional': 'professional blue and white color scheme with corporate appeal',
    'warm': 'warm colors including red, orange, and yellow tones for inviting atmosphere',
    'cool': 'cool colors with blue and green tones for calm and trustworthy appearance',
    'bold': 'vibrant, bold colors with high contrast for maximum visual impact',
    'monochrome': 'elegant black and white monochrome design with sophisticated contrast'
  };

  return descriptions[colors] || 'professional color scheme';
}

// Ana prompt oluşturma fonksiyonu
export function generateSignagePrompt(data: {
  text: string;
  type: string;
  style: string;
  colors: string;
  building_description?: string;
  custom_description?: string;
  has_logo?: boolean;
  contact_info?: {
    phone?: string;
    website?: string;
    instagram?: string;
    facebook?: string;
  };
}): string {
  // İşletme adındaki Türkçe karakterleri düzelt
  const businessName = turkishToEnglish(data.text);
  
  // Bileşenleri al
  const typeDesc = getSignageTypeDescription(data.type);
  const styleDesc = getStyleDescription(data.style);
  const colorDesc = getColorDescription(data.colors);
  const buildingDesc = data.building_description || 'modern commercial building facade';

  // Detaylı İngilizce prompt oluştur
  const prompt = `Create a professional ${typeDesc} for a business named "${businessName}". 
The signage should feature ${styleDesc} with ${colorDesc}. 
The sign should be mounted on a ${buildingDesc}. 
The design should be highly realistic, commercial-grade quality, and suitable for a Turkish business environment.
Make sure the business name "${businessName}" is clearly visible and prominently displayed.
The overall composition should look professional, well-lit, and appealing to customers.
High resolution, photorealistic rendering, commercial photography style.`;

  return prompt.replace(/\s+/g, ' ').trim();
}

// Gelişmiş prompt oluşturma (daha detaylı)
export function generateAdvancedSignagePrompt(data: {
  text: string;
  type: string;
  style: string;
  colors: string;
  building_description?: string;
  custom_description?: string;
  has_logo?: boolean;
  contact_info?: {
    phone?: string;
    website?: string;
    instagram?: string;
    facebook?: string;
  };
}): string {
  const businessName = turkishToEnglish(data.text);
  const typeDesc = getSignageTypeDescription(data.type);
  const styleDesc = getStyleDescription(data.style);
  const colorDesc = getColorDescription(data.colors);
  
  // Tabela tipine göre özel detaylar ekle
  let specificDetails = '';
  switch (data.type) {
    case 'led':
      specificDetails = 'with bright LED backlighting, even illumination, and energy-efficient technology';
      break;
    case 'neon':
      specificDetails = 'with authentic neon tube lighting, vibrant glow effect, and classic glass tube appearance';
      break;
    case 'lightbox':
      specificDetails = 'with internal LED lighting, translucent face, and dimensional letter construction';
      break;
    case 'digital':
      specificDetails = 'with high-resolution digital printing, weather-resistant materials, and vibrant color reproduction';
      break;
  }

  // Özel tasarım açıklaması ekleme
  let customDesignText = '';
  if (data.custom_description && data.custom_description.trim()) {
    customDesignText = `Special design requirements: ${data.custom_description}. `;
  }

  // Logo dahil etme
  let logoText = '';
  if (data.has_logo) {
    logoText = 'Include space for company logo alongside the business name. ';
  }

  // İletişim bilgileri ekleme
  let contactText = '';
  if (data.contact_info) {
    const contacts = [];
    if (data.contact_info.phone) contacts.push('phone number');
    if (data.contact_info.website) contacts.push('website URL');
    if (data.contact_info.instagram) contacts.push('Instagram handle');
    if (data.contact_info.facebook) contacts.push('Facebook page');
    
    if (contacts.length > 0) {
      contactText = `Include contact information displaying ${contacts.join(', ')} in smaller text below the main business name. `;
    }
  }

  const prompt = `Professional commercial signage photograph showing ${typeDesc} ${specificDetails}. 
Business name: "${businessName}" prominently displayed with ${styleDesc}. 
Color scheme: ${colorDesc}. 
${customDesignText}${logoText}${contactText}Mounted on ${data.building_description || 'modern commercial building exterior'}. 
Shot during optimal lighting conditions, sharp focus, commercial photography quality. 
The signage should look realistic, properly installed, and dimensionally accurate. 
Turkish business environment, urban commercial setting, professional installation. 
High resolution, detailed texture, realistic materials and lighting effects.`;

  return prompt.replace(/\s+/g, ' ').trim();
}

// Prompt validasyonu
export function validatePromptData(data: {
  text: string;
  type: string;
  style: string;
  colors: string;
  custom_description?: string;
  contact_info?: {
    phone?: string;
    website?: string;
    instagram?: string;
    facebook?: string;
  };
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.text || data.text.trim().length < 1) {
    errors.push('İşletme adı boş olamaz');
  }

  if (data.text && data.text.length > 50) {
    errors.push('İşletme adı çok uzun (maksimum 50 karakter)');
  }

  const validTypes = ['led', 'neon', 'lightbox', 'digital'];
  if (!validTypes.includes(data.type)) {
    errors.push('Geçersiz tabela tipi');
  }

  const validStyles = ['modern', 'classic', 'minimalist', 'bold'];
  if (!validStyles.includes(data.style)) {
    errors.push('Geçersiz tasarım stili');
  }

  const validColors = ['professional', 'warm', 'cool', 'bold', 'monochrome'];
  if (!validColors.includes(data.colors)) {
    errors.push('Geçersiz renk paleti');
  }

  // Özel açıklama validasyonu
  if (data.custom_description && data.custom_description.length > 200) {
    errors.push('Özel tasarım açıklaması çok uzun (maksimum 200 karakter)');
  }

  // İletişim bilgileri validasyonu
  if (data.contact_info) {
    if (data.contact_info.phone && data.contact_info.phone.length > 20) {
      errors.push('Telefon numarası çok uzun');
    }
    if (data.contact_info.website && data.contact_info.website.length > 50) {
      errors.push('Website adresi çok uzun');
    }
    if (data.contact_info.instagram && data.contact_info.instagram.length > 30) {
      errors.push('Instagram kullanıcı adı çok uzun');
    }
    if (data.contact_info.facebook && data.contact_info.facebook.length > 50) {
      errors.push('Facebook sayfa adı çok uzun');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}