interface SignageOptions {
  text: string;
  type: string;
  position: string;
  size: number;
}

export async function addSignageToImage(imageDataUrl: string, options: SignageOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context could not be created'));
        return;
      }
      
      const img = new Image();

      img.onload = () => {
        try {
          canvas.width = img.width;
          canvas.height = img.height;

          // Draw the original image
          ctx.drawImage(img, 0, 0);

          // Calculate signage dimensions and position
          const signageWidth = (canvas.width * options.size) / 100;
          const signageHeight = signageWidth * 0.3; // Aspect ratio 3:1

          let x = (canvas.width - signageWidth) / 2;
          let y: number;

          switch (options.position) {
            case 'top':
              y = canvas.height * 0.1;
              break;
            case 'center':
              y = (canvas.height - signageHeight) / 2;
              break;
            case 'bottom':
            default:
              y = canvas.height * 0.8 - signageHeight;
              break;
          }

          // Create signage background based on type
          let backgroundColor: string;
          let textColor: string;
          let hasGlow = false;

          switch (options.type) {
            case 'led':
              backgroundColor = '#1E40AF';
              textColor = '#FFFFFF';
              hasGlow = true;
              break;
            case 'neon':
              backgroundColor = '#000000';
              textColor = '#FF0080';
              hasGlow = true;
              break;
            case 'lightbox':
              backgroundColor = '#FFFFFF';
              textColor = '#000000';
              break;
            case 'digital':
            default:
              backgroundColor = '#F59E0B';
              textColor = '#FFFFFF';
              break;
          }

          // Draw signage background
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(x, y, signageWidth, signageHeight);

          // Add border
          ctx.strokeStyle = '#CCCCCC';
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, signageWidth, signageHeight);

          // Add glow effect for LED/Neon
          if (hasGlow) {
            ctx.shadowColor = options.type === 'neon' ? '#FF0080' : '#1E40AF';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
          }

          // Draw text
          const fontSize = Math.max(16, signageHeight * 0.4);
          ctx.font = `bold ${fontSize}px Arial, sans-serif`;
          ctx.fillStyle = textColor;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          const textX = x + signageWidth / 2;
          const textY = y + signageHeight / 2;

          // Add text shadow for better visibility
          ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
          ctx.shadowBlur = 3;
          ctx.shadowOffsetX = 1;
          ctx.shadowOffsetY = 1;

          ctx.fillText(options.text, textX, textY);

          // Reset shadow
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;

          resolve(canvas.toDataURL('image/png'));
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('Image failed to load'));
      };

      img.src = imageDataUrl;
    } catch (error) {
      reject(error);
    }
  });
}