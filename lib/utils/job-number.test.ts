import { vi, describe, it, expect, afterEach } from 'vitest';
import { generateJobNumber, formatTaskNumber } from './job-number';
import { prisma } from '@/lib/db';

vi.mock('@/lib/db', () => ({
    prisma: {
        job: {
            findMany: vi.fn(),
            findFirst: vi.fn(),
        },
    },
}));

describe('Job Number Utils', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('generateJobNumber', () => {
        it('should generate project-based number when projectNo is provided', async () => {
            // Mock existing jobs
            (prisma.job.findMany as any).mockResolvedValue([
                { jobNo: 'PRJ-123-WO-01' },
                { jobNo: 'PRJ-123-WO-03' },
            ]);

            const result = await generateJobNumber('PRJ-123');

            expect(prisma.job.findMany).toHaveBeenCalledWith({
                where: {
                    projectNo: 'PRJ-123',
                    jobNo: { contains: '-WO-' },
                },
                select: { jobNo: true },
            });
            expect(result).toBe('PRJ-123-WO-04');
        });

        it('should generate first project-based number if no WOs exist', async () => {
            (prisma.job.findMany as any).mockResolvedValue([]);

            const result = await generateJobNumber('PRJ-999');

            expect(result).toBe('PRJ-999-WO-01');
        });

        it('should generate global number when projectNo is null', async () => {
            const currentYear = new Date().getFullYear();
            (prisma.job.findFirst as any).mockResolvedValue({
                jobNo: `JOB-${currentYear}-0005`,
            });

            const result = await generateJobNumber(null);

            expect(prisma.job.findFirst).toHaveBeenCalledWith({
                where: { jobNo: { startsWith: `JOB-${currentYear}-` } },
                orderBy: { jobNo: 'desc' },
                select: { jobNo: true },
            });
            expect(result).toBe(`JOB-${currentYear}-0006`);
        });

        it('should generate first global number if no jobs exist for year', async () => {
            const currentYear = new Date().getFullYear();
            (prisma.job.findFirst as any).mockResolvedValue(null);

            const result = await generateJobNumber(undefined); // Testing undefined as null equivalent if not handled strictly

            expect(result).toBe(`JOB-${currentYear}-0001`);
        });
    });

    describe('formatTaskNumber', () => {
        it('should format task number correctly', () => {
            const result = formatTaskNumber('JOB-100', 1);
            expect(result).toBe('JOB-100-SUB-01');
        });

        it('should format sub-task number correctly', () => {
            const result = formatTaskNumber('JOB-100', 2, 3);
            expect(result).toBe('JOB-100-SUB-02-03');
        });

        it('should pad single digits with zero', () => {
            const result = formatTaskNumber('JOB-100', 5, 9);
            expect(result).toBe('JOB-100-SUB-05-09');
        });
    });
});
