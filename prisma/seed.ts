import prisma from "@/lib/prisma";

async function main() {
    try {
        await prisma.expense.deleteMany();
        await prisma.splitShare.deleteMany();
        await prisma.settlement.deleteMany();
        await prisma.balanceLedgerHistory.deleteMany();
        await prisma.balanceLedger.deleteMany();
        await prisma.notification.deleteMany();

        console.log("DELETE SUCCESSFULLY");
    } catch (error) {
        console.error("Lỗi khi seed:", error);
    }
}

main()
    .catch((e) => {
        console.error(" Lỗi khi seed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
