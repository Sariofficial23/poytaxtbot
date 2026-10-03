import Icon from './Icon.jsx';

export default function ProductImage({ src, alt, className = '' }) {
  if (src) return <img className={`pimg ${className}`} src={src} alt={alt} loading="lazy" />;
  return (
    <div className={`pimg placeholder ${className}`}>
      <Icon name="cup" size={40} stroke={1.5} />
    </div>
  );
}
