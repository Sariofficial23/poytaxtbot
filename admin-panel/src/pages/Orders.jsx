import { useCallback, useEffect, useState } from 'react';
import Icon from '../components/Icon.jsx';
import DateFilter from './DateFilter.jsx';
import { api } from '../api.js';
import { money, rangeFor, fmtDate } from '../utils.js';

const OVERDUE_MS = 10 * 60 * 1000;

export default function Orders() {
  const [filter, setFilter] = useState('today');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [, tick] = useState(0);

  const load = useCallback(() => {
    api.orders(rangeFor(filter))
      .then((o) => {
        setOrders(o);
        setError('');
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    load();
    const t = setInterval(load, 20000); // автообновление
    const r = setInterval(() => tick((x) => x + 1), 30000); // пересчёт просрочки
    return () => {
      clearInterval(t);
      clearInterval(r);
    };
  }, [load]);

  const deliver = async (o) => {
    if (!confirm(`Отметить заказ #${o.id} доставленным?`)) return;
    await api.setOrderStatus(o.id, 'yetkazildi');
    load();
  };

  const delivered = orders.filter((o) => o.status === 'yetkazildi');
  const revenue = delivered.reduce((s, o) => s + o.total, 0);

  return (
    <>
      <div className="toolbar">
        <DateFilter value={filter} onChange={setFilter} />
        <button className="btn ghost" onClick={load}><Icon name="refresh" size={16} /> Обновить</button>
      </div>

      <div className="stats">
        <div className="stat"><span>Заказов</span><b>{orders.length}</b></div>
        <div className="stat"><span>Ожидают</span><b className="orange">{orders.length - delivered.length}</b></div>
        <div className="stat"><span>Доставлено</span><b className="green">{delivered.length}</b></div>
        <div className="stat"><span>Выручка</span><b>{money(revenue)}</b></div>
      </div>

      {error && <div className="error">{error}</div>}
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>#</th><th>Время</th><th>Клиент</th><th>Состав</th><th>Сумма</th><th>Адрес</th><th>Курьер</th>
              <th className="sticky-col">Статус</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={8} className="muted center">Загрузка…</td></tr>}
            {!loading && !orders.length && <tr><td colSpan={8} className="muted center">Заказов нет</td></tr>}
            {orders.map((o) => {
              const overdue = o.status !== 'yetkazildi' && Date.now() - new Date(o.createdAt).getTime() > OVERDUE_MS;
              const link = o.location?.match(/https?:\/\/\S+/)?.[0];
              const addr = o.location?.replace(/\s*—?\s*https?:\/\/\S+/, '').trim();
              return (
                <tr key={o.id} className={overdue ? 'overdue' : ''}>
                  <td><b>{o.id}</b></td>
                  <td className="nowrap">{fmtDate(o.createdAt)}</td>
                  <td>
                    <div>{o.user?.name}</div>
                    <a className="muted small" href={`tel:${o.phone}`}>{o.phone}</a>
                  </td>
                  <td className="items">
                    {(o.items || []).map((i, k) => <div key={k}>{i.name} × {i.qty}</div>)}
                  </td>
                  <td className="nowrap">
                    <b>{money(o.total)}</b>
                    {o.discount > 0 && <div className="muted small">{o.promoCode}: −{money(o.discount)}</div>}
                  </td>
                  <td className="addr">
                    {addr}
                    {link && <div><a href={link} target="_blank" rel="noreferrer">Карта</a></div>}
                  </td>
                  <td>{o.courier || <span className="muted">—</span>}</td>
                  <td className="sticky-col">
                    {o.status === 'yetkazildi' ? (
                      <span className="pill green">Yetkazildi</span>
                    ) : (
                      <button className={`btn small ${overdue ? 'danger' : 'primary'}`} onClick={() => deliver(o)}>Yetkazildi</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
