import { z } from "zod"

export const lapEntrySchema = z.object({
  id: z.string().optional(),
  racingAlias: z.string().min(1, "Racing alias is required"),
  crewName: z.string().optional().nullable(),
  carName: z.string().min(1, "Car name is required"),
  stageLevel: z.enum(["Stage 1", "Stage 2", "Stage 3"]),
  lapTimeDisplay: z.string().min(1, "Lap time is required").regex(/^(\d+:)?[0-5]?\d[:.]\d{3}$/, "Invalid time format (e.g. 1:23:456 or 1:23.456)"),
  clipUrl: z.string().url("Invalid URL").optional().nullable().or(z.literal("")),
  notes: z.string().optional().nullable(),
  verifiedAt: z.string().optional().nullable(), // Passed as ISO string from frontend form usually
})

export type LapEntryFormData = z.infer<typeof lapEntrySchema>
