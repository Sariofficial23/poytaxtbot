import { useEffect, useRef } from 'react';
import ProductCard from '../components/ProductCard.jsx';
import { categoriesOf } from '../format.js';

export default function Catalog({ products, loading, category, setCategory, onOpen }) {
  const cats = categoriesOf(products);
  const active = category && cats.includes(category) ? category : null;
  const sections = useRef({});

  useEffect(() => {
    if (active) sections.current[active]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [active]);

  return (
    <div className="screen">
      <h1 className="title xl">Menyu</h1>
      <div className="chips glass">
        {cats.map((c) => (
          <button key={c} className={`chip ${c === active ? 'on' : ''}`} onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
      </div>

      {loading && <div className="pgrid">{[1, 2, 3, 4].map((i) => <div key={i} className="pcard skeleton tall" />)}</div>}

      {cats.map((c) => (
        <section key={c} ref={(el) => (sections.current[c] = el)} className="cat-section">
          <h2 className="section-title">{c}</h2>
          <div className="pgrid">
            {products.filter((p) => p.category === c).map((p) => (
              <ProductCard key={p.id} product={p} onOpen={onOpen} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
