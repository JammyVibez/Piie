
import { notFound } from "next/navigation"
import { ProfileContent } from "./profile-content"
import { prisma } from "@/lib/prisma"
import type { Metadata } from "next"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"

interface ProfilePageProps {
  params: Promise<{ userId: string }>
}

async function getUser(userId: string) {
  try {
    // Try to find by ID first
    let user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          },
        },
      },
    })
    
    // If not found by ID, try username
    if (!user) {
      user = await prisma.user.findUnique({
        where: { username: userId.toLowerCase() },
        include: {
          _count: {
            select: {
              posts: true,
              followers: true,
              following: true,
            },
          },
        },
      })
    }
    
    return user
  } catch (error) {
    console.error("Error fetching user:", error)
    return null
  }
}

async function getUserPosts(userId: string) {
  try {
    const posts = await prisma.post.findMany({
      where: { 
        authorId: userId,
        visibility: { in: ["public", "followers"] } // Only show public or followers posts
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        title: true,
        description: true,
        content: true,
        images: true,
        video: true,
        postType: true,
        visibility: true,
        rarity: true,
        shares: true,
        views: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            workerRole: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likedBy: true,
          },
        },
      },
    })
    return posts
  } catch (error) {
    console.error("Error fetching user posts:", error)
    return []
  }
}

async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    
    if (!token) return null
    
    const JWT_SECRET = new TextEncoder().encode(
      process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"
    )
    
    const { payload } = await jwtVerify(token, JWT_SECRET)
    
    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      select: { id: true }
    })
    
    return user
  } catch (error) {
    return null
  }
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { userId } = await params
  const user = await getUser(userId)

  if (!user) {
    return {
      title: "User Not Found - P!!E",
      description: "This user profile does not exist.",
    }
  }

  return {
    title: `${user.name} - P!!E Profile`,
    description: user.bio || `Check out ${user.name}'s profile on P!!E`,
    openGraph: {
      title: `${user.name} - P!!E Profile`,
      description: user.bio || `Check out ${user.name}'s profile on P!!E`,
      type: "profile",
      images: [{ url: user.avatar || "/placeholder.svg", width: 400, height: 400 }],
    },
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { userId } = await params
  const user = await getUser(userId)

  if (!user) {
    notFound()
  }

  const [userPosts, currentUser] = await Promise.all([
    getUserPosts(user.id),
    getCurrentUser()
  ])

  const formattedUser = {
    id: user.id,
    name: user.name,
    username: user.username,
    avatar: user.avatar,
    banner: user.bannerImage,
    bio: user.bio,
    level: user.level,
    xp: user.xp,
    isVerified: user.emailVerified || false,
    followers: user._count.followers,
    following: user._count.following,
    postsCount: user._count.posts,
    createdAt: user.createdAt,
    location: user.location,
    userRole: user.userRole,
    workerRole: user.workerRole,
    realm: user.realm,
  }

  const formattedPosts = userPosts.map((post) => ({
    id: post.id,
    title: post.title || '',
    description: post.description || post.content || '',
    content: post.content,
    author: {
      ...post.author,
      realm: null,
      isVerified: false,
    },
    createdAt: post.createdAt,
    timestamp: post.createdAt,
    likes: post._count.likedBy,
    comments: post._count.comments,
    shares: post.shares || 0,
    views: post.views || 0,
    postType: post.postType as "text" | "fusion" | "image" | "video" | "poll",
    mediaUrls: post.images || [],
    image: post.images?.[0] || post.video || null,
    video: post.video || null,
    rarity: post.rarity || 'common' as const,
  }))

  return <ProfileContent user={formattedUser} userPosts={formattedPosts} userId={user.id} />
}
