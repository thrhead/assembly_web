import { prisma } from "@/lib/db";

/**
 * Yeni bir iş için benzersiz bir proje numarası üretir.
 * Format: JOB-YYYY-XXXX (Örn: JOB-2024-0001)
 */
export async function generateJobNumber(projectNo?: string | null): Promise<string> {
  // 1. Eğer proje numarası varsa, Proje bazlı WO üret (PRJ-XXX-WO-01)
  if (projectNo) {
    const jobs = await prisma.job.findMany({
      where: {
        projectNo: projectNo,
        jobNo: {
          contains: '-WO-'
        }
      },
      select: {
        jobNo: true
      }
    });

    let maxSequence = 0;
    const woRegex = /-WO-(\d+)$/;

    jobs.forEach(job => {
      if (job.jobNo) {
        const match = job.jobNo.match(woRegex);
        if (match && match[1]) {
          const seq = parseInt(match[1], 10);
          if (seq > maxSequence) maxSequence = seq;
        }
      }
    });

    const nextSequence = maxSequence + 1;
    // WO-01, WO-02... şeklinde
    const sequenceStr = nextSequence.toString().padStart(2, '0');
    return `${projectNo}-WO-${sequenceStr}`;
  }

  // 2. Proje numarası yoksa, Global JOB üret (JOB-2024-0001)
  const currentYear = new Date().getFullYear();
  const yearPrefix = `JOB-${currentYear}-`;

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
    const lastSequenceStr = lastJob.jobNo.split('-').pop();
    if (lastSequenceStr) {
      nextSequence = parseInt(lastSequenceStr, 10) + 1;
    }
  }

  const sequenceStr = nextSequence.toString().padStart(4, '0');
  return `${yearPrefix}${sequenceStr}`;
}

/**
 * İş adımları ve alt adımlar için hiyerarşik numaralar üretir.
 * @param jobNo Ana iş numarası
 * @param stepOrder Adım sırası
 * @param subStepOrder (Opsiyonel) Alt adım sırası
 */
export function formatTaskNumber(jobNo: string, stepOrder: number, subStepOrder?: number): string {
  // Issue #19: PRJ-2026-00125-WO-03-SUB-02
  // jobNo zaten "PRJ-2026-00125-WO-03" formatında geliyorsa, sadece SUB ekleyeceğiz.

  // Eğer jobNo'da zaten SUB varsa (ki olmamalı, bu jobNo)

  const stepStr = stepOrder.toString().padStart(2, '0');

  if (subStepOrder !== undefined) {
    const subStepStr = subStepOrder.toString().padStart(2, '0');
    // Adım -> Alt Adım: ...-SUB-01-02 gibi mi yoksa ...-SUB-01-SUB-02 mi?
    // Kullanıcı talebi: PRJ...-WO-03-SUB-02 (Bu alt iş emri)
    // Ana iş emri: ...-WO-03
    // Alt iş (step) emri muhtemelen ...-WO-03-SUB-01
    // Alt-alt iş (substep) emri muhtemelen ...-WO-03-SUB-01-01 veya ...-SUB-01-SUB-01?

    // Varsayım: Step -> SUB-XX, SubStep -> SUB-XX-YY
    return `${jobNo}-SUB-${stepStr}-${subStepStr}`;
  }

  return `${jobNo}-SUB-${stepStr}`;
}