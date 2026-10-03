const OPTIONS = [
  ['today', 'Сегодня'],
  ['yesterday', 'Вчера'],
  ['week', 'Неделя'],
  ['all', 'Все'],
];

export default function DateFilter({ value, onChange }) {
  const isDate = /^\d{4}-\d{2}-\d{2}$/.test(value);
  return (
    <div className="filters">
      {OPTIONS.map(([id, label]) => (
        <button key={id} className={`chip ${value === id ? 'on' : ''}`} onClick={() => onChange(id)}>{label}</button>
      ))}
      <input type="date" className={`chip ${isDate ? 'on' : ''}`} value={isDate ? value : ''} onChange={(e) => onChange(e.target.value || 'today')} />
    </div>
  );
}
