export type ImageSize = "thumbnail" | "small" | "medium" | "large" | "original"

interface ImageTransformations {
  width: number
  height: number
  quality: string
  format: string
}

const transformations: Record<ImageSize, ImageTransformations> = {
  thumbnail: { width: 150, height: 150, quality: "auto:low", format: "webp" },
  small: { width: 300, height: 300, quality: "auto:low", format: "webp" },
  medium: { width: 500, height: 500, quality: "auto:good", format: "webp" },
  large: { width: 1000, height: 1000, quality: "auto:good", format: "webp" },
  original: { width: 0, height: 0, quality: "auto:best", format: "webp" },
}

export function getOptimizedImageUrl(
  url: string,
  size: ImageSize = "medium"
): string {
  if (!url) return ""

  if (!url.includes("cloudinary.com")) {
    return url
  }

  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split("/")
    const uploadIndex = pathParts.findIndex((part) => part === "upload")

    if (uploadIndex === -1) return url

    const transform = transformations[size]
    const transformParts: string[] = []

    if (transform.width > 0) {
      transformParts.push(`w_${transform.width}`)
      transformParts.push(`h_${transform.height}`)
      transformParts.push("c_fill")
    }

    transformParts.push(`q_${transform.quality}`)
    transformParts.push(`f_${transform.format}`)

    const transformationString = transformParts.join(",")

    pathParts.splice(uploadIndex + 1, 0, transformationString)

    return `${urlObj.origin}${pathParts.join("/")}`
  } catch {
    return url
  }
}

export function getThumbnail(url: string): string {
  return getOptimizedImageUrl(url, "thumbnail")
}

export function getSmallImage(url: string): string {
  return getOptimizedImageUrl(url, "small")
}

export function getMediumImage(url: string): string {
  return getOptimizedImageUrl(url, "medium")
}

export function getLargeImage(url: string): string {
  return getOptimizedImageUrl(url, "large")
}

export function getSrcSet(url: string): string {
  if (!url || !url.includes("cloudinary.com")) {
    return url
  }

  return `
    ${getOptimizedImageUrl(url, "thumbnail")} 150w,
    ${getOptimizedImageUrl(url, "small")} 300w,
    ${getOptimizedImageUrl(url, "medium")} 500w,
    ${getOptimizedImageUrl(url, "large")} 1000w
  `.trim()
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
  const maxSize = 5 * 1024 * 1024

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Tipo de archivo no válido. Use JPG, PNG, WebP o GIF.",
    }
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: "El archivo es demasiado grande. Máximo 5MB.",
    }
  }

  return { valid: true }
}
