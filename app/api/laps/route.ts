import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { lapEntrySchema } from "@/lib/validations/lap"
import { parseLapTimeToMs } from "@/lib/lapTime"
import { sseBroadcaster } from "@/lib/sse"

// Helper to check admin session
async function isAdmin() {
  const session = await getSession()
  return session && session.role === "admin"
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const json = await req.json()
    const result = lapEntrySchema.safeParse(json)

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      )
    }

    const { racingAlias, crewName, carName, stageLevel, lapTimeDisplay, clipUrl, notes, verifiedAt } = result.data

    let lapTimeMs = 0
    try {
      lapTimeMs = parseLapTimeToMs(lapTimeDisplay)
    } catch (e) {
      return NextResponse.json({ error: "Invalid lap time format" }, { status: 400 })
    }

    const activeTrack = await prisma.track.findFirst({
      where: { isActive: true },
    })

    if (!activeTrack) {
      return NextResponse.json({ error: "No active track found" }, { status: 404 })
    }

    const newEntry = await prisma.lapEntry.create({
      data: {
        trackId: activeTrack.id,
        racingAlias,
        crewName: crewName || null,
        carName,
        stageLevel, 
        lapTimeMs,
        lapTimeDisplay,
        clipUrl: clipUrl || null,
        notes: notes || null,
        verifiedAt: verifiedAt ? new Date(verifiedAt) : new Date(),
      },
    })
    
    // Broadcast Update
    sseBroadcaster.broadcast("leaderboard_updated", {
        trackId: activeTrack.id,
        reason: "create", 
        entryId: newEntry.id,
        updatedAt: new Date(),
    })

    return NextResponse.json(newEntry, { status: 201 })
  } catch (error) {
    console.error("Failed to create entry:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const json = await req.json()
    if (!json.id) return NextResponse.json({ error: "ID is required" }, { status: 400 })

    const result = lapEntrySchema.partial().safeParse(json)

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      )
    }

    const { racingAlias, crewName, carName, stageLevel, lapTimeDisplay, clipUrl, notes, verifiedAt } = result.data
    
    let lapTimeMs = undefined;
    if (lapTimeDisplay) {
         try {
            lapTimeMs = parseLapTimeToMs(lapTimeDisplay)
        } catch (e) {
            return NextResponse.json({ error: "Invalid lap time format" }, { status: 400 })
        }
    }

    const updateData: any = {
        ...(racingAlias && { racingAlias }),
        ...(crewName !== undefined && { crewName }),
        ...(carName && { carName }),
        ...(stageLevel && { stageLevel }),
        ...(lapTimeDisplay && { lapTimeDisplay }),
        ...(lapTimeMs !== undefined && { lapTimeMs }),
        ...(clipUrl !== undefined && { clipUrl }),
        ...(notes !== undefined && { notes }),
        ...(verifiedAt !== undefined && { verifiedAt: verifiedAt ? new Date(verifiedAt) : null }),
    }

    const updated = await prisma.lapEntry.update({
      where: { id: json.id },
      data: updateData,
    })
    
    // Broadcast Update
    sseBroadcaster.broadcast("leaderboard_updated", {
        trackId: updated.trackId,
        reason: "update", 
        entryId: updated.id,
        updatedAt: new Date(),
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Update error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 })

    const deleted = await prisma.lapEntry.delete({
      where: { id },
    })
    
    // Broadcast Update
    sseBroadcaster.broadcast("leaderboard_updated", {
        trackId: deleted.trackId,
        reason: "delete", 
        entryId: deleted.id,
        updatedAt: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
