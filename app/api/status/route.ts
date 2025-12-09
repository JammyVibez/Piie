import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    let userId: string | undefined

    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const decoded = await verifyToken(token)
      if (decoded) {
        userId = decoded.userId
      }
    }

    // Get stories from followed users and own stories
    const where = userId ? {
      OR: [
        { authorId: userId },
        { 
          author: {
            followers: {
              some: {
                followerId: userId
              }
            }
          }
        }
      ],
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
      }
    } : {
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    }

    const stories = await prisma.post.findMany({
      where: {
        ...where,
        postType: 'media',
        visibility: 'public'
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true
          }
        }
      }
    })

    // Group stories by author
    const groupedStories = stories.reduce((acc, story) => {
      const authorId = story.author.id
      if (!acc[authorId]) {
        acc[authorId] = {
          user: story.author,
          stories: []
        }
      }
      acc[authorId].stories.push({
        id: story.id,
        image: story.images[0] || story.video,
        type: story.video ? 'video' : 'image',
        createdAt: story.createdAt
      })
      return acc
    }, {} as Record<string, any>)

    return NextResponse.json({
      success: true,
      data: Object.values(groupedStories)
    })
  } catch (error) {
    console.error('[Status API] Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch stories' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = await verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { mediaUrl, mediaType } = body

    if (!mediaUrl || !mediaType) {
      return NextResponse.json({ success: false, error: 'Media URL and type are required' }, { status: 400 })
    }

    if (!['image', 'video'].includes(mediaType)) {
      return NextResponse.json({ success: false, error: 'Invalid media type' }, { status: 400 })
    }

    const story = await prisma.post.create({
      data: {
        authorId: decoded.userId,
        title: 'Story',
        description: '',
        postType: 'media',
        visibility: 'public',
        images: mediaType === 'image' ? [mediaUrl] : [],
        video: mediaType === 'video' ? mediaUrl : null
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true
          }
        }
      }
    })

    return NextResponse.json({ success: true, data: story }, { status: 201 })
  } catch (error) {
    console.error('[Status API] Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create story' 
    }, { status: 500 })
  }
}