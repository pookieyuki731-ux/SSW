'use client'

import { useLeaderboardStream } from '@/hooks/useLeaderboardStream'
import { RefreshCw, Wifi, WifiOff } from 'lucide-react'

export function LeaderboardStatus() {
  const { status, lastEventAt } = useLeaderboardStream()

  // Connection Indicator
  let indicator = (
    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-800/50 border border-gray-700/50 text-gray-400">
      <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-pulse"></div>
      <span className="text-[10px] uppercase font-bold tracking-wider">Connecting</span>
    </div>
  )

  if (status === 'live') {
    indicator = (
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400">
        <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></div>
        <span className="text-[10px] uppercase font-bold tracking-wider">LIVE</span>
      </div>
    )
  } else if (status === 'offline') {
    indicator = (
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-500">
        <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
        <span className="text-[10px] uppercase font-bold tracking-wider">OFFLINE</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-start gap-1">
      {indicator}
      {status === 'live' && lastEventAt && (
        <span className="text-[9px] text-gray-500 ml-1">
            Last update: {lastEventAt.toLocaleTimeString()}
        </span>
      )}
    </div>
  )
}
