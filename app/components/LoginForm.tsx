'use client'

import { useActionState } from 'react'
import { login } from '@/app/actions'
 
const initialState = {
  message: '',
}
 
export function LoginForm() {
  const [state, formAction] = useActionState(login, initialState)
 
  return (
    <form action={formAction} className="space-y-6 w-full">
      <div className="relative">
        <label htmlFor="code" className="block text-xs font-mono uppercase tracking-widest text-indigo-300 mb-2">Security Clearance Code</label>
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg blur opacity-25 group-focus-within:opacity-100 transition duration-500"></div>
          <input 
            type="password" 
            name="code" 
            id="code" 
            required 
            className="input-dark relative block w-full rounded-md h-12 md:h-14 px-4 bg-[#0e0e12] text-white border-gray-800 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono tracking-widest text-center text-lg"
            placeholder="ACCESS CODE"
          />
        </div>
      </div>
      
      <button 
        type="submit" 
        className="w-full relative flex items-center justify-center h-12 md:h-14 px-4 border border-transparent rounded-lg shadow-lg text-sm md:text-base font-bold uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-[#0e0e12] transition-all transform hover:-translate-y-0.5 overflow-hidden group"
      >
        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shine"></span>
        Authenticate
      </button>
      
      {state?.message && (
        <div className="p-3 bg-red-900/20 border border-red-800/50 rounded text-red-400 text-xs text-center font-mono animate-pulse">
            ⚠️ {state.message}
        </div>
      )}
    </form>
  )
}
