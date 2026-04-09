import * as React from 'react'
import { cn, getInitials } from '@/lib/utils'

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string
  src?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'h-7 w-7 text-xs',
  md: 'h-8 w-8 text-xs',
  lg: 'h-10 w-10 text-sm',
}

const colorMap: Record<number, string> = {
  0: 'bg-blue-500/20 text-blue-400',
  1: 'bg-violet-500/20 text-violet-400',
  2: 'bg-emerald-500/20 text-emerald-400',
  3: 'bg-amber-500/20 text-amber-400',
  4: 'bg-rose-500/20 text-rose-400',
  5: 'bg-cyan-500/20 text-cyan-400',
}

function getColor(name: string) {
  const sum = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return colorMap[sum % 6]
}

export function Avatar({ name = '', src, size = 'md', className, ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center rounded-full font-semibold',
        sizeClasses[size],
        !src && getColor(name),
        className
      )}
      {...props}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full rounded-full object-cover" />
      ) : (
        getInitials(name)
      )}
    </div>
  )
}
