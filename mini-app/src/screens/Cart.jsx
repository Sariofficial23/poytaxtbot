import { useState } from 'react';
import Icon from '../components/Icon.jsx';
import ProductImage from '../components/ProductImage.jsx';
import Stepper from '../components/Stepper.jsx';
import { useCart } from '../cart.jsx';
import { money } from '../format.js';
import { checkPromo, createOrder } from '../api.js';
import { haptic, getTgUser } from '../telegram.js';

const PHONE_KEY = 'dk_phone';
const ADDR_KEY = 'dk_address';
const read = (k) => {
  try {
    return localStorage.getItem(k) || '';
  } catch {
    return '';
  }
};
const write = (k, v) => {
  try {
    localStorage.setItem(k, v);
  } catch {}
};

// +998 фиксировано, вводится ровно 9 цифр (лишнее и ведущие 998 отсекаем)
export function cleanPhone(input) {
  let d = String(input).replace(/\D/g, '');
  if (d.startsWith('998') && d.length > 9) d = d.slice(3);
  return d.slice(0, 9);
}
const formatPhone = (d) => [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean).join(' ');

const calcDiscount = (promo, amount) => {
  if (!promo) return 0;
  const raw = promo.type === 'fixed' ? promo.value : Math.floor((amount * promo.value) / 100);
  return Math.max(0, Math.min(raw, amount));
};

