import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props {
  eyebrow?: string
  title: string
  href?: string
  linkLabel?: string
  className?: string
  center?: boolean
}

export function FashionSectionHeader({
  eyebrow,
  title,
  href,
  linkLabel = "Ver toda la colección",
  className,
  center = false,
}: Props) {
  return (
    <div
      className={cn(
        "flex items-end justify-between gap-4 mb-7",
        center && "flex-col items-center text-center",
        className
      )}
    >
      <div>
        {eyebrow && (
          <span className="text-xs font-bold uppercase tracking-widest text-primary mb-1 block">
            {eyebrow}
          </span>
        )}
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
      </div>
      {href && !center && (
        <Link
          href={href}
          className="shrink-0 flex items-center gap-1 text-sm font-medium text-primary hover:underline whitespace-nowrap"
        >
          {linkLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  )
}
