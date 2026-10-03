import Stepper from './Stepper.jsx';
import ProductImage from './ProductImage.jsx';
import { money } from '../format.js';

export default function ProductCard({ product, onOpen }) {
  const sale = product.oldPrice && product.oldPrice > product.newPrice;
  return (
    <div className="pcard glass" onClick={() => onOpen(product)}>
      <div className="pcard-img">
        <ProductImage src={product.image} alt={product.name} />
        {sale && <span className="sale-badge">−{Math.round((1 - product.newPrice / product.oldPrice) * 100)}%</span>}
      </div>
      <div className="pcard-body">
        <div className="pcard-name">{product.name}</div>
        <div className="pcard-bottom">
          <div className="price">
            {sale && <s>{money(product.oldPrice)}</s>}
            <b>{money(product.newPrice)}</b>
          </div>
          <Stepper id={product.id} />
        </div>
      </div>
    </div>
  );
}
