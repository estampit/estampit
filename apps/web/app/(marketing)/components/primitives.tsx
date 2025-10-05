import clsx from 'clsx'
import Link from 'next/link'

export function SectionBadge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border border-primary-200/60 bg-primary-50/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-600 shadow-sm shadow-primary-500/10',
        className
      )}
    >
      {children}
    </span>
  )
}

interface SectionHeadingProps {
  eyebrow?: string
  title: string
  description?: string
  align?: 'left' | 'center'
  className?: string
}

export function SectionHeading({ eyebrow, title, description, align = 'center', className }: SectionHeadingProps) {
  return (
    <div
      className={clsx(
        'space-y-4',
        align === 'center' ? 'mx-auto max-w-3xl text-center' : 'text-left',
        className
      )}
    >
      {eyebrow && <SectionBadge className={clsx(align === 'center' ? 'mx-auto' : undefined)}>{eyebrow}</SectionBadge>}
      <h2 className="font-display text-3xl font-semibold tracking-tight text-neutral-900 md:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="text-base text-neutral-600 md:text-lg">
          {description}
        </p>
      )}
    </div>
  )
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string
  icon?: React.ReactNode
}

const baseButtonClasses =
  'inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2'

export function PrimaryButton({ href, icon, className, children, ...rest }: ButtonProps) {
  const content = (
    <span className="flex items-center gap-2">
      {icon}
      <span>{children}</span>
    </span>
  )

  const classes = clsx(
    baseButtonClasses,
    'bg-primary-500 text-white shadow-glow hover:-translate-y-0.5 hover:bg-primary-600',
    className
  )

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    )
  }

  return (
    <button className={classes} {...rest}>
      {content}
    </button>
  )
}

export function SecondaryButton({ href, icon, className, children, ...rest }: ButtonProps) {
  const content = (
    <span className="flex items-center gap-2">
      {icon}
      <span>{children}</span>
    </span>
  )

  const classes = clsx(
    baseButtonClasses,
    'bg-white/80 text-neutral-700 ring-1 ring-inset ring-neutral-200 hover:bg-white hover:text-neutral-900',
    className
  )

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    )
  }

  return (
    <button className={classes} {...rest}>
      {content}
    </button>
  )
}

export function MetricPill({ stat, label, trend }: { stat: string; label: string; trend?: string }) {
  return (
    <div className="rounded-2xl border border-white/40 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
      <div className="text-sm font-semibold text-neutral-500">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-neutral-900">{stat}</span>
        {trend && <span className="text-xs font-medium text-success-600">{trend}</span>}
      </div>
    </div>
  )
}
