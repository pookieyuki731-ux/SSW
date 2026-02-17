'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Unlock, ShieldCheck, Plus, LogOut } from 'lucide-react'

interface AdminControlsProps {
  isAdmin: boolean
}

export function AdminControls({ isAdmin }: AdminControlsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })

      if (res.ok) {
        setIsOpen(false)
        setCode('')
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || 'Invalid code')
      }
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleLock = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.refresh()
  }

  if (isAdmin) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1 bg-red-900/30 border border-red-500/50 rounded-full text-red-400 text-xs font-mono uppercase tracking-wider animate-pulse">
            <ShieldCheck className="w-3 h-3" />
            <span>Admin Mode</span>
        </div>
        
        <button
          onClick={handleLock}
          className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-md transition-colors text-sm font-medium border border-gray-700"
          title="Exit Admin Mode"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Lock</span>
        </button>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-900/50 hover:bg-gray-800 text-gray-500 hover:text-gray-300 rounded-md transition-colors text-sm border border-transparent hover:border-gray-700"
        title="Admin Access"
      >
        <Lock className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#15151e] border border-gray-800 rounded-xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
            <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white"
            >
                ✕
            </button>
            
            <div className="mb-6 text-center">
                <div className="mx-auto w-12 h-12 bg-indigo-900/30 rounded-full flex items-center justify-center mb-4">
                    <ShieldCheck className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Security Clearance</h3>
                <p className="text-gray-400 text-sm mt-1">Enter admin code to unlock controls.</p>
            </div>

            <form onSubmit={handleUnlock} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Admin Code"
                  className="w-full bg-black/30 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-center tracking-widest"
                  autoFocus
                />
                {error && <p className="text-red-500 text-xs mt-2 text-center">{error}</p>}
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <>
                        <Unlock className="w-4 h-4" />
                        AUTHENTICATE
                    </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
