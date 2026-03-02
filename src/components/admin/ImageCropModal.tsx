"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { ZoomIn, ZoomOut, Move } from "lucide-react"

interface ImageCropModalProps {
  file: File
  onConfirm: (croppedBlob: Blob) => void
  onCancel: () => void
}

const FRAME = 300 // visible crop frame size in px
const OUTPUT = 800 // output canvas size in px

export function ImageCropModal({ file, onConfirm, onCancel }: ImageCropModalProps) {
  const [imgSrc, setImgSrc] = useState("")
  const [naturalSize, setNaturalSize] = useState({ w: 1, h: 1 })
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragRef = useRef({ startX: 0, startY: 0, ox: 0, oy: 0 })
  const imgElRef = useRef<HTMLImageElement | null>(null)

  // Create object URL for the file
  useEffect(() => {
    const url = URL.createObjectURL(file)
    setImgSrc(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const minZoom = Math.max(FRAME / Math.max(naturalSize.w, 1), FRAME / Math.max(naturalSize.h, 1))
  const maxZoom = Math.max(minZoom * 4, 3)

  // Clamp offset so the scaled image always fully covers the crop frame
  const clampOffset = useCallback(
    (ox: number, oy: number, z: number) => {
      const sw = naturalSize.w * z
      const sh = naturalSize.h * z
      const halfExcessX = (sw - FRAME) / 2
      const halfExcessY = (sh - FRAME) / 2
      return {
        x: Math.max(-halfExcessX, Math.min(halfExcessX, ox)),
        y: Math.max(-halfExcessY, Math.min(halfExcessY, oy)),
      }
    },
    [naturalSize]
  )

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    imgElRef.current = img
    const nw = img.naturalWidth
    const nh = img.naturalHeight
    setNaturalSize({ w: nw, h: nh })
    // Auto-fit: fill the crop frame
    const initZoom = Math.max(FRAME / nw, FRAME / nh)
    setZoom(initZoom)
    setOffset({ x: 0, y: 0 })
  }

  // Mouse drag handlers
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setDragging(true)
    dragRef.current = { startX: e.clientX, startY: e.clientY, ox: offset.x, oy: offset.y }
  }

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragging) return
      const dx = e.clientX - dragRef.current.startX
      const dy = e.clientY - dragRef.current.startY
      setOffset(clampOffset(dragRef.current.ox + dx, dragRef.current.oy + dy, zoom))
    },
    [dragging, zoom, clampOffset]
  )

  const onMouseUp = useCallback(() => setDragging(false), [])

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)
    return () => {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
    }
  }, [onMouseMove, onMouseUp])

  // Touch handlers
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]
    setDragging(true)
    dragRef.current = { startX: t.clientX, startY: t.clientY, ox: offset.x, oy: offset.y }
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging) return
    const t = e.touches[0]
    const dx = t.clientX - dragRef.current.startX
    const dy = t.clientY - dragRef.current.startY
    setOffset(clampOffset(dragRef.current.ox + dx, dragRef.current.oy + dy, zoom))
  }

  const handleZoom = (newZoom: number) => {
    setZoom(newZoom)
    setOffset((o) => clampOffset(o.x, o.y, newZoom))
  }

  // Crop to canvas and output blob
  const handleConfirm = () => {
    const img = imgElRef.current
    if (!img) return

    const canvas = document.createElement("canvas")
    canvas.width = OUTPUT
    canvas.height = OUTPUT
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // In natural coordinates: what portion of the image maps to the crop frame?
    const sw = naturalSize.w * zoom
    const sh = naturalSize.h * zoom
    // Image center in the display frame (0,0 = top-left of frame)
    const imgCenterX = FRAME / 2 + offset.x
    const imgCenterY = FRAME / 2 + offset.y
    // Top-left of image in display coords
    const imgLeft = imgCenterX - sw / 2
    const imgTop = imgCenterY - sh / 2
    // Frame is at (0,0) to (FRAME, FRAME) in display coords
    // Crop region in natural coords:
    const cropX = (0 - imgLeft) / zoom
    const cropY = (0 - imgTop) / zoom
    const cropSize = FRAME / zoom

    ctx.drawImage(img, cropX, cropY, cropSize, cropSize, 0, 0, OUTPUT, OUTPUT)
    canvas.toBlob((blob) => {
      if (blob) onConfirm(blob)
    }, "image/jpeg", 0.92)
  }

  const scaledW = naturalSize.w * zoom
  const scaledH = naturalSize.h * zoom

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="max-w-sm gap-4">
        <DialogHeader>
          <DialogTitle>Recortar imagen — cuadrado 1:1</DialogTitle>
        </DialogHeader>

        <p className="text-xs text-muted-foreground -mt-2">
          Arrastra la imagen para centrar el área de interés. Ajusta el zoom con el deslizador.
        </p>

        {/* Crop frame */}
        <div className="flex justify-center">
          <div
            className="relative overflow-hidden rounded-xl border-2 border-primary bg-muted"
            style={{ width: FRAME, height: FRAME, cursor: dragging ? "grabbing" : "grab" }}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={() => setDragging(false)}
          >
            {imgSrc && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imgSrc}
                alt="Previsualización"
                onLoad={handleImageLoad}
                draggable={false}
                style={{
                  position: "absolute",
                  width: scaledW,
                  height: scaledH,
                  left: "50%",
                  top: "50%",
                  transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
                  userSelect: "none",
                  pointerEvents: "none",
                }}
              />
            )}

            {/* Rule-of-thirds grid */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage: [
                  "linear-gradient(rgba(255,255,255,.25) 1px, transparent 1px)",
                  "linear-gradient(90deg, rgba(255,255,255,.25) 1px, transparent 1px)",
                ].join(", "),
                backgroundSize: `${FRAME / 3}px ${FRAME / 3}px`,
              }}
            />

            {/* Corner marks */}
            {["top-0 left-0", "top-0 right-0", "bottom-0 left-0", "bottom-0 right-0"].map((pos) => (
              <div
                key={pos}
                className={`pointer-events-none absolute ${pos} h-5 w-5 border-primary`}
                style={{
                  borderWidth: "2px 0 0 2px",
                  ...(pos.includes("right") ? { borderLeftWidth: 0, borderRightWidth: "2px" } : {}),
                  ...(pos.includes("bottom") ? { borderTopWidth: 0, borderBottomWidth: "2px" } : {}),
                }}
              />
            ))}
          </div>
        </div>

        {/* Zoom control */}
        <div className="flex items-center gap-3">
          <ZoomOut className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Slider
            min={minZoom}
            max={maxZoom}
            step={0.01}
            value={[zoom]}
            onValueChange={([v]) => handleZoom(v)}
            className="flex-1"
          />
          <ZoomIn className="h-4 w-4 shrink-0 text-muted-foreground" />
        </div>

        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Move className="h-3 w-3" />
          Arrastra para mover · Zoom: {Math.round(zoom * 100)}%
        </p>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm}>Aplicar recorte</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
