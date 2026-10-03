import { useEffect, useState } from 'react';
import DateFilter from './DateFilter.jsx';
import { api } from '../api.js';
import { money, rangeFor } from '../utils.js';

export default function Couriers() {
  const [filter, setFilter] = useState('today');
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.couriers(rangeFor(filter)).then(setRows).catch((e) => setError(e.message));
  }, [filter]);

  const total = rows.reduce((s, r) => ({ delivered: s.delivered + r.delivered, sum: s.sum + r.sum }), { delivered: 0, sum: 0 });

  return (
    <>
      <div className="toolbar"><DateFilter value={filter} onChange={setFilter} /></div>
      {error && <div className="error">{error}</div>}
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Курьер</th><th>Взял</th><th>Доставил</th><th>Сумма доставленных</th></tr></thead>
          <tbody>
            {!rows.length && <tr><td colSpan={4} className="muted center">Нет данных за период</td></tr>}
            {rows.map((r) => (
              <tr key={r.courier}>
                <td><b>{r.courier}</b></td>
                <td>{r.taken}</td>
                <td className="green">{r.delivered}</td>
                <td>{money(r.sum)}</td>
              </tr>
            ))}
            {rows.length > 0 && (
              <tr className="total-row"><td>Итого</td><td /><td>{total.delivered}</td><td>{money(total.sum)}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
