
import { createClient } from './client'

export interface UploadResult {
  url: string
  path: string
  publicUrl: string
}

export class SupabaseStorageService {
  private supabase = createClient()
  private readonly BUCKET_NAME = 'media'

  async uploadImage(file: File, userId: string): Promise<UploadResult> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`
    const filePath = `images/${fileName}`

    const { data, error } = await this.supabase.storage
      .from(this.BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      throw new Error(`Failed to upload image: ${error.message}`)
    }

    const { data: { publicUrl } } = this.supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(data.path)

    return {
      url: publicUrl,
      path: data.path,
      publicUrl
    }
  }

  async uploadVideo(file: File, userId: string): Promise<UploadResult> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`
    const filePath = `videos/${fileName}`

    const { data, error } = await this.supabase.storage
      .from(this.BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      throw new Error(`Failed to upload video: ${error.message}`)
    }

    const { data: { publicUrl } } = this.supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(data.path)

    return {
      url: publicUrl,
      path: data.path,
      publicUrl
    }
  }

  async deleteFile(path: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(this.BUCKET_NAME)
      .remove([path])

    if (error) {
      throw new Error(`Failed to delete file: ${error.message}`)
    }
  }
}

export const storageService = new SupabaseStorageService()
