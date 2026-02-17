import prisma from '@/lib/prisma'
import { LeaderboardTable } from './LeaderboardTable'
import { LeaderboardStatus } from './LeaderboardStatus'
import { Trophy, Zap, Video } from 'lucide-react'
import { getSession } from '@/lib/session'
import { AdminControls } from '@/app/components/AdminControls'
import { AsciiBackground } from '@/app/components/AsciiBackground'
import { formatGap, formatTime } from '@/lib/utils'

// Fetch data on the server
async function getData() {
  const activeTrack = await prisma.track.findFirst({
    where: { isActive: true },
    include: {
      entries: {
        orderBy: { lapTimeMs: 'asc' },
      },
    },
  })
  
  return activeTrack
}

export default async function LeaderboardPage() {
  const session = await getSession()
  const isAdmin = session?.role === 'admin'
  const activeTrack = await getData()

  if (!activeTrack) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-400">
        <AsciiBackground />
        <div className="absolute top-4 right-4">
            <AdminControls isAdmin={isAdmin} />
        </div>
        <Trophy className="w-16 h-16 mb-4 text-gray-600" />
        <h2 className="text-xl font-bold text-gray-100">No Active Event</h2>
        <p className="mt-2">Check back later for the next Time Attack.</p>
      </div>
    )
  }

  const sortedEntries = activeTrack.entries

  const formattedEntries = sortedEntries.map((entry, index) => {
    const gap = index === 0 
      ? '+0:00:000'
      : formatGap(entry.lapTimeMs - sortedEntries[0].lapTimeMs)

    return {
      id: entry.id,
      racingAlias: entry.racingAlias,
      crewName: entry.crewName,
      carName: entry.carName,
      stageLevel: entry.stageLevel,
      lapTimeMs: entry.lapTimeMs,
      lapTimeDisplay: formatTime(entry.lapTimeMs), 
      gap,
      clipUrl: entry.clipUrl,
      verifiedAt: entry.verifiedAt ? entry.verifiedAt.toISOString() : null,
      notes: entry.notes
    }
  })
  
  const currentRecord = activeTrack.entries.length > 0 ? activeTrack.entries[0] : null

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl relative">
      <AsciiBackground />
      <div className="absolute top-4 right-4 z-10">
        <AdminControls isAdmin={isAdmin} />
      </div>

      {/* Header Section */}
      <div className="mb-10 flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between border-b border-gray-800 pb-8 mt-4">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="bg-red-600/90 text-white text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wider backdrop-blur-sm shadow-red-900/20 shadow-lg">
              Solace Speed Week
            </span>
             <LeaderboardStatus />
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic leading-none mb-4 neon-text">
            {activeTrack.name}
          </h1>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-400 font-medium">
             <span className="bg-red-600/90 text-white text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wider backdrop-blur-sm shadow-red-900/20 shadow-lg">
               Time Attack
             </span>
             <div className="flex items-center gap-1.5 text-gray-300">
               <Zap className="w-4 h-4 text-yellow-500" />
               <span>A Class Only</span>
             </div>
             <span className="text-gray-700 hidden sm:inline">•</span>
             <span className="text-gray-300">Stage 2/3</span>
             <span className="text-gray-700 hidden sm:inline">•</span>
             <span className="text-gray-300">No NOS</span>
             <span className="text-gray-700 hidden sm:inline">•</span>
             <div className="flex items-center gap-1.5 text-gray-300">
                <Video className="w-4 h-4 text-red-500" />
                <span>Clip Required</span>
             </div>
          </div>
        </div>
        
        {currentRecord && (
          <div className="bg-[#1a1a24] p-4 rounded-lg border border-gray-800 shadow-xl min-w-[200px] hidden md:block transform hover:scale-105 transition-transform duration-300">
             <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">
               Current Record
             </div>
             <div className="text-3xl font-mono font-bold text-red-500 leading-none tracking-tight">
               {formatTime(currentRecord.lapTimeMs)}
             </div>
             <div className="text-xs text-gray-400 mt-2 font-medium flex items-center gap-2">
               <Trophy className="w-3 h-3 text-yellow-500" />
               {currentRecord.racingAlias}
             </div>
          </div>
        )}
      </div>

      <LeaderboardTable initialEntries={formattedEntries} isAdmin={isAdmin} />
    </div>
  )
}
