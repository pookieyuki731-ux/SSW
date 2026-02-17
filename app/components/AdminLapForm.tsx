"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { clsx } from "clsx"
import { useRouter } from "next/navigation"
import { lapEntrySchema, type LapEntryFormData } from "@/lib/validations/lap"

export function AdminLapForm({ 
  initialData, 
  onSuccess, 
  onCancel 
}: { 
  initialData?: LapEntryFormData & { id?: string }, 
  onSuccess?: () => void,
  onCancel?: () => void
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LapEntryFormData>({
    resolver: zodResolver(lapEntrySchema),
    defaultValues: initialData || {
      racingAlias: "",
      crewName: "",
      carName: "",
      stageLevel: "Stage 2",
      lapTimeDisplay: "",
      clipUrl: "",
      notes: "",
      verifiedAt: new Date().toISOString(),
    },
  })

  const onSubmit = async (data: LapEntryFormData) => {
    setIsSubmitting(true)
    setError(null)
    try {
      const isEdit = !!initialData?.id
        const res = await fetch("/api/laps", {
            method: isEdit ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(isEdit ? { ...data, id: initialData.id } : data),
        })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || "Something went wrong")
      }

      router.refresh()
      if (!isEdit) reset() // Reset only on create
      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-900/10 border border-red-500/20 rounded-md font-mono">
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Alias */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-1">Driver Alias *</label>
          <input
            {...register("racingAlias")}
            className={clsx(
              "input-dark w-full rounded p-2.5 font-bold tracking-tight",
              errors.racingAlias && "!border-red-500 !ring-red-500/20"
            )}
            placeholder="e.g. TheStig"
          />
          {errors.racingAlias && <p className="text-red-500 text-xs mt-1 font-mono">{errors.racingAlias.message}</p>}
        </div>

        {/* Crew */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-1">Crew / Team</label>
          <input
            {...register("crewName")}
            className="input-dark w-full rounded p-2.5"
            placeholder="Optional"
          />
        </div>

        {/* Car */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-1">Vehicle *</label>
          <input
            {...register("carName")}
            className="input-dark w-full rounded p-2.5 font-semibold"
            placeholder="e.g. Mazda RX-7"
          />
          {errors.carName && <p className="text-red-500 text-xs mt-1 font-mono">{errors.carName.message}</p>}
        </div>

        {/* Stage - Restricted Enums */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-1">Class / Stage</label>
          <div className="relative">
            <select
                {...register("stageLevel")}
                className="input-dark w-full rounded p-2.5 appearance-none cursor-pointer"
            >
                <option value="Stage 1">Stage 1 (Street)</option>
                <option value="Stage 2">Stage 2 (Club)</option>
                <option value="Stage 3">Stage 3 (Pro)</option>
                <option value="Unlimited">Unlimited (Open)</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

         {/* Lap Time */}
         <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-1">Time (MM:SS:mmm) *</label>
          <input
            {...register("lapTimeDisplay")}
            placeholder="1:23:456"
            className="input-dark w-full rounded p-2.5 font-mono text-indigo-400 tracking-wider font-bold"
          />
          {errors.lapTimeDisplay && <p className="text-red-500 text-xs mt-1 font-mono">{errors.lapTimeDisplay.message}</p>}
        </div>

         {/* Clip URL */}
         <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-1">Evidence URL</label>
          <input
            {...register("clipUrl")}
            type="url"
            className="input-dark w-full rounded p-2.5 text-xs text-blue-400 underline decoration-blue-400/30"
            placeholder="https://youtube.com/..."
          />
          {errors.clipUrl && <p className="text-red-500 text-xs mt-1 font-mono">{errors.clipUrl.message}</p>}
        </div>
        
         {/* Verified At */}
         <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                 <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-1">Verified Date</label>
                <input
                    {...register("verifiedAt")}
                    className="input-dark w-full rounded p-2.5 font-mono text-xs text-gray-400"
                    placeholder="ISO Date (Optional)"
                />
            </div>
             {/* Notes */}
            <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-1">Marshal Notes</label>
                <input
                    {...register("notes")}
                    className="input-dark w-full rounded p-2.5 text-sm"
                    placeholder="Penalty details, weather, etc."
                />
            </div>
        </div>

      </div>

      <div className="flex justify-end gap-4 pt-6 border-t border-white/10 mt-6">
        {onCancel && (
            <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-xs font-mono uppercase tracking-wider text-gray-400 hover:text-white transition-colors border border-transparent hover:border-white/10 rounded"
            >
            Cancel
            </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary relative overflow-hidden group min-w-[140px]"
        >
             <span className="relative z-10 font-bold italic tracking-wide">
             {isSubmitting ? "PROCESS..." : (initialData?.id ? "UPDATE ENTRY" : "SUBMIT TIME")}
             </span>
        </button>
      </div>
    </form>
  )
}
