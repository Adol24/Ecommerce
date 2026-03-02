"use client"

import { useState, useCallback, useRef } from "react"
import Image from "next/image"
import { X, GripVertical, Loader2, ImagePlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { validateImageFile } from "@/lib/image-utils"
import { ImageCropModal } from "./ImageCropModal"

interface ImageUploadProps {
  value: string[]
  onChange: (urls: string[]) => void
  maxImages?: number
  folder?: string
  disabled?: boolean
}

interface UploadingImage {
  id: string
  preview: string
  error?: string
}

export function ImageUpload({
  value = [],
  onChange,
  maxImages = 5,
  folder = "basictech/products",
  disabled = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState<UploadingImage[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  // Crop state: the file pending crop
  const [cropFile, setCropFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const canAddMore = value.length + uploading.length < maxImages

  // Upload a blob (either the original file or a cropped blob) to Cloudinary
  const uploadBlob = async (blob: Blob, filename: string): Promise<string | null> => {
    try {
      const sigRes = await fetch("/api/upload/signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder }),
      })
      const sigData = await sigRes.json()
      if (!sigData.success) throw new Error("Error al obtener firma")

      // Use the resolved folder from the server (includes store prefix)
      const resolvedFolder: string = sigData.data.folder ?? folder

      const form = new FormData()
      form.append("file", blob, filename)
      form.append("api_key", sigData.data.apiKey)
      form.append("timestamp", sigData.data.timestamp.toString())
      form.append("signature", sigData.data.signature)
      form.append("folder", resolvedFolder)

      const upRes = await fetch(sigData.uploadUrl, { method: "POST", body: form })
      const upData = await upRes.json()
      if (!upRes.ok) throw new Error(upData.error?.message || "Error al subir")
      return upData.secure_url as string
    } catch (err) {
      console.error("Upload error:", err)
      return null
    }
  }

  // When user picks file(s), validate then open crop modal for the first valid one
  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files)
      for (const file of fileArray) {
        if (!canAddMore) break
        const validation = validateImageFile(file)
        if (!validation.valid) {
          // Show brief error
          const id = `err-${Date.now()}`
          setUploading((prev) => [...prev, { id, preview: "", error: validation.error }])
          setTimeout(() => setUploading((prev) => prev.filter((u) => u.id !== id)), 3000)
          continue
        }
        // Open crop modal for the first valid file only
        setCropFile(file)
        break
      }
    },
    [canAddMore]
  )

  // After crop is confirmed, upload the cropped blob
  const handleCropConfirm = useCallback(
    async (blob: Blob) => {
      const filename = cropFile ? cropFile.name.replace(/\.[^.]+$/, ".jpg") : "image.jpg"
      setCropFile(null)

      const preview = URL.createObjectURL(blob)
      const id = `upload-${Date.now()}`
      setUploading((prev) => [...prev, { id, preview }])

      const url = await uploadBlob(blob, filename)

      URL.revokeObjectURL(preview)
      setUploading((prev) => prev.filter((u) => u.id !== id))

      if (url) {
        onChange([...value, url])
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cropFile, value, onChange, folder]
  )

  const handleCropCancel = () => setCropFile(null)

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      if (disabled) return
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles, disabled]
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (!disabled) setIsDragging(true)
    },
    [disabled]
  )

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFiles(e.target.files)
        // Reset so same file can be re-picked
        e.target.value = ""
      }
    },
    [handleFiles]
  )

  const removeImage = (index: number) => {
    const next = [...value]
    next.splice(index, 1)
    onChange(next)
  }

  // Drag-to-reorder existing images
  const handleDragStart = (index: number) => setDraggedIndex(index)

  const handleDragOverItem = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return
    const next = [...value]
    const [moved] = next.splice(draggedIndex, 1)
    next.splice(index, 0, moved)
    onChange(next)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => setDraggedIndex(null)

  return (
    <>
      {/* Crop modal */}
      {cropFile && (
        <ImageCropModal
          file={cropFile}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {/* Uploaded images */}
          {value.map((url, index) => (
            <div
              key={url}
              className={cn(
                "group relative aspect-square overflow-hidden rounded-lg border bg-muted",
                draggedIndex === index && "opacity-50"
              )}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOverItem(e, index)}
              onDragEnd={handleDragEnd}
            >
              <Image src={url} alt={`Imagen ${index + 1}`} fill className="object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <GripVertical className="h-5 w-5 cursor-grab text-white" />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => removeImage(index)}
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {index === 0 && (
                <div className="absolute bottom-1 left-1 rounded bg-primary px-1.5 py-0.5 text-xs font-medium text-primary-foreground">
                  Principal
                </div>
              )}
            </div>
          ))}

          {/* Uploading placeholders */}
          {uploading.map((upload) => (
            <div
              key={upload.id}
              className="relative aspect-square overflow-hidden rounded-lg border bg-muted"
            >
              {upload.preview && (
                <Image src={upload.preview} alt="Subiendo..." fill className="object-cover opacity-50" />
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                {upload.error ? (
                  <span className="px-2 text-center text-xs text-destructive">{upload.error}</span>
                ) : (
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                )}
              </div>
            </div>
          ))}

          {/* Add button */}
          {canAddMore && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              disabled={disabled}
              className={cn(
                "flex aspect-square flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-colors",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary hover:bg-primary/5",
                disabled && "cursor-not-allowed opacity-50"
              )}
            >
              <ImagePlus className="h-8 w-8 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {value.length}/{maxImages}
              </span>
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
        />

        <p className="text-xs text-muted-foreground">
          Haz clic o arrastra una imagen para subir. Se abrirá el recortador para ajustar al formato cuadrado (1:1).
          Máximo {maxImages} imágenes · JPG, PNG, WebP · Máx. 5 MB.
        </p>
      </div>
    </>
  )
}
