"use client"

import { useEffect, useRef } from "react"

interface UseInfiniteScrollOptions {
  threshold?: number
  onLoadMore: () => void
  isLoading?: boolean
  hasMore?: boolean
}

export function useInfiniteScroll({
  threshold = 0.1,
  onLoadMore,
  isLoading = false,
  hasMore = true,
}: UseInfiniteScrollOptions) {
  const observerTarget = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!observerTarget.current || !hasMore || isLoading) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore()
        }
      },
      { threshold },
    )

    observer.observe(observerTarget.current)
    return () => observer.disconnect()
  }, [onLoadMore, isLoading, hasMore, threshold])

  return observerTarget
}
