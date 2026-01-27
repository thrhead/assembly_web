import { verifyAdminOrManager } from "@/lib/auth-helper";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const session = await verifyAdminOrManager(req);

        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const [totalJobs, activeTeams, completedJobs, pendingJobs] = await Promise.all([
            prisma.job.count(),
            prisma.team.count({
                where: {
                    isActive: true,
                },
            }),
            prisma.job.count({
                where: {
                    status: "COMPLETED",
                },
            }),
            prisma.job.count({
                where: {
                    status: "PENDING",
                },
            }),
        ]);

        return NextResponse.json({
            totalJobs,
            activeTeams,
            completedJobs,
            pendingJobs,
        });
    } catch (error: any) {
        console.error("Admin stats fetch error:", error.message);
        return NextResponse.json({
            totalJobs: 0,
            activeTeams: 0,
            completedJobs: 0,
            pendingJobs: 0,
            error: "Data fetch failed"
        }, { status: 200 });
    }
}