export default function Cart({ products, settings, goMenu, goProfile }) {
  const { cart, clear } = useCart();
  const [cola, setCola] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [promo, setPromo] = useState(null);
  const [promoMsg, setPromoMsg] = useState('');
  const [phone, setPhone] = useState(() => cleanPhone(read(PHONE_KEY)));
  const [address, setAddress] = useState(() => read(ADDR_KEY));
  const [coords, setCoords] = useState(null);
  const [geoState, setGeoState] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(null);

  const lines = products.filter((p) => cart[p.id]).map((p) => ({ ...p, qty: cart[p.id] }));
  const subtotal = lines.reduce((s, l) => s + l.newPrice * l.qty, 0);
  const free = subtotal >= settings.freeFrom;
  const colaOn = cola && free;
  const delivery = free ? 0 : settings.deliveryFee;
  const discount = calcDiscount(promo, subtotal);
  const total = subtotal + delivery + (colaOn ? settings.colaPrice : 0) - discount;

  if (done) {
    return (
      <div className="screen empty">
        <div className="success-icon"><Icon name="check" size={48} stroke={2.5} /></div>
        <h1 className="title xl">Rahmat!</h1>
        <p className="muted center">Buyurtma #{done.id} qabul qilindi. Kuryer tez orada yo'lga chiqadi.</p>
        <button className="btn-primary wide" onClick={goProfile}>Buyurtmalarim</button>
      </div>
    );
  }

  if (!lines.length) {
    return (
      <div className="screen empty">
        <div className="empty-icon"><Icon name="bag" size={48} stroke={1.5} /></div>
        <h1 className="title">Savat bo'sh</h1>
        <p className="muted center">Menyudan sevimli taomlaringizni tanlang</p>
        <button className="btn-primary" onClick={goMenu}>Menyuga o'tish</button>
      </div>
    );
  }

  const applyPromo = async () => {
    setPromoMsg('');
    if (!promoInput.trim()) return;
    try {
      const r = await checkPromo(promoInput.trim(), subtotal);
      if (!r.ok) {
        setPromo(null);
        setPromoMsg(r.error || 'Promokod topilmadi');
        haptic('error');
      } else {
        setPromo(r);
        haptic('success');
      }
    } catch (e) {
      setPromoMsg(e.message);
    }
  };

  const getLocation = () => {
    if (!navigator.geolocation) return setGeoState("Geolokatsiya qo'llab-quvvatlanmaydi");
    setGeoState('Aniqlanmoqda…');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoState('Lokatsiya yuborildi');
        haptic('success');
      },
      () => setGeoState("Lokatsiyani olish imkoni bo'lmadi"),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const submit = async () => {
    setError('');
    if (phone.length !== 9) return setError('Telefon raqamni kiriting (9 ta raqam)');
    if (!address.trim() && !coords) return setError('Manzil yoki lokatsiyani kiriting');
    setSending(true);
    try {
      const order = await createOrder({
        items: lines.map((l) => ({ id: l.id, qty: l.qty })),
        cola: colaOn,
        total,
        phone: `+998${phone}`,
        address: address.trim(),
        lat: coords?.lat ?? null,
        lng: coords?.lng ?? null,
        promoCode: promo?.code || null,
      });
      write(PHONE_KEY, phone);
      write(ADDR_KEY, address.trim());
      haptic('success');
      clear();
      setDone(order);
    } catch (e) {
      haptic('error');
      setError(e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="screen cart">
      <div className="row-between">
        <h1 className="title xl">Savat</h1>
        <button className="btn-link" onClick={clear}><Icon name="trash" size={18} /> Tozalash</button>
      </div>

      <div className="card glass">
        {lines.map((l) => (
          <div key={l.id} className="cart-line">
            <ProductImage src={l.image} alt={l.name} className="thumb" />
            <div className="grow">
              <div className="line-name">{l.name}</div>
              <div className="muted small">{money(l.newPrice)}</div>
            </div>
            <Stepper id={l.id} />
          </div>
        ))}
        {!free && (
          <div className="cart-line">
            <div className="thumb icon-thumb"><Icon name="truck" /></div>
            <div className="grow">
              <div className="line-name">Yetkazib berish</div>
              <div className="muted small">{money(settings.freeFrom - subtotal)} qo'shsangiz — bepul</div>
            </div>
            <b>{money(settings.deliveryFee)}</b>
          </div>
        )}
      </div>

      {!free && (
        <div className="progress">
          <div style={{ width: `${Math.min(100, (subtotal / settings.freeFrom) * 100)}%` }} />
        </div>
      )}

      {free && (
        <label className="card glass upsell">
          <div className="thumb icon-thumb red"><Icon name="cup" /></div>
          <div className="grow">
            <div className="line-name">Coca-Cola qo'shasizmi?</div>
            <div className="muted small">Atigi {money(settings.colaPrice)}</div>
          </div>
          <input type="checkbox" className="switch" checked={cola} onChange={(e) => setCola(e.target.checked)} />
        </label>
      )}

      <div className="card glass">
        <div className="field-label"><Icon name="tag" size={18} /> Promokod</div>
        {promo ? (
          <div className="row-between">
            <span className="promo-ok"><Icon name="check" size={16} /> {promo.code}</span>
            <button className="btn-link" onClick={() => { setPromo(null); setPromoInput(''); }}>Bekor qilish</button>
          </div>
        ) : (
          <div className="input-row">
            <input value={promoInput} onChange={(e) => setPromoInput(e.target.value.toUpperCase())} placeholder="KOD" />
            <button className="btn-secondary" onClick={applyPromo}>Qo'llash</button>
          </div>
        )}
        {promoMsg && <div className="error small">{promoMsg}</div>}
      </div>

      <div className="card glass">
        <div className="field-label"><Icon name="phone" size={18} /> Telefon</div>
        <div className="phone-input">
          <span>+998</span>
          <input
            inputMode="numeric"
            value={formatPhone(phone)}
            onChange={(e) => setPhone(cleanPhone(e.target.value))}
            placeholder="90 123 45 67"
          />
        </div>

        <div className="field-label"><Icon name="mapPin" size={18} /> Manzil</div>
        <button className={`btn-geo ${coords ? 'ok' : ''}`} onClick={getLocation}>
          <Icon name={coords ? 'check' : 'navigation'} size={18} /> {coords ? 'Lokatsiya yuborildi' : 'Lokatsiyani yuborish'}
        </button>
        {geoState && !coords && <div className="muted small">{geoState}</div>}
        <textarea
          rows={2}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Ko'cha, uy, kvartira, mo'ljal"
        />
      </div>

      <div className="card glass summary">
        <div className="row-between"><span>Mahsulotlar</span><span>{money(subtotal)}</span></div>
        <div className="row-between"><span>Yetkazib berish</span><span>{free ? <b className="green">Bepul</b> : money(delivery)}</span></div>
        {colaOn && <div className="row-between"><span>Coca-Cola</span><span>{money(settings.colaPrice)}</span></div>}
        {discount > 0 && <div className="row-between red"><span>Chegirma</span><span>−{money(discount)}</span></div>}
        <div className="row-between total"><span>Jami</span><span>{money(total)}</span></div>
      </div>

      {error && <div className="error">{error}</div>}
      {!getTgUser() && <div className="muted small center">Buyurtma berish uchun ilovani Telegram orqali oching</div>}

      <button className="btn-primary wide sticky-cta" disabled={sending} onClick={submit}>
        {sending ? 'Yuborilmoqda…' : `Buyurtma berish · ${money(total)}`}
      </button>
    </div>
  );
}
