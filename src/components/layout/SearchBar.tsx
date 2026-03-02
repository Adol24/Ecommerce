"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Search, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface SearchResult {
  id: string
  name: string
  slug: string
  price: number
  image: string
  category: string
  brand: string
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

interface SearchBarProps {
  className?: string
  placeholder?: string
  inputClassName?: string
}

export function SearchBar({
  className,
  placeholder = "Buscar productos, marcas y categorías...",
  inputClassName,
}: SearchBarProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debouncedQuery = useDebounce(query, 280)

  // Fetch suggestions when debounced query changes
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([])
      setIsOpen(false)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    fetch(`/api/products/search?q=${encodeURIComponent(debouncedQuery)}&limit=6`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        const res = (data.results ?? []) as SearchResult[]
        setResults(res)
        setIsOpen(res.length > 0)
        setSelectedIndex(-1)
      })
      .catch(() => {
        if (!cancelled) setResults([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [debouncedQuery])

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleSubmit = useCallback(() => {
    const q = query.trim()
    if (!q) return
    setIsOpen(false)
    router.push(`/products?q=${encodeURIComponent(q)}`)
  }, [query, router])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((i) => Math.max(i - 1, -1))
        break
      case "Enter":
        if (selectedIndex >= 0 && results[selectedIndex]) {
          setIsOpen(false)
          router.push(`/products/${results[selectedIndex].slug}`)
        } else {
          handleSubmit()
        }
        break
      case "Escape":
        setIsOpen(false)
        inputRef.current?.blur()
        break
    }
  }

  const clear = () => {
    setQuery("")
    setResults([])
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const goToProduct = (slug: string) => {
    setIsOpen(false)
    router.push(`/products/${slug}`)
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Input row */}
      <div className="relative flex w-full">
        <Input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className={cn(
            "w-full rounded-r-none border-r-0 pl-4 pr-8 focus-visible:ring-0 focus-visible:ring-offset-0",
            inputClassName
          )}
        />

        {/* Clear button */}
        {query && (
          <button
            type="button"
            onClick={clear}
            aria-label="Limpiar búsqueda"
            className="absolute right-[52px] top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        <Button
          type="button"
          onClick={handleSubmit}
          className="rounded-l-none px-4 shrink-0"
          aria-label="Buscar"
        >
          {loading
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Search className="h-4 w-4" />
          }
        </Button>
      </div>

      {/* Suggestions dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border bg-popover shadow-xl">
          <ul role="listbox">
            {results.map((result, i) => (
              <li key={result.id} role="option" aria-selected={i === selectedIndex}>
                <button
                  type="button"
                  onClick={() => goToProduct(result.slug)}
                  onMouseEnter={() => setSelectedIndex(i)}
                  className={cn(
                    "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-accent",
                    i === selectedIndex && "bg-accent"
                  )}
                >
                  {/* Thumbnail */}
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {result.image ? (
                      <Image
                        src={result.image}
                        alt={result.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Search className="h-4 w-4 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{result.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {[result.brand, result.category].filter(Boolean).join(" · ")}
                    </p>
                  </div>

                  {/* Price */}
                  <span className="shrink-0 text-sm font-bold text-primary">
                    ${result.price.toLocaleString("es-MX")}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {/* "Ver todos" footer */}
          <div className="border-t">
            <button
              type="button"
              onClick={handleSubmit}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-primary transition-colors hover:bg-accent"
            >
              <Search className="h-3.5 w-3.5 shrink-0" />
              <span className="flex gap-1">
                Ver todos los resultados para
                <strong className="max-w-[200px] truncate">"{query}"</strong>
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
