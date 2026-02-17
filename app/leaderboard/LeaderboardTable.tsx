'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Video, ShieldCheck, Trophy, Pencil, Trash, Plus } from 'lucide-react'
import { AdminLapForm } from '@/app/components/AdminLapForm'
import { LapEntryFormData } from '@/lib/validations/lap'

// Define the shape of data we need (Frontend view of the Prisma model)
export interface LeaderboardEntry {
  id: string
  racingAlias: string
  crewName: string | null
  carName: string
  stageLevel: string
  lapTimeMs: number
  lapTimeDisplay: string
  gap?: string
  clipUrl: string | null
  verifiedAt: Date | string | null
  notes: string | null
}

interface LeaderboardTableProps {
  initialEntries: LeaderboardEntry[]
  isAdmin: boolean
}

export function LeaderboardTable({ initialEntries, isAdmin }: LeaderboardTableProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<LeaderboardEntry | null>(null)
  
  const filteredEntries = initialEntries.filter(entry => {
    const term = searchTerm.toLowerCase()
    return (
      entry.racingAlias.toLowerCase().includes(term) ||
      (entry.crewName && entry.crewName.toLowerCase().includes(term)) ||
      entry.carName.toLowerCase().includes(term)
    )
  })

  // Format entry for form (ensure types match what AdminLapForm expects)
  const formatForForm = (entry: LeaderboardEntry): LapEntryFormData & { id: string } => {
    return {
      id: entry.id,
      racingAlias: entry.racingAlias,
      crewName: entry.crewName || "",
      carName: entry.carName,
      stageLevel: (entry.stageLevel as "Stage 2" | "Stage 3" | "Unlimited") || "Stage 2",
      lapTimeDisplay: entry.lapTimeDisplay, // Pass raw string, validation will check regex
      clipUrl: entry.clipUrl || "",
      notes: entry.notes || "",
      verifiedAt: entry.verifiedAt ? new Date(entry.verifiedAt).toISOString() : new Date().toISOString()
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}'s entry?`)) return
    
    try {
      const res = await fetch(`/api/laps?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        router.refresh()
      } else {
        alert("Failed to delete")
      }
    } catch {
      alert("Error deleting entry")
    }
  }

  return (
    <div className="w-full">
      {/* Search Bar & Actions */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-500" />
            </div>
            <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md leading-5 bg-gray-900 text-gray-300 placeholder-gray-500 focus:outline-none focus:bg-gray-800 focus:border-red-600 focus:ring-1 focus:ring-red-600 sm:text-sm transition duration-150 ease-in-out"
            placeholder="Search driver, crew, or car..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        
        {isAdmin && (
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors text-sm font-bold shadow-lg shadow-red-900/20"
          >
            <Plus className="w-4 h-4" />
            Add Entry
          </button>
        )}
      </div>
      
      {/* Table Container */}
      <div className="bg-[#15151e] rounded-lg border border-gray-800 shadow-xl overflow-hidden">

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead>
              <tr className="bg-[#1a1a24]">
                <th scope="col" className="px-4 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider w-12">
                  Pos
                </th>
                <th scope="col" className="px-4 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Racing Alias
                </th>
                <th scope="col" className="px-4 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                  Crew
                </th>
                <th scope="col" className="px-4 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Car
                </th>
                <th scope="col" className="px-4 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">
                  Stage
                </th>
                <th scope="col" className="px-4 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Lap Time
                </th>
                <th scope="col" className="px-4 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Gap
                </th>
                <th scope="col" className="px-4 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                  Verified
                </th>
                <th scope="col" className="px-4 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider w-16">
                  Clip
                </th>
                {isAdmin && (
                  <th scope="col" className="px-4 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider w-24">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 bg-[#0e0e12]">
              {filteredEntries.map((entry, index) => {
                const isPodium = index < 3
                return (
                  <tr 
                    key={entry.id} 
                    className={`hover:bg-[#1a1a24] transition-colors duration-150 ${isPodium ? 'bg-[#13131a]' : ''}`}
                  >
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-300">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-md font-bold ${
                        index === 0 ? 'bg-yellow-500 text-black' :
                        index === 1 ? 'bg-gray-400 text-black' :
                        index === 2 ? 'bg-orange-700 text-white' :
                        'text-gray-500'
                      }`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-white font-semibold">
                       <div className="flex items-center gap-2">
                         {entry.racingAlias}
                         {isPodium && <Trophy className={`h-3 w-3 ${
                           index === 0 ? 'text-yellow-500' : 
                           index === 1 ? 'text-gray-400' : 'text-orange-700'
                         }`} />}
                         {entry.notes && (
                          <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] bg-gray-800 text-gray-400 border border-gray-700 ml-2">
                            {entry.notes}
                          </span>
                         )}
                       </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400 hidden sm:table-cell align-middle">
                      <div className="flex items-center h-full">
                        {entry.crewName || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                      {entry.carName}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-400 hidden md:table-cell">
                      <span className="px-2 py-1 rounded-full bg-gray-800 border border-gray-700 text-xs text-gray-300">
                        {entry.stageLevel}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-mono font-bold text-red-500 tracking-wide">
                      {entry.lapTimeDisplay}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-mono text-gray-400 font-medium">
                      {entry.gap}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-500 hidden lg:table-cell">
                      {entry.verifiedAt ? (
                        <div className="flex items-center justify-center gap-1 text-green-500/80" title={new Date(entry.verifiedAt).toLocaleDateString()}>
                           <ShieldCheck className="w-4 h-4" />
                           <span className="text-xs">{new Date(entry.verifiedAt).toLocaleDateString()}</span>
                        </div>
                      ) : (
                        <span className="text-gray-700">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                      {entry.clipUrl ? (
                        <a 
                          href={entry.clipUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center p-1.5 rounded-md hover:bg-red-500/20 text-red-500 transition-colors"
                        >
                          <Video className="w-4 h-4" />
                        </a>
                      ) : (
                        <span className="text-gray-800">-</span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setEditingEntry(entry)}
                            className="p-1.5 text-gray-400 hover:text-indigo-400 hover:bg-gray-800 rounded-md transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(entry.id, entry.racingAlias)}
                            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-md transition-colors"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                )
              })}
              {filteredEntries.length === 0 && (
                 <tr>
                    <td colSpan={isAdmin ? 9 : 8} className="px-4 py-12 text-center text-sm text-gray-500">
                        {searchTerm ? 'No entries match your search.' : 'No entries recorded yet.'}
                    </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

        {/* Add/Edit Modal */}
       {(isAddOpen || editingEntry) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#15151e] border border-gray-800 rounded-xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200 my-8">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">
                {editingEntry ? 'Edit Entry' : 'Add New Entry'}
              </h3>
              <button 
                onClick={() => {
                  setIsAddOpen(false)
                  setEditingEntry(null)
                }}
                className="text-gray-500 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <AdminLapForm 
              initialData={editingEntry ? formatForForm(editingEntry) : undefined}
              onSuccess={() => {
                setIsAddOpen(false)
                setEditingEntry(null)
                router.refresh()
              }}
              onCancel={() => {
                setIsAddOpen(false)
                setEditingEntry(null)
              }}
            />
          </div>
        </div>
      )}

    </div>
  )
}
