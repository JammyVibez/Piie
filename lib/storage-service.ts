import { createClient } from "@/lib/supabase/client"
import { v2 as cloudinary, UploadApiResponse } from "cloudinary"

export type StorageProvider = "supabase" | "cloudinary"

export interface UploadResult {
  url: string
  publicUrl: string
  path: string
  provider: StorageProvider
  size?: number
  mimeType?: string
  width?: number
  height?: number
  duration?: number
}

export interface StorageConfig {
  primaryProvider: StorageProvider
  fallbackProvider?: StorageProvider
  supabaseQuotaThreshold?: number
}

const defaultConfig: StorageConfig = {
  primaryProvider: "supabase",
  fallbackProvider: "cloudinary",
  supabaseQuotaThreshold: 0.9,
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

class StorageService {
  private config: StorageConfig
  private supabase = createClient()
  private readonly BUCKET_NAME = "media"

  constructor(config: Partial<StorageConfig> = {}) {
    this.config = { ...defaultConfig, ...config }
  }

  async getActiveProvider(): Promise<StorageProvider> {
    const storedProvider = await this.getSystemSetting("storage_provider")
    if (storedProvider === "cloudinary") {
      return "cloudinary"
    }
    return this.config.primaryProvider
  }

  private async getSystemSetting(key: string): Promise<string | null> {
    try {
      const response = await fetch(`/api/settings/system?key=${key}`)
      if (response.ok) {
        const data = await response.json()
        return data.value || null
      }
    } catch {
      console.warn(`Failed to fetch system setting: ${key}`)
    }
    return null
  }

  async uploadFile(
    file: File,
    userId: string,
    type: "image" | "video" | "gif" = "image"
  ): Promise<UploadResult> {
    const provider = await this.getActiveProvider()

    if (provider === "cloudinary") {
      return this.uploadToCloudinary(file, userId, type)
    }

    try {
      return await this.uploadToSupabase(file, userId, type)
    } catch (error) {
      console.warn("Supabase upload failed, trying fallback:", error)
      if (this.config.fallbackProvider === "cloudinary") {
        return this.uploadToCloudinary(file, userId, type)
      }
      throw error
    }
  }

  private async uploadToSupabase(
    file: File,
    userId: string,
    type: "image" | "video" | "gif"
  ): Promise<UploadResult> {
    const fileExt = file.name.split(".").pop()
    const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
    const folder = type === "video" ? "videos" : type === "gif" ? "gifs" : "images"
    const filePath = `${folder}/${fileName}`

    const { data, error } = await this.supabase.storage
      .from(this.BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (error) {
      throw new Error(`Supabase upload failed: ${error.message}`)
    }

    const {
      data: { publicUrl },
    } = this.supabase.storage.from(this.BUCKET_NAME).getPublicUrl(data.path)

    return {
      url: publicUrl,
      publicUrl,
      path: data.path,
      provider: "supabase",
      size: file.size,
      mimeType: file.type,
    }
  }

  private async uploadToCloudinary(
    file: File,
    userId: string,
    type: "image" | "video" | "gif"
  ): Promise<UploadResult> {
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
        (error, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            reject(new Error(`Cloudinary upload failed: ${error?.message || "Unknown error"}`))
            return
          }

          resolve({
            url: result.secure_url,
            publicUrl: result.secure_url,
            path: result.public_id,
            provider: "cloudinary",
            size: result.bytes,
            mimeType: file.type,
            width: result.width,
            height: result.height,
            duration: result.duration,
          })
        }
      )
    })
  }

  async deleteFile(path: string, provider: StorageProvider): Promise<void> {
    if (provider === "cloudinary") {
      await cloudinary.uploader.destroy(path)
    } else {
      const { error } = await this.supabase.storage.from(this.BUCKET_NAME).remove([path])
      if (error) {
        throw new Error(`Failed to delete file: ${error.message}`)
      }
    }
  }

  async getPublicUrl(path: string, provider: StorageProvider): Promise<string> {
    if (provider === "cloudinary") {
      return cloudinary.url(path, { secure: true })
    }

    const {
      data: { publicUrl },
    } = this.supabase.storage.from(this.BUCKET_NAME).getPublicUrl(path)
    return publicUrl
  }

  async switchProvider(newProvider: StorageProvider): Promise<void> {
    await fetch("/api/settings/system", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "storage_provider", value: newProvider }),
    })
  }
}

export const storageService = new StorageService()
export default StorageService
