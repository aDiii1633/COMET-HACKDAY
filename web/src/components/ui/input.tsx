import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-xl border border-[#DDE8DF] bg-[#FFFFFF] px-3.5 py-2 text-sm text-[#172018] placeholder:text-[#6B7280] shadow-xs transition-all duration-200 hover:border-[#86EFAC] focus:border-[#16A34A] focus:outline-none focus:ring-3 focus:ring-[#16A34A]/20 disabled:bg-[#F3F4F6] disabled:text-[#9CA3AF] disabled:border-[#E5E7EB] disabled:cursor-not-allowed disabled:opacity-70 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
