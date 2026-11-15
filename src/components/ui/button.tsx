import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import * as React from 'react'

import { cn } from '@/lib/utils'

// Variantes ajustadas al diseño del proyecto: `default` = botón de acción (cochinilla),
// `outline` = botón de herramienta con borde, `toggle` = opción de un grupo (aria-pressed).
const buttonVariants = cva(
  'presionable inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 text-sm whitespace-nowrap no-underline disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'rounded-s border border-accent bg-accent font-semibold text-accent-fg',
        outline: 'rounded-s border border-line-2 bg-panel hover:border-fg',
        toggle:
          'border-0 bg-transparent aria-pressed:bg-fg aria-pressed:font-semibold aria-pressed:text-bg',
        ghost: 'border-0 bg-transparent hover:underline',
      },
      size: {
        default: 'min-h-10 px-3.5',
        sm: 'min-h-10 px-3',
        icon: 'size-10',
      },
    },
    defaultVariants: { variant: 'outline', size: 'default' },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : 'button'
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Button, buttonVariants }
