import Icon from './Icon.jsx';
import { useCart } from '../cart.jsx';
import { haptic } from '../telegram.js';

export default function Stepper({ id, big = false }) {
  const { qty, add, remove } = useCart();
  const q = qty(id);
  const tap = (fn) => (e) => {
    e.stopPropagation();
    haptic('light');
    fn(id);
  };

  if (!q) {
    return (
      <button className={`btn-add ${big ? 'big' : ''}`} onClick={tap(add)}>
        <Icon name="plus" size={big ? 20 : 18} stroke={2.5} />
        {big && <span>Savatga</span>}
      </button>
    );
  }
  return (
    <div className={`stepper ${big ? 'big' : ''}`} onClick={(e) => e.stopPropagation()}>
      <button onClick={tap(remove)} aria-label="minus"><Icon name="minus" size={18} stroke={2.5} /></button>
      <span>{q}</span>
      <button onClick={tap(add)} aria-label="plus"><Icon name="plus" size={18} stroke={2.5} /></button>
    </div>
  );
}
