import Icon from '../components/Icon.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { categoriesOf, GRADIENTS } from '../format.js';
import { getTgUser, openLink } from '../telegram.js';

export default function Home({ products, banners, loading, onCategory, onOpen }) {
  const user = getTgUser();
  const cats = categoriesOf(products);
  const sale = products.filter((p) => p.oldPrice && p.oldPrice > p.newPrice);
  // Акционные позиции, а если их нет — первые блюда с фото
  const popular = (sale.length ? sale : products.filter((p) => p.image)).slice(0, 6);

  const onBanner = (b) => {
    if (b.linkType === 'category' && b.linkValue) onCategory(b.linkValue);
    else if (b.linkType === 'url' && b.linkValue) openLink(b.linkValue);
  };

  return (
    <div className="screen">
      <header className="home-head">
        <img src="/logo.jpg" alt="Dubai Kafe" className="logo-img" />
        <div className="grow">
          <div className="muted small">Assalomu alaykum{user?.first_name ? `, ${user.first_name}` : ''}</div>
          <h1 className="title xl">Dubai Kafe</h1>
        </div>
      </header>

      {banners.length > 0 && (
        <div className="banners">
          {banners.map((b) => (
            <div
              key={b.id}
              className={`banner ${b.image ? 'photo' : ''}`}
              style={b.image ? undefined : { background: GRADIENTS[b.color] || GRADIENTS.red }}
              onClick={() => onBanner(b)}
            >
              {b.image && <img src={b.image} alt="" className="banner-bg" />}
              <div className="banner-text">
                <span className="banner-tag">Aksiya</span>
                <div className="banner-title">{b.title}</div>
                {b.subtitle && <div className="banner-sub">{b.subtitle}</div>}
                {b.price && <div className="banner-price">{b.price}</div>}
              </div>
              {!b.image && b.emoji && <div className="banner-emoji">{b.emoji}</div>}
            </div>
          ))}
        </div>
      )}

      <h2 className="section-title ornament">Kategoriyalar</h2>
      {loading ? (
        <div className="cat-row">{[1, 2, 3, 4, 5].map((i) => <div key={i} className="cat-chip"><div className="cat-img skeleton" /></div>)}</div>
      ) : (
        <div className="cat-row">
          {cats.map((c) => {
            const img = products.find((p) => p.category === c && p.image)?.image;
            return (
              <button key={c} className="cat-chip" onClick={() => onCategory(c)}>
                <div className="cat-img">{img ? <img src={img} alt="" /> : <Icon name="cup" size={28} stroke={1.6} />}</div>
                <span>{c}</span>
              </button>
            );
          })}
        </div>
      )}

      {popular.length > 0 && (
        <>
          <h2 className="section-title ornament">{sale.length ? 'Aksiyadagi taomlar' : 'Mashhur taomlar'}</h2>
          <div className="pgrid">{popular.map((p) => <ProductCard key={p.id} product={p} onOpen={onOpen} />)}</div>
        </>
      )}
    </div>
  );
}
