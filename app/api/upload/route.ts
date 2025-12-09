import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import prisma from "@/lib/prisma"
import { v2 as cloudinary } from "cloudinary"

// Only configure Cloudinary if credentials are provided
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
}

async function getStorageProvider(): Promise<"supabase" | "cloudinary"> {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "storage_provider" },
    })
    if (setting?.value === "cloudinary") {
      return "cloudinary"
    }
  } catch {
    console.warn("Failed to fetch storage provider setting")
  }
  return "supabase"
}

async function uploadToSupabase(
  file: File,
  userId: string,
  type: string
): Promise<{ url: string; path: string; provider: "supabase" }> {
  const supabase = await createClient()
  const fileExt = file.name.split(".").pop()
  const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
  const folder = type === "video" ? "videos" : type === "gif" ? "gifs" : "images"
  const filePath = `${folder}/${fileName}`

  const { data, error } = await supabase.storage.from("media").upload(filePath, file, {
    cacheControl: "3600",
    upsert: false,
  })

  if (error) {
    throw new Error(`Supabase upload failed: ${error.message}`)
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("media").getPublicUrl(data.path)

  return {
    url: publicUrl,
    path: data.path,
    provider: "supabase",
  }
}

async function uploadToCloudinary(
  file: File,
  userId: string,
  type: string
): Promise<{ url: string; path: string; provider: "cloudinary" }> {
  // Check if Cloudinary is configured
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment variables.")
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const base64 = buffer.toString("base64")
  const dataUri = `data:${file.type};base64,${base64}`

  return new Promise((resolve, reject) => {
    const resourceType = type === "video" ? "video" : "image"

    cloudinary.uploader.upload(
      dataUri,
      {
        folder: `peak/${userId}/${type}s`,
        resource_type: resourceType,
        public_id: `${Date.now()}_${Math.random().toString(36).substring(7)}`,
      },
      (error, result) => {
        if (error || !result) {
          reject(new Error(`Cloudinary upload failed: ${error?.message || "Unknown error"}`))
          return
        }

        resolve({
          url: result.secure_url,
          path: result.public_id,
          provider: "cloudinary",
        })
      }
    )
  })
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = await verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const type = (formData.get("type") as string) || "image"

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
    }

    const provider = await getStorageProvider()
    let result: { url: string; path: string; provider: "supabase" | "cloudinary" }

    if (provider === "cloudinary") {
      result = await uploadToCloudinary(file, decoded.userId, type)
    } else {
      try {
        result = await uploadToSupabase(file, decoded.userId, type)
      } catch (supabaseError) {
        console.warn("Supabase upload failed, trying Cloudinary fallback:", supabaseError)
        try {
          result = await uploadToCloudinary(file, decoded.userId, type)
        } catch (cloudinaryError) {
          console.error("Both Supabase and Cloudinary uploads failed:", { supabaseError, cloudinaryError })
          return NextResponse.json(
            { 
              success: false, 
              error: "Upload failed. Please configure either Supabase storage or Cloudinary in your environment variables." 
            }, 
            { status: 500 }
          )
        }
      }
    }

    await prisma.mediaAsset.create({
      data: {
        userId: decoded.userId,
        provider: result.provider,
        url: result.url,
        publicUrl: result.url,
        path: result.path,
        type,
        mimeType: file.type,
        size: file.size,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        url: result.url,
        path: result.path,
        provider: result.provider,
      },
    })
  } catch (error) {
    console.error("[Upload API] Error:", error)
    return NextResponse.json({ success: false, error: "Upload failed" }, { status: 500 })
  }
}
