import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent text-sm font-semibold whitespace-nowrap transition-all duration-200 outline-none select-none focus-visible:ring-2 focus-visible:ring-[#22C55E] focus-visible:ring-offset-2 disabled:bg-[#F3F4F6] disabled:text-[#9CA3AF] disabled:border-[#E5E7EB] disabled:opacity-70 disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-[#15803D] text-[#FFFFFF] shadow-sm hover:bg-[#166534] hover:text-[#FFFFFF] active:bg-[#14532D]",
        outline:
          "border border-[#DDE8DF] bg-[#FFFFFF] text-[#172018] hover:bg-[#F0FDF4] hover:text-[#166534] hover:border-[#86EFAC]",
        secondary:
          "bg-[#FFFFFF] border border-[#15803D] text-[#15803D] hover:bg-[#F0FDF4] hover:text-[#14532D] hover:border-[#16A34A]",
        ghost:
          "bg-transparent text-[#166534] hover:bg-[#DCFCE7] hover:text-[#14532D]",
        destructive:
          "bg-[#B91C1C] text-[#FFFFFF] hover:bg-[#991B1B] active:bg-[#7F1D1D]",
        link: "text-[#15803D] underline-offset-4 hover:underline hover:text-[#166534]",
      },
      size: {
        default:
          "h-9 gap-2 px-4 py-2",
        xs: "h-6 gap-1 rounded-lg px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-lg px-3 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 gap-2.5 rounded-xl px-6 text-base",
        icon: "size-9 rounded-xl",
        "icon-xs": "size-6 rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 rounded-lg",
        "icon-lg": "size-11 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
