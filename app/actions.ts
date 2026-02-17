'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { createSession, getSession, deleteSession } from '@/lib/session'
import { parseLapTimeToMs } from '@/lib/lapTime'

export async function login(prevState: any, formData: FormData) {
  const code = formData.get('code') as string

  const viewerCode = process.env.VIEWER_CODE
  const adminCode = process.env.ADMIN_CODE

  if (code === adminCode) {
    await createSession('admin')
    redirect('/admin')
  } else if (code === viewerCode) {
    await createSession('viewer')
    redirect('/leaderboard')
  } else {
    return { message: 'Invalid access code.' }
  }
}

export async function logout() {
  await deleteSession()
  redirect('/')
}

export async function addLapEntry(formData: FormData) {
  // Verify session
  const session = await getSession();
  if (!session || session.role !== 'admin') {
      throw new Error("Unauthorized");
  }

  // Get Fields
  const racingAlias = formData.get('racingAlias') as string
  const crewName = formData.get('crewName') as string || null
  const carName = formData.get('carName') as string
  const stageLevel = formData.get('stageLevel') as string
  const lapTimeStr = formData.get('lapTime') as string
  const clipUrl = formData.get('clipUrl') as string || null
  const notes = formData.get('notes') as string || null

  let totalMs = 0
  try {
    totalMs = parseLapTimeToMs(lapTimeStr)
  } catch (e) {
    console.error("Failed to parse lap time", e)
    // In a real app we'd return a form error here
    return { error: "Invalid lap time format" }
  }

  // Find active track
  const track = await prisma.track.findFirst({
        where: { isActive: true }
  })

  if (!track) {
      throw new Error("No active track found. Please seed or create a track first.")
  }

  if (totalMs > 0) {
    await prisma.lapEntry.create({
      data: {
        trackId: track.id,
        racingAlias,
        crewName,
        carName,
        stageLevel: stageLevel || "Stage 2",
        lapTimeMs: totalMs,
        lapTimeDisplay: lapTimeStr, 
        clipUrl,
        notes,
        verifiedAt: new Date() // Admin added items are verified by default
      },
    })
    revalidatePath('/leaderboard')
    revalidatePath('/admin')
  }
}

export async function deleteLapEntry(id: string) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
      throw new Error("Unauthorized");
  }

  try {
    await prisma.lapEntry.delete({
        where: { id },
    })
    revalidatePath('/leaderboard')
    revalidatePath('/admin')
  } catch (error) {
      console.error("Failed to delete entry", error)
  }
}
