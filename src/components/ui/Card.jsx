import './Card.css';

export default function Card({ 
  children, 
  className = '', 
  onClick, 
  hover = false,
  padding = 'normal'
}) {
  const paddingClass = {
    small: 'card-padding-sm',
    normal: 'card-padding-md',
    large: 'card-padding-lg'
  }[padding];

  return (
    <div 
      className={`card ${paddingClass} ${hover ? 'card-hover' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
