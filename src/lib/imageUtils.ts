export const RECIPE_FALLBACK_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" fill="none">
      <rect width="800" height="450" fill="#FAF5F3"/>
      <circle cx="400" cy="215" r="108" fill="#FFFFFF" stroke="#FAA96B" stroke-width="6"/>
      <circle cx="400" cy="215" r="82" fill="#FFF8EB" stroke="#CE5032" stroke-width="3" stroke-dasharray="8 8"/>
      <path d="M370 185v60m14-60v60m-7-60v110m48-110c0 22-14 34-14 48v62" stroke="#B03D1F" stroke-width="6" stroke-linecap="round"/>
      <text x="400" y="370" text-anchor="middle" fill="#503C3C" font-family="sans-serif" font-size="22" font-weight="700">Minha Receita IA</text>
    </svg>`
  );

/**
 * Redimensiona e comprime a imagem no navegador para manter o payload abaixo
 * do limite de 4.5 MB das Vercel Serverless Functions e otimizar o armazenamento.
 */
export async function compressImageFile(
  file: File,
  maxWidth = 1200,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Não foi possível ler o arquivo de imagem.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('O arquivo selecionado não é uma imagem válida.'));
      img.onload = () => {
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const targetWidth = Math.round(img.width * scale);
        const targetHeight = Math.round(img.height * scale);

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Não foi possível processar a imagem no navegador.'));
          return;
        }

        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Formata metadados de rendimento e tempo evitando separador "•" órfão
 * quando um dos valores estiver ausente (DESIGN_SYSTEM.md Secao 1.3 e 7.6.A).
 */
export function formatRecipeMeta(servings?: string, prepTime?: string): string {
  const cleanServings = servings?.trim() ?? '';
  const cleanPrepTime = prepTime?.trim() ?? '';

  if (cleanServings && cleanPrepTime) {
    return `${cleanServings} • ${cleanPrepTime}`;
  }
  return cleanServings || cleanPrepTime;
}
