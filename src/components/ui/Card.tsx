import React from 'react'
import { cn } from '../../lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'sand' | 'dark' | 'cypress'
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'dark',
  ...props
}) => {
  const variants = {
    sand: 'bg-sand text-black border border-sand/40 shadow-md',
    dark: 'bg-[#0a0f0d] text-sand border border-cypress/40 shadow-lg',
    cypress: 'bg-cypress text-white border border-[#005a53] shadow-lg',
  }

  return (
    <div
      className={cn('rounded-md p-5 transition-all', variants[variant], className)}
      {...props}
    >
      {children}
    </div>
  )
}
