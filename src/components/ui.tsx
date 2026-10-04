import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import type { LucideIcon } from 'lucide-react'

/* ------------------------------ Button ------------------------------ */

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'warning'
type ButtonSize = 'sm' | 'md' | 'lg'

const variantClass: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-dark shadow-sm',
  secondary: 'bg-secondary text-white hover:bg-secondary-dark shadow-sm',
  outline: 'border border-primary bg-white text-primary hover:bg-primary-light',
  ghost: 'text-slate-600 hover:bg-slate-100',
  danger: 'bg-danger text-white hover:bg-red-700 shadow-sm',
  warning: 'bg-warning text-white hover:bg-warning-dark shadow-sm',
}

const sizeClass: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-5 py-3 text-sm gap-2',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: LucideIcon
  full?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  full,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg font-semibold whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary/40 ${variantClass[variant]} ${sizeClass[size]} ${full ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : 16} className="shrink-0" />}
      {children}
    </button>
  )
}

/* ------------------------------- Card ------------------------------- */

interface CardProps {
  children: ReactNode
  className?: string
  padded?: boolean
}

export function Card({ children, className = '', padded = true }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white shadow-sm ${
        padded ? 'p-5' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  title,
  subtitle,
  icon: Icon,
  action,
}: {
  title: string
  subtitle?: string
  icon?: LucideIcon
  action?: ReactNode
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        {Icon && (
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-light text-primary">
            <Icon size={18} />
          </span>
        )}
        <div>
          <h3 className="text-sm font-bold text-slate-800">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}

/* ------------------------------ Badge ------------------------------- */

type BadgeTone = 'blue' | 'green' | 'amber' | 'slate' | 'red' | 'purple'

const badgeTone: Record<BadgeTone, string> = {
  blue: 'bg-primary-light text-primary-dark',
  green: 'bg-secondary-light text-secondary-dark',
  amber: 'bg-warning-light text-warning-dark',
  slate: 'bg-slate-100 text-slate-600',
  red: 'bg-danger-light text-danger',
  purple: 'bg-purple-50 text-purple-700',
}

export function Badge({
  children,
  tone = 'slate',
  className = '',
}: {
  children: ReactNode
  tone?: BadgeTone
  className?: string
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${badgeTone[tone]} ${className}`}
    >
      {children}
    </span>
  )
}

/* ------------------------------ Inputs ------------------------------ */

const fieldBase =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20'

export function Field({
  label,
  error,
  required,
  hint,
  children,
}: {
  label: string
  error?: string
  required?: boolean
  hint?: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </span>
      {children}
      {hint && !error && (
        <span className="mt-1 block text-xs text-slate-500">{hint}</span>
      )}
      {error && (
        <span className="mt-1 block text-xs font-medium text-danger">{error}</span>
      )}
    </label>
  )
}

export function Input({
  error,
  className = '',
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return (
    <input
      className={`${fieldBase} ${error ? 'border-danger' : ''} ${className}`}
      {...rest}
    />
  )
}

export function Textarea({
  error,
  className = '',
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }) {
  return (
    <textarea
      className={`${fieldBase} min-h-[90px] resize-y ${
        error ? 'border-danger' : ''
      } ${className}`}
      {...rest}
    />
  )
}

export function Select({
  error,
  className = '',
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean }) {
  return (
    <select
      className={`${fieldBase} ${error ? 'border-danger' : ''} ${className}`}
      {...rest}
    >
      {children}
    </select>
  )
}

/* ---------------------------- Empty state --------------------------- */

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <Icon size={26} />
      </span>
      <h3 className="text-base font-bold text-slate-700">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

/* ----------------------------- Stat card ---------------------------- */

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'blue',
  hint,
}: {
  label: string
  value: string | number
  icon: LucideIcon
  tone?: BadgeTone
  hint?: string
}) {
  const ring: Record<BadgeTone, string> = {
    blue: 'bg-primary-light text-primary',
    green: 'bg-secondary-light text-secondary-dark',
    amber: 'bg-warning-light text-warning-dark',
    slate: 'bg-slate-100 text-slate-600',
    red: 'bg-danger-light text-danger',
    purple: 'bg-purple-50 text-purple-700',
  }
  return (
    <Card className="flex items-center gap-4">
      <span
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${ring[tone]}`}
      >
        <Icon size={22} />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
          {label}
        </p>
        <p className="truncate text-xl font-extrabold text-slate-800">{value}</p>
        {hint && <p className="text-xs text-slate-500">{hint}</p>}
      </div>
    </Card>
  )
}

/* ------------------------------ Table ------------------------------- */

export function TableWrap({ children }: { children: ReactNode }) {
  return (
    <div className="scrollbar-thin -mx-1 overflow-x-auto px-1">
      <div className="min-w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {children}
      </div>
    </div>
  )
}

export function Th({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <th
      className={`border-b border-slate-200 bg-slate-50 px-4 py-3 text-left text-xs font-bold tracking-wide text-slate-500 uppercase ${className}`}
    >
      {children}
    </th>
  )
}

export function Td({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <td className={`border-b border-slate-100 px-4 py-3 text-sm text-slate-700 ${className}`}>
      {children}
    </td>
  )
}