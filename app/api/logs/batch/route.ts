import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { auth } from "@/lib/auth";

const logSchema = z.object({
  level: z.enum(["DEBUG", "INFO", "WARN", "ERROR", "AUDIT"]),
  message: z.string(),
  context: z.any().optional(),
  stack: z.string().optional(),
  platform: z.enum(["web", "mobile", "server"]),
  createdAt: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : new Date())),
});

const batchSchema = z.array(logSchema);

export async function POST(req: Request) {
  try {
    const session = await auth();

    const body = await req.json();
    const logs = batchSchema.parse(body);

    // Associate logs with the current user if authenticated
    // AND map fields to match the Prisma model (context/stack -> meta)
    const logsToCreate = logs.map((log) => ({
      level: log.level,
      message: log.message,
      platform: log.platform,
      createdAt: log.createdAt,
      userId: session?.user?.id || null,
      meta:
        log.context || log.stack
          ? {
              context: log.context || null,
              stack: log.stack || null,
            }
          : undefined,
    }));

    await prisma.systemLog.createMany({
      data: logsToCreate,
    });

    return NextResponse.json({ success: true, count: logs.length }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Log batch sync error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
