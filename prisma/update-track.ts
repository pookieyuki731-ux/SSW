
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const activeTrack = await prisma.track.findFirst({
    where: { isActive: true },
  })

  if (activeTrack) {
    if (activeTrack.name === 'DOUBLE TROUBLE') {
        console.log('Track is already updated to DOUBLE TROUBLE')
    } else {
        await prisma.track.update({
        where: { id: activeTrack.id },
        data: { name: 'DOUBLE TROUBLE' },
        })
        console.log(`Updated track ${activeTrack.id} from '${activeTrack.name}' to 'DOUBLE TROUBLE'`)
    }
  } else {
    // If no active track, create one
    await prisma.track.create({
      data: {
        name: 'DOUBLE TROUBLE',
        isActive: true,
        location: 'Unknown',
      },
    })
    console.log('Created new track: DOUBLE TROUBLE')
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
