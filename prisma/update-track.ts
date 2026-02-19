
import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const prisma = new PrismaClient()

async function main() {
  const activeTrack = await prisma.track.findFirst({
    where: { isActive: true },
  })

const TARGET_TRACK_NAME = 'MORNINGWOOD'

  if (activeTrack) {
    if (activeTrack.name === TARGET_TRACK_NAME) {
      console.log(`Track is already updated to ${TARGET_TRACK_NAME}`)
    } else {
      await prisma.track.update({
        where: { id: activeTrack.id },
        data: { name: TARGET_TRACK_NAME },
      })
      console.log(
        `Updated track ${activeTrack.id} from '${activeTrack.name}' to '${TARGET_TRACK_NAME}'`
      )
    }
  } else {
    // If no active track, create one
    await prisma.track.create({
      data: {
        name: TARGET_TRACK_NAME,
        isActive: true,
        location: 'Unknown',
      },
    })
    console.log(`Created new track: ${TARGET_TRACK_NAME}`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
