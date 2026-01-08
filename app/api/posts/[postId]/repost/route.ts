
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
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

    const { postId } = await params

    const post = await prisma.post.findUnique({ where: { id: postId } })
    if (!post) {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 })
    }

    // Create a repost (new post referencing original)
    const repost = await prisma.post.create({
      data: {
        authorId: decoded.userId,
        title: post.title,
        description: `Reposted: ${post.description}`,
        content: post.content,
        images: post.images,
        video: post.video,
        postType: post.postType,
        visibility: 'public'
      }
    })

    await prisma.post.update({
      where: { id: postId },
      data: { shares: { increment: 1 } }
    })

    // Update challenge progress
    await updateChallengeProgress(decoded.userId, 'share_post')

    return NextResponse.json({ success: true, data: repost })
  } catch (error) {
    console.error('[Repost API] Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to repost' }, { status: 500 })
  }
}
