import { prisma } from "@/lib/db";

/**
 * Yeni bir iş (Job) için benzersiz ve sıralı bir numara üretir.
 * Format: AS-YYYY-XXXX (Örn: AS-2026-0001)
 */
export async function generateJobNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const yearPrefix = `AS-${currentYear}-`;

  // Bu yılki en yüksek numarayı bul
  const lastJob = await prisma.job.findFirst({
    where: {
      jobNo: {
        startsWith: yearPrefix,
      },
    },
    orderBy: {
      jobNo: 'desc',
    },
    select: {
      jobNo: true,
    },
  });

  let nextSequence = 1;

  if (lastJob?.jobNo) {
    const parts = lastJob.jobNo.split('-');
    const lastSequenceStr = parts[parts.length - 1];
    if (lastSequenceStr) {
      nextSequence = parseInt(lastSequenceStr, 10) + 1;
    }
  }

  const sequenceStr = nextSequence.toString().padStart(4, '0');
  return `${yearPrefix}${sequenceStr}`;
}

/**
 * İş adımları (Step / İş Emri) için hiyerarşik numara üretir.
 * Format: AS-2026-0001-01
 */
export function generateStepNumber(jobNo: string, order: number): string {
  const stepStr = order.toString().padStart(2, '0');
  return `${jobNo}-${stepStr}`;
}

/**
 * Alt adımlar (SubStep / Alt İş Emri) için hiyerarşik numara üretir.
 * Format: AS-2026-0001-01-01
 */
export function generateSubStepNumber(stepNo: string, order: number): string {
  const subStepStr = order.toString().padStart(2, '0');
  return `${stepNo}-${subStepStr}`;
}

/**
 * Tüm hiyerarşiyi toplu olarak hesaplayan yardımcı fonksiyon
 */
export async function updateHierarchyNumbers(jobId: string) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      steps: {
        orderBy: { order: 'asc' },
        include: {
          subSteps: {
            orderBy: { order: 'asc' }
          }
        }
      }
    }
  });

  if (!job || !job.jobNo) return;

  for (const step of job.steps) {
    const stepNo = generateStepNumber(job.jobNo, step.order);
    
    // StepNo'yu veritabanına kaydetmek isterseniz (şema güncellendikten sonra)
    // await prisma.jobStep.update({ where: { id: step.id }, data: { stepNo } });

    for (const subStep of step.subSteps) {
      const subStepNo = generateSubStepNumber(stepNo, subStep.order);
      // await prisma.jobSubStep.update({ where: { id: subStep.id }, data: { subStepNo } });
    }
  }
}
