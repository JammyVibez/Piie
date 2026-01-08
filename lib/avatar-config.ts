export interface AvatarConfig {
  skinTone: string
  hairColor: string
  outfit: string
  accessories: string[]
}

export const AVATAR_OPTIONS = {
  skinTones: ["#f8d9ce", "#eac0b6", "#dcb2a8", "#c89f94", "#b48c80", "#a0796c", "#8c6658", "#785344", "#644030", "#502d1c"],
  hairColors: ["#000000", "#4a4a4a", "#ffffff", "#ff0000", "#00ff00", "#0000ff", "#ffff00", "#00ffff", "#ff00ff"],
  outfits: ["casual", "formal", "techwear", "cyberpunk"],
}

export const DEFAULT_AVATAR: AvatarConfig = {
  skinTone: "#eac0b6",
  hairColor: "#4a4a4a",
  outfit: "techwear",
  accessories: [],
}
