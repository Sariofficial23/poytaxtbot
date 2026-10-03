import { useEffect, useState } from 'react';
import BottomNav from './components/BottomNav.jsx';
import ProductSheet from './components/ProductSheet.jsx';
import Onboarding from './components/Onboarding.jsx';
import Home from './screens/Home.jsx';
import Catalog from './screens/Catalog.jsx';
import Cart from './screens/Cart.jsx';
import Profile from './screens/Profile.jsx';
import { getBanners, getProducts, getSettings } from './api.js';
import { DEFAULT_SETTINGS } from './format.js';

const ONB_KEY = 'dk_onboarded';
const seenOnboarding = () => {
  try {
    return localStorage.getItem(ONB_KEY) === '1';
  } catch {
    return true;
  }
};

export default function App() {
  const [tab, setTab] = useState('home');
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState(null);
  const [sheet, setSheet] = useState(null);
  const [onboarding, setOnboarding] = useState(!seenOnboarding());

  const load = () => {
    setLoading(true);
    setError('');
    Promise.all([getProducts(), getBanners().catch(() => []), getSettings().catch(() => DEFAULT_SETTINGS)])
      .then(([p, b, s]) => {
        setProducts(p);
        setBanners(b);
        setSettings({ ...DEFAULT_SETTINGS, ...s });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [tab]);

  if (onboarding) {
    return (
      <Onboarding
        onDone={() => {
          try {
            localStorage.setItem(ONB_KEY, '1');
          } catch {}
          setOnboarding(false);
        }}
      />
    );
  }

  const openCategory = (c) => {
    setCategory(c);
    setTab('catalog');
  };

  return (
    <div className="app">
      {error ? (
        <div className="empty">
          <p>{error}</p>
          <button className="btn-primary" onClick={load}>Qayta urinish</button>
        </div>
      ) : (
        <>
          {tab === 'home' && (
            <Home products={products} banners={banners} loading={loading} onCategory={openCategory} onOpen={setSheet} />
          )}
          {tab === 'catalog' && (
            <Catalog products={products} loading={loading} category={category} setCategory={setCategory} onOpen={setSheet} />
          )}
          {tab === 'cart' && <Cart products={products} settings={settings} goMenu={() => setTab('catalog')} goProfile={() => setTab('profile')} />}
          {tab === 'profile' && <Profile />}
        </>
      )}
      <ProductSheet product={sheet} onClose={() => setSheet(null)} />
      <BottomNav tab={tab} onChange={setTab} />
    </div>
  );
}
