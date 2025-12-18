const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
    await prisma.orderProduct.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.restaurant.deleteMany();
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); })