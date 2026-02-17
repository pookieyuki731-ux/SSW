'use client'

import { logout } from '@/app/actions'
import { LogOut } from 'lucide-react'

export function LogoutButton() {
  return (
    <button 
      onClick={() => logout()} 
      className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-500/80 hover:text-red-400 hover:bg-red-500/10 px-3 py-1.5 rounded transition-all group"
    >
      <span>Disconnect</span>
      <LogOut className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
    </button>
  )
}
