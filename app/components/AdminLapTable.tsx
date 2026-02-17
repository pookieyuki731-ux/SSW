"use client"

import { useState } from "react"
import { Pencil, Trash2, X, AlertTriangle } from "lucide-react"
import { AdminLapForm } from "./AdminLapForm"
import { useRouter } from "next/navigation"
import { formatTime } from "@/lib/utils"

export function AdminLapTable({ entries }: { entries: any[] }) {
  const router = useRouter()
  const [editingEntry, setEditingEntry] = useState<any | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!deletingId) return
    try {
        const res = await fetch(`/api/laps?id=${deletingId}`, { method: 'DELETE' })
        if (res.ok) {
            router.refresh()
            setDeletingId(null)
        }
    } catch (e) {
        console.error("Failed to delete", e)
    }
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver / Crew</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Car / Stage</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {entries.length === 0 ? (
               <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                  No entries found.
                </td>
              </tr>
            ) : (
                entries.map((entry, index) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-12 text-center font-mono">
                    {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="font-bold">{entry.racingAlias}</div>
                    {entry.crewName && <div className="text-xs text-gray-500">{entry.crewName}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{entry.carName}</span>
                        <span className="text-xs inline-block px-1.5 py-0.5 rounded bg-gray-100 border w-fit mt-0.5">
                        {entry.stageLevel}
                        </span>
                    </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-mono font-bold text-gray-900">
                    {formatTime(entry.lapTimeMs)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                            <button 
                                onClick={() => setEditingEntry(entry)}
                                className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                                title="Edit"
                            >
                                <Pencil className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => setDeletingId(entry.id)}
                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                title="Delete"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </td>
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
                    <h3 className="text-lg font-bold">Edit Entry</h3>
                    <button onClick={() => setEditingEntry(null)} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6">
                    <AdminLapForm 
                        initialData={editingEntry} 
                        onSuccess={() => setEditingEntry(null)} // Close on success
                        onCancel={() => setEditingEntry(null)}
                    />
                </div>
            </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-red-100 mx-auto flex items-center justify-center mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Entry?</h3>
                <p className="text-sm text-gray-500 mb-6">
                    Are you sure you want to delete this lap time? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-center">
                    <button 
                        onClick={() => setDeletingId(null)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleDelete}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
      )}
    </>
  )
}
