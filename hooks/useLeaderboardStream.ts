'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export type StreamStatus = 'live' | 'offline' | 'connecting'

interface UseLeaderboardStreamResult {
  status: StreamStatus
  lastEventAt: Date | undefined
}

export function useLeaderboardStream(): UseLeaderboardStreamResult {
  const router = useRouter()
  const [status, setStatus] = useState<StreamStatus>('connecting')
  const [lastEventAt, setLastEventAt] = useState<Date>()
  
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const backoffRef = useRef(1000)

  // Use a stable ref for the connection logic to avoid stale closures if props/state were involved
  // but here we mainly depend on stable router.
  const connect = useCallback(() => {
    // Prevent multiple connections
    if (eventSourceRef.current?.readyState === 1 || eventSourceRef.current?.readyState === 0) {
      return
    }

    setStatus('connecting')

    const es = new EventSource('/api/stream/leaderboard')
    eventSourceRef.current = es

    es.onopen = () => {
      setStatus('live')
      backoffRef.current = 1000 // Reset backoff success
    }

    es.addEventListener('leaderboard_updated', (event) => {
        // console.log('[Stream] Update received', event)
        setLastEventAt(new Date())
        router.refresh()
    })

    // Handle ping if sent as event
    es.addEventListener('ping', () => {
        // Just keeps connection alive, maybe update last contact time internally if needed
    })

    es.onerror = (err) => {
      // console.error('[Stream] Error', err)
      setStatus('offline')
      es.close()
      eventSourceRef.current = null

      const delay = backoffRef.current
      // console.log(`[Stream] Reconnecting in ${delay}ms`)
      
      reconnectTimeoutRef.current = setTimeout(() => {
        connect()
      }, delay)

      // Exponential backoff, max 30s
      backoffRef.current = Math.min(delay * 2, 30000)
    }
  }, [router])

  useEffect(() => {
    connect()

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current)
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
    }
  }, [connect])

  return { status, lastEventAt }
}
