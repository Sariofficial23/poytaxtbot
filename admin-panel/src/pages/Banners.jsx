import { useEffect, useState } from 'react';
import Icon from '../components/Icon.jsx';
import Modal from '../components/Modal.jsx';
import ImageInput from '../components/ImageInput.jsx';
import { api, imgSrc } from '../api.js';

const COLORS = {
  red: 'linear-gradient(135deg,#1d3350,#2f5580)',
  orange: 'linear-gradient(135deg,#8a5a1c,#cfa550)',
  gold: 'linear-gradient(135deg,#a77a2c,#e2bd6b)',
  pink: 'linear-gradient(135deg,#6b2f45,#a8566e)',
  dark: 'linear-gradient(135deg,#0f1c2d,#243f5e)',
  green: 'linear-gradient(135deg,#1f4d47,#3f7d70)',
};
const EMPTY = { title: '', subtitle: '', image: '', emoji: '', price: '', color: 'red', linkType: '', linkValue: '', active: true, sort: 0 };

export default function Banners() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [edit, setEdit] = useState(null);
  const [error, setError] = useState('');

  const load = () => api.banners().then(setItems).catch((e) => setError(e.message));
  useEffect(() => {
    load();
    api.products().then((p) => setCategories([...new Set(p.map((x) => x.category))])).catch(() => {});
  }, []);

  const save = async () => {
    setError('');
    try {
      if (edit.id) await api.updateBanner(edit.id, edit);
      else await api.createBanner(edit);
      setEdit(null);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const toggle = async (b) => {
    await api.updateBanner(b.id, { ...b, active: !b.active });
    load();
  };

  const remove = async (b) => {
    if (!confirm(`Удалить акцию «${b.title}»?`)) return;
    await api.deleteBanner(b.id);
    load();
  };

  return (
    <>
      <div className="toolbar">
        <span className="muted">Баннеры на главной мини-аппа</span>
        <button className="btn primary" onClick={() => setEdit({ ...EMPTY, sort: items.length })}><Icon name="plus" size={16} /> Добавить акцию</button>
      </div>
      {error && !edit && <div className="error">{error}</div>}
      <div className="cards wide">
        {items.map((b) => (
          <div key={b.id} className={`card banner-card ${b.active ? '' : 'disabled'}`}>
            <div className="banner-preview" style={{ background: COLORS[b.color] || COLORS.red }}>
              <div>
                <b>{b.title}</b>
                {b.subtitle && <div className="small">{b.subtitle}</div>}
                {b.price && <span className="banner-price">{b.price}</span>}
              </div>
              {b.image ? <img src={imgSrc(b.image)} alt="" /> : b.emoji ? <span className="banner-emoji">{b.emoji}</span> : null}
            </div>
            <div className="row-between">
              <label className="toggle"><input type="checkbox" checked={b.active} onChange={() => toggle(b)} /> {b.active ? 'Активна' : 'Скрыта'}</label>
              <div className="row">
                <span className="muted small">sort: {b.sort}</span>
                <button className="icon-btn" onClick={() => setEdit({ ...EMPTY, ...b, subtitle: b.subtitle ?? '', image: b.image ?? '', emoji: b.emoji ?? '', price: b.price ?? '', linkType: b.linkType ?? '', linkValue: b.linkValue ?? '' })}><Icon name="edit" size={18} /></button>
                <button className="icon-btn danger" onClick={() => remove(b)}><Icon name="trash" size={18} /></button>
              </div>
            </div>
          </div>
        ))}
        {!items.length && <div className="muted">Акций пока нет</div>}
      </div>

      {edit && (
        <Modal
          title={edit.id ? 'Редактировать акцию' : 'Новая акция'}
          onClose={() => setEdit(null)}
          footer={<><button className="btn ghost" onClick={() => setEdit(null)}>Отмена</button><button className="btn primary" onClick={save}>Сохранить</button></>}
        >
          <ImageInput value={edit.image} onChange={(image) => setEdit({ ...edit, image })} />
          <label>Заголовок<input value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} /></label>
          <label>Подзаголовок<input value={edit.subtitle} onChange={(e) => setEdit({ ...edit, subtitle: e.target.value })} /></label>
          <div className="grid2">
            <label>Цена (текст)<input placeholder="49 000 so'm" value={edit.price} onChange={(e) => setEdit({ ...edit, price: e.target.value })} /></label>
            <label>Эмодзи (если нет фото)<input value={edit.emoji} onChange={(e) => setEdit({ ...edit, emoji: e.target.value })} /></label>
          </div>
          <label>Цвет</label>
          <div className="swatches">
            {Object.entries(COLORS).map(([k, v]) => (
              <button key={k} className={`swatch ${edit.color === k ? 'on' : ''}`} style={{ background: v }} onClick={() => setEdit({ ...edit, color: k })} />
            ))}
          </div>
          <div className="grid2">
            <label>Ссылка
              <select value={edit.linkType} onChange={(e) => setEdit({ ...edit, linkType: e.target.value, linkValue: '' })}>
                <option value="">Нет</option>
                <option value="category">Категория</option>
                <option value="url">URL</option>
              </select>
            </label>
            {edit.linkType === 'category' && (
              <label>Категория
                <select value={edit.linkValue} onChange={(e) => setEdit({ ...edit, linkValue: e.target.value })}>
                  <option value="">—</option>
                  {categories.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
            )}
            {edit.linkType === 'url' && <label>URL<input value={edit.linkValue} onChange={(e) => setEdit({ ...edit, linkValue: e.target.value })} /></label>}
          </div>
          <div className="grid2">
            <label>Порядок (sort)<input type="number" value={edit.sort} onChange={(e) => setEdit({ ...edit, sort: e.target.value })} /></label>
            <label className="toggle"><input type="checkbox" checked={edit.active} onChange={(e) => setEdit({ ...edit, active: e.target.checked })} /> Активна</label>
          </div>
          {error && <div className="error">{error}</div>}
        </Modal>
      )}
    </>
  );
}
