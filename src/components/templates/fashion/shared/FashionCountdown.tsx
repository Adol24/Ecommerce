"use client"

import { useEffect, useState } from "react"

interface Props {
  endDate: Date
  label?: string
  className?: string
}

function pad(n: number) {
  return String(n).padStart(2, "0")
}

export function FashionCountdown({ endDate, label, className }: Props) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 })
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    function calculate() {
      const diff = endDate.getTime() - Date.now()
      if (diff <= 0) {
        setExpired(true)
        return
      }
      const totalSecs = Math.floor(diff / 1000)
      setTimeLeft({
        h: Math.floor(totalSecs / 3600),
        m: Math.floor((totalSecs % 3600) / 60),
        s: totalSecs % 60,
      })
    }

    calculate()
    const id = setInterval(calculate, 1000)
    return () => clearInterval(id)
  }, [endDate])

  if (expired) {
    return (
      <span className="text-sm text-muted-foreground">¡Oferta terminada!</span>
    )
  }

  return (
    <div className={className}>
      {label && <span className="mr-2 text-sm font-medium opacity-80">{label}</span>}
      <div className="inline-flex items-center gap-1">
        {[
          { val: pad(timeLeft.h), unit: "h" },
          { val: pad(timeLeft.m), unit: "m" },
          { val: pad(timeLeft.s), unit: "s" },
        ].map(({ val, unit }, i) => (
          <span key={unit} className="inline-flex items-center gap-0.5">
            {i > 0 && (
              <span className="text-lg font-bold mx-0.5 opacity-60 animate-pulse">:</span>
            )}
            <span className="flex flex-col items-center">
              <span className="flex h-9 w-9 items-center justify-center rounded bg-foreground text-background text-sm font-bold tabular-nums">
                {val}
              </span>
              <span className="text-[9px] opacity-50 mt-0.5 uppercase">{unit}</span>
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
