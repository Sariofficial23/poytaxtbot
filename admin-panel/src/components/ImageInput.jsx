import { useState } from 'react';
import Icon from './Icon.jsx';
import { fileToCompressedDataUrl } from '../utils.js';
import { imgSrc } from '../api.js';

export default function ImageInput({ value, onChange }) {
  const [busy, setBusy] = useState(false);
  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      onChange(await fileToCompressedDataUrl(file));
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  };
  return (
    <div className="image-input">
      <div className="image-preview">{value ? <img src={imgSrc(value)} alt="" /> : <Icon name="image" size={28} />}</div>
      <div className="image-actions">
        <label className="btn ghost">
          <Icon name="image" size={16} /> {busy ? 'Сжатие…' : 'Загрузить фото'}
          <input type="file" accept="image/*" hidden onChange={onFile} />
        </label>
        <input placeholder="или URL картинки" value={value?.startsWith('data:') ? '' : value || ''} onChange={(e) => onChange(e.target.value)} />
        {value && <button className="btn-link danger" onClick={() => onChange('')}>Удалить фото</button>}
      </div>
    </div>
  );
}
