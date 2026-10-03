import { useEffect, useState } from 'react';
import Icon from '../components/Icon.jsx';
import { getMyOrders } from '../api.js';
import { getTgUser } from '../telegram.js';
import { money } from '../format.js';

const STATUS = {
  kutilmoqda: { label: 'Kutilmoqda', icon: 'clock', cls: 'pending' },
  yetkazildi: { label: 'Yetkazildi', icon: 'check', cls: 'done' },
};

export default function Profile() {
  const user = getTgUser();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyOrders().then(setOrders).catch((e) => {
      setError(e.message);
      setOrders([]);
    });
  }, []);

  return (
    <div className="screen">
      <div className="profile-head glass">
        {user?.photo_url ? <img src={user.photo_url} alt="" className="avatar" /> : <div className="avatar"><Icon name="user" size={30} /></div>}
        <div>
          <div className="title">{user ? [user.first_name, user.last_name].filter(Boolean).join(' ') : 'Mehmon'}</div>
          {user?.username && <div className="muted small">@{user.username}</div>}
        </div>
      </div>

      <h2 className="section-title"><Icon name="receipt" size={20} /> Buyurtmalarim</h2>
      {orders === null && [1, 2].map((i) => <div key={i} className="card skeleton order-skel" />)}
      {error && <div className="muted small">{error}</div>}
      {orders?.length === 0 && !error && <div className="muted center">Hozircha buyurtmalar yo'q</div>}
      {orders?.map((o) => {
        const st = STATUS[o.status] || STATUS.kutilmoqda;
        return (
          <div key={o.id} className="card glass order">
            <div className="row-between">
              <b>#{o.id}</b>
              <span className={`status ${st.cls}`}><Icon name={st.icon} size={14} /> {st.label}</span>
            </div>
            <div className="muted small">{new Date(o.createdAt).toLocaleString('ru-RU')}</div>
            <div className="order-items">
              {(o.items || []).map((i, k) => <div key={k}>{i.name} × {i.qty}</div>)}
            </div>
            <div className="row-between total"><span>Jami</span><span>{money(o.total)}</span></div>
          </div>
        );
      })}
    </div>
  );
}
