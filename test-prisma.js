const { PrismaClient } = require('@prisma/client')
// Initialize without passing anything
const prisma = new PrismaClient()
async function test() {
  try {
    const users = await prisma.user.findMany()
    console.log("Success! Users:", users)
  } catch (e) {
    console.error("Failed:", e.message)
  }
}
test()
