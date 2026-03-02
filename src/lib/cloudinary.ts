import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export interface UploadSignature {
  signature: string
  timestamp: number
  apiKey: string
  cloudName: string
  folder: string
}

export function generateUploadSignature(folder: string = "basictech/products"): UploadSignature {
  const timestamp = Math.round(Date.now() / 1000)
  const apiSecret = process.env.CLOUDINARY_API_SECRET!
  const apiKey = process.env.CLOUDINARY_API_KEY!
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    apiSecret
  )

  return {
    signature,
    timestamp,
    apiKey,
    cloudName,
    folder,
  }
}

export async function deleteImage(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result.result === "ok"
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error)
    return false
  }
}

export function extractPublicIdFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split("/")
    const uploadIndex = pathParts.findIndex((part) => part === "upload")
    
    if (uploadIndex === -1) return null
    
    const publicIdParts = pathParts.slice(uploadIndex + 2)
    const publicIdWithExtension = publicIdParts.join("/")
    const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, "")
    
    return publicId
  } catch {
    return null
  }
}

export { cloudinary }
