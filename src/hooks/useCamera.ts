async function resizeImage(dataUrl: string, maxW: number, quality: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxW / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.src = dataUrl;
  });
}

export function useCameraCapture() {
  const capturePhoto = (onCapture: (full: string, thumb: string) => void) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.setAttribute('capture', 'environment');
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async () => {
        const full = reader.result as string;
        const display = await resizeImage(full, 1280, 0.8);
        const thumb = await resizeImage(full, 300, 0.7);
        onCapture(display, thumb);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };
  return { capturePhoto };
}
