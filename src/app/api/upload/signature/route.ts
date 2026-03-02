import { NextResponse } from "next/server"
import { generateUploadSignature } from "@/lib/cloudinary"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const body = await request.json()
  const { folder = "basictech/products" } = body
  const signatureData = generateUploadSignature(folder)
  return NextResponse.json({
    success: true,
    data: signatureData,
    uploadUrl: `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/auto/upload`,
  })
}
