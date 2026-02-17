import prisma from '@/lib/prisma'
import { logout } from '@/app/actions'
import { AdminLapForm } from '@/app/components/AdminLapForm'
import { AdminLapTable } from '@/app/components/AdminLapTable'
import { AsciiBackground } from '@/app/components/AsciiBackground'
import { formatTime } from '@/lib/utils'

export default async function AdminPage() {
  const activeTrack = await prisma.track.findFirst({
    where: { isActive: true },
    include: {
      entries: {
        orderBy: { lapTimeMs: 'asc' },
      },
    },
  })

  // Serialize dates manually if needed, or rely on Server Components ability to pass dates to Client Components 
  // (Nextjs 13+ passes serialized JSON, Date objects need to be strings or numbers often if boundaries are strict)
  // Let's verify entries structure.
  
  const entries = (activeTrack?.entries || []).map(entry => ({
      ...entry,
      verifiedAt: entry.verifiedAt ? entry.verifiedAt.toISOString() : null,
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
      lapTimeDisplay: formatTime(entry.lapTimeMs), // Format for consistent display
  }))

  return (
    <div className="min-h-screen p-6 lg:p-10 font-sans relative">
      <AsciiBackground />
      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* Header */}
        <div className="flex justify-between items-end border-b border-gray-800 pb-6 relative z-10">
          <div>
            <h1 className="text-4xl font-black text-white italic tracking-tighter drop-shadow-lg">
              ADMIN <span className="text-indigo-500">DASHBOARD</span>
            </h1>
            <p className="text-gray-400 mt-2 font-mono text-xs uppercase tracking-widest">
              Review & Approve Lap Times
            </p>
          </div>
          <form action={logout}>
            <button className="text-xs font-mono text-gray-500 hover:text-red-500 transition-colors uppercase tracking-widest border border-gray-800 px-4 py-2 rounded hover:border-red-500/50">
              Disconnect
            </button>
          </form>
        </div>

        {/* Input Section */}
        <div className="glass-panel rounded-xl overflow-hidden shadow-2xl border border-white/5 relative z-10">
          <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
             <div>
                <h3 className="text-lg font-bold text-white tracking-wide">
                  Submit New Lap
                </h3>
                <p className="text-xs text-indigo-400 font-mono uppercase">
                  Event: {activeTrack ? activeTrack.name : 'NO ACTIVE EVENT'}
                </p>
             </div>
             <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]"></div>
          </div>
          
          <div className="p-6 lg:p-8">
             <AdminLapForm />
          </div>
        </div>

        {/* Table Section */}
        <div className="space-y-4 relative z-10">
          <h2 className="text-2xl font-bold text-white italic tracking-tight">
            Manage Entries <span className="text-sm font-normal text-gray-500 not-italic ml-2 font-mono">({entries.length})</span>
          </h2>
          <div className="glass-panel rounded-xl overflow-hidden border border-white/5">
             <AdminLapTable entries={entries} />
          </div>
        </div>

      </div>
    </div>
  )
}
