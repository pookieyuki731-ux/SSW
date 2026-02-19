import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const prisma = new PrismaClient()

async function main() {
  const defaultTrackName = 'MORNINGWOOD'

  console.log('Using DATABASE_URL:', process.env.DATABASE_URL)

  // Check if track exists
  const existingTrack = await prisma.track.findFirst({
    where: { isActive: true },
  })

  if (!existingTrack) {
    const track = await prisma.track.create({
      data: {
        name: defaultTrackName,
        location: 'Unknown',
        isActive: true,
      },
    })
    console.log(`Created new default track: ${track.name}`)
  } else {
    console.log(`Track already exists: ${existingTrack.name}`)
    // Update name if different
    if (existingTrack.name !== defaultTrackName) {
      await prisma.track.update({
        where: { id: existingTrack.id },
        data: { name: defaultTrackName },
      })
      console.log(`Updated track name to: ${defaultTrackName}`)
    }
  }

  console.log('Seeding completed.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
