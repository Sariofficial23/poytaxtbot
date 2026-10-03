import { useEffect, useState } from 'react';
import Icon from './Icon.jsx';
import Stepper from './Stepper.jsx';
import ProductImage from './ProductImage.jsx';
import { money } from '../format.js';

export default function ProductSheet({ product, onClose }) {
  const [shown, setShown] = useState(null);
  useEffect(() => {
    if (product) setShown(product);
  }, [product]);
  const p = product || shown;
  if (!p) return null;
  const sale = p.oldPrice && p.oldPrice > p.newPrice;

  return (
    <div className={`sheet-backdrop ${product ? 'open' : ''}`} onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <button className="sheet-close" onClick={onClose} aria-label="close"><Icon name="x" size={20} /></button>
        <ProductImage src={p.image} alt={p.name} className="sheet-img" />
        <h2 className="title">{p.name}</h2>
        {p.description && <p className="muted">{p.description}</p>}
        <div className="sheet-footer">
          <div className="price lg">
            {sale && <s>{money(p.oldPrice)}</s>}
            <b>{money(p.newPrice)}</b>
          </div>
          <Stepper id={p.id} big />
        </div>
      </div>
    </div>
  );
}
