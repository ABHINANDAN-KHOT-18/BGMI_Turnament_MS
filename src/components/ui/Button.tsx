import React from 'react'
import { cn } from '../../lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'sand'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-interface font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black'

  const variants = {
    primary: 'bg-cypress text-white hover:bg-[#003833] focus:ring-cypress border border-[#005a53]',
    secondary: 'bg-sand text-black hover:bg-[#ded9cb] focus:ring-sand border border-[#ded9cb]',
    danger: 'bg-red-800 text-white hover:bg-red-900 focus:ring-red-700 border border-red-700',
    outline: 'bg-transparent text-sand border border-sand/30 hover:border-sand hover:text-white focus:ring-sand',
    sand: 'bg-[#F0EDE4] text-[#004741] hover:bg-white focus:ring-[#004741] border border-[#ded9cb]',
  }

  const sizes = {
    sm: 'text-xs px-3 py-1.5 rounded-sm gap-1.5',
    md: 'text-sm px-4 py-2.5 rounded-sm gap-2',
    lg: 'text-base px-6 py-3.5 rounded-md gap-2.5',
  }

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      )}
      {children}
    </button>
  )
}
