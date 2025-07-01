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
  customDescription?: string;
  hasLogo?: boolean;
  contactInfo?: {
    phone?: string;
    website?: string;
    instagram?: string;
    facebook?: string;
  };
}): string {
  const businessName = turkishToEnglish(data.text);
  const typeDescription = getSignageTypeDescription(data.type);
  const styleDescription = getStyleDescription(data.style);
  const colorDescription = getColorDescription(data.colors);
  const buildingDescription = data.building_description || 'modern commercial building exterior';

  // Specific details based on type
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
    default:
      specificDetails = 'with professional lighting and modern construction';
  }

  // Add custom description if provided
  const customElements = data.customDescription ? ` Additional design elements: ${data.customDescription}.` : '';

  // Logo alanı ekle
  let logoSpace = '';
  if (data.hasLogo) {
    logoSpace = ' Design must include a prominent EMPTY rectangular space reserved specifically for company logo placement. This logo area should be clearly visible, well-positioned, and proportionally sized for easy logo integration.';
  }

  // Add contact information if provided
  let contactElements = '';
  if (data.contactInfo) {
    const contacts = [];
    if (data.contactInfo.phone) contacts.push(`phone: ${data.contactInfo.phone}`);
    if (data.contactInfo.website) contacts.push(`website: ${data.contactInfo.website}`);
    if (data.contactInfo.instagram) contacts.push(`Instagram: ${data.contactInfo.instagram}`);
    if (data.contactInfo.facebook) contacts.push(`Facebook: ${data.contactInfo.facebook}`);

    if (contacts.length > 0) {
      contactElements = ` Contact information displayed: ${contacts.join(', ')}.`;
    }
  }

  let fullPrompt = `Professional commercial signage photograph showing ${typeDescription} ${specificDetails}. Business name: "${businessName}" prominently displayed with ${styleDescription}. Color scheme: ${colorDescription}.${customElements}${logoSpace}${contactElements} Mounted on ${buildingDescription}. Shot during optimal lighting conditions, sharp focus, commercial photography quality. The signage should look realistic, properly installed, and dimensionally accurate. Turkish business environment, urban commercial setting, professional installation. High resolution, detailed texture, realistic materials and lighting effects.`;
  if (data.hasLogo) {
    fullPrompt = `Professional commercial signage photograph showing ${typeDescription} ${specificDetails}. Business name: "${businessName}" prominently displayed with ${styleDescription}. Color scheme: ${colorDescription}.${customElements}${contactElements} Mounted on ${buildingDescription}. IMPORTANT: Include a clearly visible empty rectangular area specifically reserved for logo placement - this space should be obvious and well-integrated into the design. Shot during optimal lighting conditions, sharp focus, commercial photography quality. The signage should look realistic, properly installed, and dimensionally accurate. Turkish business environment, urban commercial setting, professional installation. High resolution, detailed texture, realistic materials and lighting effects.`;
  }

  // Promptu kısalt
  return shortenPrompt(fullPrompt);
}

// Prompt kısaltma fonksiyonu - gereksiz detayları temizler
export function shortenPrompt(prompt: string): string {
  return prompt
    // Tekrarlayan kelime gruplarını kısalt
    .replace(/Shot during optimal lighting conditions, sharp focus, commercial photography quality\./g, 'Professional photo quality.')
    .replace(/Turkish business environment, urban commercial setting, professional installation\./g, 'Turkish commercial setting.')
    .replace(/High resolution, detailed texture, realistic materials and lighting effects\./g, 'High-res, realistic.')
    .replace(/The signage should look realistic, properly installed, and dimensionally accurate\./g, 'Realistic installation.')
    .replace(/Mounted on modern Turkish commercial building facade\./g, 'On modern building.')
    // Uzun açıklamaları kısalt
    .replace(/with bright LED backlighting, even illumination, and energy-efficient technology/g, 'with LED backlighting')
    .replace(/with authentic neon tube lighting, vibrant glow effect, and classic glass tube appearance/g, 'with neon glow effect')
    .replace(/with internal LED lighting, translucent face, and dimensional letter construction/g, 'with internal lighting')
    .replace(/with high-resolution digital printing, weather-resistant materials, and vibrant color reproduction/g, 'with digital printing')
    // Stil açıklamalarını kısalt
    .replace(/modern, sleek design with clean lines and contemporary aesthetics/g, 'modern sleek design')
    .replace(/classic, elegant design with timeless appeal and sophisticated look/g, 'classic elegant design')
    .replace(/minimalist design with simple, clean elements and plenty of white space/g, 'minimalist clean design')
    .replace(/bold, eye-catching design with strong visual impact and attention-grabbing elements/g, 'bold eye-catching design')
    // Renk açıklamalarını kısalt
    .replace(/professional blue and white color scheme with corporate appeal/g, 'professional blue-white colors')
    .replace(/warm colors including red, orange, and yellow tones for inviting atmosphere/g, 'warm red-orange-yellow colors')
    .replace(/cool colors with blue and green tones for calm and trustworthy appearance/g, 'cool blue-green colors')
    .replace(/vibrant, bold colors with high contrast for maximum visual impact/g, 'vibrant high-contrast colors')
    .replace(/elegant black and white monochrome design with sophisticated contrast/g, 'elegant black-white monochrome')
    // Fazla boşlukları temizle
    .replace(/\s+/g, ' ')
    .trim();
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