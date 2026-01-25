import { prisma } from "@/lib/db"

export async function getAdminDashboardData() {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const [
    activeWorkers,
    todaysCosts,
    pendingApprovalsCount,
    pendingCostsAgg,
    approvedCostsAgg,
    weeklyCompletedSteps
  ] = await Promise.all([
    prisma.user.findMany({
      where: {
        role: 'WORKER',
        isActive: true,
        assignedJobs: {
          some: {
            job: {
              status: 'IN_PROGRESS'
            }
          }
        }
      },
      take: 5,
      select: {
        id: true,
        name: true,
        avatarUrl: true
      }
    }),
    prisma.costTracking.findMany({
      where: {
        date: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      },
      select: {
        amount: true
      }
    }),
    prisma.approval.count({
      where: {
        status: 'PENDING'
      }
    }),
    prisma.costTracking.aggregate({
      where: { status: 'PENDING' },
      _sum: { amount: true }
    }),
    prisma.costTracking.aggregate({
      where: { status: 'APPROVED' },
      _sum: { amount: true }
    }),
    prisma.jobStep.findMany({
      where: {
        isCompleted: { equals: true },
        completedAt: {
          gte: sevenDaysAgo
        }
      },
      select: {
        completedAt: true
      }
    })
  ])

  const totalCostToday = todaysCosts.reduce((sum, cost) => sum + cost.amount, 0)
  const dailyBudget = 2000
  const budgetPercentage = Math.min(Math.round((totalCostToday / dailyBudget) * 100), 100)

  // Group jobs by date
  const weeklyStats = new Array(7).fill(0).map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i)) // Last 7 days including today
    const dateKey = d.toISOString().split('T')[0]
    const displayDate = d.toLocaleDateString('tr-TR', { weekday: 'short' })

    const count = weeklyCompletedSteps.filter(step =>
      step.completedAt && step.completedAt.toISOString().split('T')[0] === dateKey
    ).length

    return {
      name: displayDate,
      count
    }
  })

  return {
    activeWorkers,
    totalCostToday,
    budgetPercentage,
    pendingApprovalsCount,
    totalPendingCost: pendingCostsAgg._sum.amount || 0,
    totalApprovedCost: approvedCostsAgg._sum.amount || 0,
    weeklyStats
  }
}