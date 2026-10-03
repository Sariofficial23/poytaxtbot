import { useEffect, useState } from 'react';
import Sidebar, { PAGES } from './components/Sidebar.jsx';
import Login from './pages/Login.jsx';
import Orders from './pages/Orders.jsx';
import Products from './pages/Products.jsx';
import Banners from './pages/Banners.jsx';
import Promos from './pages/Promos.jsx';
import Couriers from './pages/Couriers.jsx';
import Settings from './pages/Settings.jsx';
import { getPassword, setPassword, setUnauthorizedHandler } from './api.js';

const VIEWS = { orders: Orders, products: Products, banners: Banners, promos: Promos, couriers: Couriers, settings: Settings };

export default function App() {
  const [authed, setAuthed] = useState(Boolean(getPassword()));
  const [page, setPage] = useState(() => (location.hash.slice(1) in VIEWS ? location.hash.slice(1) : 'orders'));
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 800);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setPassword('');
      setAuthed(false);
    });
  }, []);

  useEffect(() => {
    location.hash = page;
  }, [page]);

  if (!authed) return <Login onSuccess={() => setAuthed(true)} />;

  const View = VIEWS[page];
  return (
    <div className="layout">
      <Sidebar
        page={page}
        onChange={(p) => {
          setPage(p);
          if (window.innerWidth < 800) setCollapsed(true);
        }}
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        onLogout={() => {
          setPassword('');
          setAuthed(false);
        }}
      />
      <main className="content">
        <h1 className="page-title">{PAGES.find((p) => p.id === page)?.label}</h1>
        <View />
      </main>
    </div>
  );
}
