import { motion } from 'framer-motion';
import { cn } from '../utils/helpers';

export function Card({ children, className, hover = false, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'card',
        hover && 'card-hover',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ children, className, ...props }) {
  return (
    <div className={cn('px-6 py-4 border-b border-white/5', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className, ...props }) {
  return (
    <h3 className={cn('text-lg font-semibold text-text-primary', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className, ...props }) {
  return (
    <p className={cn('text-sm text-text-muted mt-1', className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className, ...props }) {
  return (
    <div className={cn('px-6 py-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className, ...props }) {
  return (
    <div className={cn('px-6 py-4 border-t border-white/5 flex items-center gap-3', className)} {...props}>
      {children}
    </div>
  );
}

// Button components
export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className, 
  loading = false,
  disabled = false,
  icon: Icon,
  onClick,
  ...props 
}) {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'hover:bg-background-hover text-text-secondary hover:text-text-primary',
    danger: 'bg-error/20 hover:bg-error/30 text-error',
    success: 'bg-success/20 hover:bg-success/30 text-success',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      className={cn(
        'rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </motion.button>
  );
}

// Input components
export function Input({ label, error, className, icon: Icon, ...props }) {
  return (
    <div className="w-full">
      {label && <label className="label">{label}</label>}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
        )}
        <input
          className={cn(
            'input-field',
            Icon && 'pl-10',
            error && 'border-error focus:border-error focus:ring-error/20',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-error text-xs mt-1">{error}</p>}
    </div>
  );
}

export function Select({ label, error, options, className, ...props }) {
  return (
    <div className="w-full">
      {label && <label className="label">{label}</label>}
      <select
        className={cn(
          'input-field appearance-none cursor-pointer',
          error && 'border-error focus:border-error focus:ring-error/20',
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-error text-xs mt-1">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, className, ...props }) {
  return (
    <div className="w-full">
      {label && <label className="label">{label}</label>}
      <textarea
        className={cn(
          'input-field min-h-[100px] resize-y',
          error && 'border-error focus:border-error focus:ring-error/20',
          className
        )}
        {...props}
      />
      {error && <p className="text-error text-xs mt-1">{error}</p>}
    </div>
  );
}

// Badge component
export function Badge({ children, variant = 'info', className, ...props }) {
  const variants = {
    info: 'badge-info',
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
  };

  return (
    <span className={cn('badge', variants[variant], className)} {...props}>
      {children}
    </span>
  );
}

// Animated number display
export function AnimatedNumber({ value, prefix = '', suffix = '', decimals = 2 }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {prefix}{typeof value === 'number' ? value.toFixed(decimals) : value}{suffix}
    </motion.span>
  );
}

// Progress bar
export function ProgressBar({ value, max = 100, color = 'accent', showLabel = false, className }) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const colors = {
    accent: 'bg-accent',
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-error',
  };

  return (
    <div className={cn('w-full', className)}>
      <div className="h-2 bg-background-secondary rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={cn('h-full rounded-full', colors[color])}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-text-muted mt-1">{percentage.toFixed(0)}%</p>
      )}
    </div>
  );
}

// Toggle switch
export function Toggle({ checked, onChange, label, className }) {
  return (
    <label className={cn('flex items-center gap-3 cursor-pointer', className)}>
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className={cn(
          'w-11 h-6 rounded-full transition-colors duration-200',
          checked ? 'bg-accent' : 'bg-background-hover'
        )} />
        <div className={cn(
          'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200',
          checked ? 'translate-x-5' : 'translate-x-0'
        )} />
      </div>
      {label && <span className="text-text-secondary text-sm">{label}</span>}
    </label>
  );
}

// Helper for class names
function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
