import { useState } from 'react';
import Icon from './Icon.jsx';

const SLIDES = [
  { logo: true, title: 'Poytaxt', text: "Sevimli milliy taomlaringiz — bir necha bosishda" },
  { icon: 'truck', title: 'Tez yetkazib berish', text: 'Buyurtmangizni issiq holda eshigingizgacha olib boramiz' },
  { icon: 'gift', title: 'Aksiyalar va promokodlar', text: "Chegirmalardan foydalaning va tejang" },
];

export default function Onboarding({ onDone }) {
  const [i, setI] = useState(0);
  const s = SLIDES[i];
  const last = i === SLIDES.length - 1;
  return (
    <div className="onboarding">
      {s.logo ? <img src="/logo.jpg" alt="Poytaxt" className="onb-logo" /> : <div className="onb-icon"><Icon name={s.icon} size={64} stroke={1.5} /></div>}
      <h1 className="title xl">{s.title}</h1>
      <p className="muted center">{s.text}</p>
      <div className="dots">{SLIDES.map((_, k) => <span key={k} className={k === i ? 'on' : ''} />)}</div>
      <button className="btn-primary wide" onClick={() => (last ? onDone() : setI(i + 1))}>
        {last ? 'Boshlash' : 'Keyingi'}
      </button>
      {!last && <button className="btn-link" onClick={onDone}>O'tkazib yuborish</button>}
    </div>
  );
}
