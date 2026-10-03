export const money = (n) => `${Math.round(Number(n) || 0).toLocaleString('ru-RU')} сум`;

// Сжатие фото на клиенте: canvas → JPEG base64
export function fileToCompressedDataUrl(file, maxSize = 800, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

// Фильтр по датам: today | yesterday | week | all | YYYY-MM-DD
export function rangeFor(filter) {
  const today = startOfDay(new Date());
  if (filter === 'today') return { from: today.toISOString(), to: addDays(today, 1).toISOString() };
  if (filter === 'yesterday') return { from: addDays(today, -1).toISOString(), to: today.toISOString() };
  if (filter === 'week') return { from: addDays(today, -6).toISOString(), to: addDays(today, 1).toISOString() };
  if (/^\d{4}-\d{2}-\d{2}$/.test(filter)) {
    const [y, m, d] = filter.split('-').map(Number);
    const day = new Date(y, m - 1, d);
    return { from: day.toISOString(), to: addDays(day, 1).toISOString() };
  }
  return {};
}

export const fmtDate = (s) =>
  new Date(s).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
