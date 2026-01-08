// Tenor GIF API integration
const TENOR_API_KEY = process.env.NEXT_PUBLIC_TENOR_API_KEY || "AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ" // Public API key
const TENOR_BASE_URL = "https://tenor.googleapis.com/v2"

export interface TenorGif {
  id: string
  title: string
  media_formats: {
    gif: { url: string; dims: number[]; size: number }
    tinygif: { url: string; dims: number[]; size: number }
    nanogif: { url: string; dims: number[]; size: number }
    mp4: { url: string; dims: number[]; size: number }
    loopedmp4: { url: string; dims: number[]; size: number }
  }
  url: string
}

export interface TenorResponse {
  results: TenorGif[]
  next: string
}

export async function searchGifs(query: string, limit: number = 20, pos?: string): Promise<TenorResponse> {
  try {
    const params = new URLSearchParams({
      q: query,
      key: TENOR_API_KEY,
      client_key: "pie-social",
      limit: limit.toString(),
      media_filter: "gif,tinygif",
    })
    
    if (pos) {
      params.append("pos", pos)
    }

    const response = await fetch(`${TENOR_BASE_URL}/search?${params.toString()}`)
    
    if (!response.ok) {
      throw new Error(`Tenor API error: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching GIFs from Tenor:", error)
    throw error
  }
}

export async function getTrendingGifs(limit: number = 20, pos?: string): Promise<TenorResponse> {
  try {
    const params = new URLSearchParams({
      key: TENOR_API_KEY,
      client_key: "pie-social",
      limit: limit.toString(),
      media_filter: "gif,tinygif",
    })
    
    if (pos) {
      params.append("pos", pos)
    }

    const response = await fetch(`${TENOR_BASE_URL}/trending?${params.toString()}`)
    
    if (!response.ok) {
      throw new Error(`Tenor API error: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching trending GIFs from Tenor:", error)
    throw error
  }
}

export async function getCategories(): Promise<any> {
  try {
    const params = new URLSearchParams({
      key: TENOR_API_KEY,
      client_key: "pie-social",
    })

    const response = await fetch(`${TENOR_BASE_URL}/categories?${params.toString()}`)
    
    if (!response.ok) {
      throw new Error(`Tenor API error: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching GIF categories from Tenor:", error)
    throw error
  }
}

