'use client'
import { ButtonHTMLAttributes, forwardRef } from 'react'

type Variant = 'primary' | 'red' | 'black' | 'gold' | 'ghost'
type Size = 'sm' | 'md' | 'lg' | 'xl'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  fullWidth?: boolean
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'btn-place-bet text-white',
  red: 'btn-red text-white',
  black: 'btn-black text-white',
  gold: 'bg-nk-gold text-black hover:brightness-110',
  ghost: 'bg-transparent border border-[#333] text-gray-400 hover:border-nk-gold hover:text-nk-gold',
}

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3.5 text-base rounded-xl',
  xl: 'px-8 py-4 text-lg rounded-xl',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      children,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          font-bold transition-all duration-200
          ${VARIANT_CLASSES[variant]}
          ${SIZE_CLASSES[size]}
          ${fullWidth ? 'w-full' : ''}
          ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}
          ${className}
        `}
        {...props}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Loading...
          </span>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button