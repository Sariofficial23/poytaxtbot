import Icon from './Icon.jsx';

export const PAGES = [
  { id: 'orders', label: 'Заказы', icon: 'receipt' },
  { id: 'products', label: 'Товары', icon: 'grid' },
  { id: 'banners', label: 'Акции', icon: 'megaphone' },
  { id: 'promos', label: 'Промокоды', icon: 'percent' },
  { id: 'couriers', label: 'Курьеры', icon: 'bike' },
  { id: 'settings', label: 'Настройки', icon: 'settings' },
];

export default function Sidebar({ page, onChange, collapsed, onToggle, onLogout }) {
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sb-head">
        <button className="icon-btn" onClick={onToggle} aria-label="toggle"><Icon name="menu" /></button>
        <img src="/logo.jpg" alt="" className="sb-logo" />
        <span className="sb-brand">Poytaxt</span>
      </div>
      <nav>
        {PAGES.map((p) => (
          <button key={p.id} className={`sb-item ${page === p.id ? 'active' : ''}`} onClick={() => onChange(p.id)} title={p.label}>
            <Icon name={p.icon} size={20} />
            <span>{p.label}</span>
          </button>
        ))}
      </nav>
      <button className="sb-item logout" onClick={onLogout} title="Выйти">
        <Icon name="logout" size={20} />
        <span>Выйти</span>
      </button>
    </aside>
  );
}
