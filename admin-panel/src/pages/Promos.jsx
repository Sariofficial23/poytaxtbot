import { useEffect, useState } from 'react';
import Icon from '../components/Icon.jsx';
import Modal from '../components/Modal.jsx';
import { api } from '../api.js';
import { money } from '../utils.js';

const EMPTY = { code: '', type: 'percent', value: '', active: true };

export default function Promos() {
  const [items, setItems] = useState([]);
  const [edit, setEdit] = useState(null);
  const [error, setError] = useState('');

  const load = () => api.promos().then(setItems).catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    setError('');
    try {
      const data = { ...edit, value: Number(edit.value) };
      if (edit.id) await api.updatePromo(edit.id, data);
      else await api.createPromo(data);
      setEdit(null);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const toggle = async (p) => {
    await api.updatePromo(p.id, { ...p, active: !p.active });
    load();
  };

  const remove = async (p) => {
    if (!confirm(`Удалить промокод ${p.code}?`)) return;
    await api.deletePromo(p.id);
    load();
  };

  return (
    <>
      <div className="toolbar">
        <span className="muted">Скидка применяется к сумме товаров и перепроверяется на сервере</span>
        <button className="btn primary" onClick={() => setEdit(EMPTY)}><Icon name="plus" size={16} /> Новый промокод</button>
      </div>
      {error && !edit && <div className="error">{error}</div>}
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>Код</th><th>Скидка</th><th>Активен</th><th>Использован</th><th>Заказов</th><th>Продажи</th><th>Сумма скидок</th><th /></tr>
          </thead>
          <tbody>
            {!items.length && <tr><td colSpan={8} className="muted center">Промокодов нет</td></tr>}
            {items.map((p) => (
              <tr key={p.id} className={p.active ? '' : 'dim'}>
                <td><b className="mono">{p.code}</b></td>
                <td>{p.type === 'fixed' ? money(p.value) : `${p.value}%`}</td>
                <td><label className="toggle"><input type="checkbox" checked={p.active} onChange={() => toggle(p)} /></label></td>
                <td>{p.usedCount}</td>
                <td>{p.stats.orders}</td>
                <td>{money(p.stats.sales)}</td>
                <td className="red">−{money(p.stats.discount)}</td>
                <td className="nowrap">
                  <button className="icon-btn" onClick={() => setEdit(p)}><Icon name="edit" size={18} /></button>
                  <button className="icon-btn danger" onClick={() => remove(p)}><Icon name="trash" size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {edit && (
        <Modal
          title={edit.id ? 'Редактировать промокод' : 'Новый промокод'}
          onClose={() => setEdit(null)}
          footer={<><button className="btn ghost" onClick={() => setEdit(null)}>Отмена</button><button className="btn primary" onClick={save}>Сохранить</button></>}
        >
          <label>Код<input className="mono" value={edit.code} onChange={(e) => setEdit({ ...edit, code: e.target.value.toUpperCase() })} /></label>
          <div className="grid2">
            <label>Тип
              <select value={edit.type} onChange={(e) => setEdit({ ...edit, type: e.target.value })}>
                <option value="percent">Процент, %</option>
                <option value="fixed">Фикс. сумма, сум</option>
              </select>
            </label>
            <label>Значение<input type="number" value={edit.value} onChange={(e) => setEdit({ ...edit, value: e.target.value })} /></label>
          </div>
          <label className="toggle"><input type="checkbox" checked={edit.active} onChange={(e) => setEdit({ ...edit, active: e.target.checked })} /> Активен</label>
          {error && <div className="error">{error}</div>}
        </Modal>
      )}
    </>
  );
}
