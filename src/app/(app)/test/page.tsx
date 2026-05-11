import { revalidatePath } from "next/cache";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";

async function deleteAllFinanceData() {
    "use server";

    await prisma.$transaction([
        prisma.notification.deleteMany(),
        prisma.balanceLedgerHistory.deleteMany(),
        prisma.balanceLedger.deleteMany(),
        prisma.splitShare.deleteMany(),
        prisma.settlement.deleteMany(),
        prisma.expense.deleteMany(),
    ]);

    console.log("DELETE SUCCESSFULLY");
    revalidatePath("/");
}

export default function Page() {
    return (
        <div className="flex min-h-[50vh] items-center justify-center p-6">
            <form
                action={deleteAllFinanceData}
                className="rounded-lg border bg-background p-6 shadow-sm"
            >
                <Button type="submit" variant="destructive">
                    Delete all finance data
                </Button>
            </form>
        </div>
    );
}
