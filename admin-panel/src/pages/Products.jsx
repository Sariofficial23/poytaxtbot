import { useEffect, useState } from 'react';
import Icon from '../components/Icon.jsx';
import Modal from '../components/Modal.jsx';
import ImageInput from '../components/ImageInput.jsx';
import { api, imgSrc } from '../api.js';
import { money } from '../utils.js';

const EMPTY = { name: '', description: '', category: '', newPrice: '', oldPrice: '', image: '' };

export default function Products() {
  const [items, setItems] = useState([]);
  const [cat, setCat] = useState('all');
  const [edit, setEdit] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = () => api.products().then(setItems).catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, []);

  const categories = [...new Set(items.map((p) => p.category))];
  const shown = cat === 'all' ? items : items.filter((p) => p.category === cat);

  const save = async () => {
    setBusy(true);
    setError('');
    try {
      const data = { ...edit, newPrice: Number(edit.newPrice), oldPrice: edit.oldPrice === '' ? null : Number(edit.oldPrice) };
      if (edit.id) await api.updateProduct(edit.id, data);
      else await api.createProduct(data);
      setEdit(null);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (p) => {
    if (!confirm(`Удалить «${p.name}»?`)) return;
    await api.deleteProduct(p.id);
    load();
  };

  const seed = async () => {
    if (!confirm('Перезалить полное меню из кода? Все текущие товары будут заменены.')) return;
    setBusy(true);
    try {
      const r = await api.seed();
      alert(`Меню обновлено: ${r.count} товаров`);
      load();
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="toolbar">
        <div className="filters">
          <button className={`chip ${cat === 'all' ? 'on' : ''}`} onClick={() => setCat('all')}>Все ({items.length})</button>
          {categories.map((c) => (
            <button key={c} className={`chip ${cat === c ? 'on' : ''}`} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
        <div className="row">
          <button className="btn ghost" onClick={seed} disabled={busy}><Icon name="refresh" size={16} /> Обновить меню</button>
          <button className="btn primary" onClick={() => setEdit({ ...EMPTY, category: cat === 'all' ? '' : cat })}><Icon name="plus" size={16} /> Добавить</button>
        </div>
      </div>
      {error && !edit && <div className="error">{error}</div>}

      <div className="cards">
        {shown.map((p) => (
          <div key={p.id} className="card product">
            <div className="product-img">{p.image ? <img src={imgSrc(p.image)} alt="" /> : <Icon name="image" size={28} />}</div>
            <div className="product-body">
              <div className="muted small">{p.category}</div>
              <b>{p.name}</b>
              <div>
                {p.oldPrice ? <s className="muted small">{money(p.oldPrice)}</s> : null} <b className="red">{money(p.newPrice)}</b>
              </div>
            </div>
            <div className="card-actions">
              <button className="icon-btn" onClick={() => setEdit({ ...EMPTY, ...p, oldPrice: p.oldPrice ?? '', image: p.image ?? '' })}><Icon name="edit" size={18} /></button>
              <button className="icon-btn danger" onClick={() => remove(p)}><Icon name="trash" size={18} /></button>
            </div>
          </div>
        ))}
      </div>

      {edit && (
        <Modal
          title={edit.id ? 'Редактировать товар' : 'Новый товар'}
          onClose={() => setEdit(null)}
          footer={<><button className="btn ghost" onClick={() => setEdit(null)}>Отмена</button><button className="btn primary" disabled={busy} onClick={save}>Сохранить</button></>}
        >
          <ImageInput value={edit.image} onChange={(image) => setEdit({ ...edit, image })} />
          <label>Название<input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></label>
          <label>Категория
            <input list="cats" value={edit.category} onChange={(e) => setEdit({ ...edit, category: e.target.value })} />
            <datalist id="cats">{categories.map((c) => <option key={c} value={c} />)}</datalist>
          </label>
          <label>Описание<textarea rows={3} value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} /></label>
          <div className="grid2">
            <label>Цена, сум<input type="number" value={edit.newPrice} onChange={(e) => setEdit({ ...edit, newPrice: e.target.value })} /></label>
            <label>Старая цена (необяз.)<input type="number" value={edit.oldPrice} onChange={(e) => setEdit({ ...edit, oldPrice: e.target.value })} /></label>
          </div>
          {error && <div className="error">{error}</div>}
        </Modal>
      )}
    </>
  );
}
