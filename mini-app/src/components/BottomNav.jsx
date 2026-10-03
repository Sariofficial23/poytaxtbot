import Icon from './Icon.jsx';
import { useCart } from '../cart.jsx';
import { haptic } from '../telegram.js';

const TABS = [
  { id: 'home', label: 'Asosiy', icon: 'home' },
  { id: 'catalog', label: 'Menyu', icon: 'grid' },
  { id: 'cart', label: 'Savat', icon: 'bag' },
  { id: 'profile', label: 'Profil', icon: 'user' },
];

export default function BottomNav({ tab, onChange }) {
  const { count } = useCart();
  return (
    <nav className="bottom-nav glass">
      {TABS.map((t) => {
        const active = t.id === tab;
        return (
          <button
            key={t.id}
            className={`nav-item ${active ? 'active' : ''}`}
            onClick={() => {
              haptic('light');
              onChange(t.id);
            }}
          >
            <span className="nav-icon">
              <Icon name={t.icon} filled={active} stroke={active ? 1.6 : 2} />
              {t.id === 'cart' && count > 0 && <span className="badge">{count}</span>}
            </span>
            <span>{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
