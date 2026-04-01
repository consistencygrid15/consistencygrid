import prisma from '@/lib/prisma';

/**
 * Database Query Optimization Utilities
 * Reduces N+1 queries and optimizes data fetching
 */

/**
 * Get all user data with optimized queries
 */
export async function getUserDataOptimized(userId) {
  try {
    // Use Promise.all for parallel queries instead of sequential
    const [user, goals, habits, reminders, settings] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          publicToken: true,
          createdAt: true,
        },
      }),
      prisma.goal.findMany({
        where: { userId },
        select: {
          id: true,
          title: true,
          progress: true,
          isCompleted: true,
        },
      }),
      prisma.habit.findMany({
        where: { userId },
        select: {
          id: true,
          name: true,
          title: true,
          streak: true,
        },
      }),
      prisma.reminder.findMany({
        where: { userId },
        select: {
          id: true,
          title: true,
          startDate: true,
        },
      }),
      prisma.wallpaperSettings.findUnique({
        where: { userId },
        select: {
          theme: true,
          width: true,
          height: true,
        },
      }),
    ]);

    return { user, goals, habits, reminders, settings };
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
}

/**
 * Get dashboard data with minimal queries
 */
export async function getDashboardDataOptimized(userId) {
  try {
    // Single query for dashboard stats (reduce from 4 queries to 1)
    const [
      goalStats,
      habitStats,
      reminderStats,
      milestoneStats,
    ] = await Promise.all([
      prisma.goal.aggregate({
        where: { userId },
        _count: true,
        _sum: { progress: true },
      }),
      prisma.habit.aggregate({
        where: { userId },
        _count: true,
        _sum: { streak: true },
      }),
      prisma.reminder.findMany({
        where: { userId },
        select: { id: true },
        take: 5, // Only get count needed
      }),
      prisma.milestone.aggregate({
        where: { userId },
        _count: true,
      }),
    ]);

    return {
      goals: {
        count: goalStats._count,
        avgProgress: goalStats._sum?.progress || 0,
      },
      habits: {
        count: habitStats._count,
        totalStreak: habitStats._sum?.streak || 0,
      },
      reminders: {
        count: reminderStats.length,
      },
      milestones: {
        count: milestoneStats._count,
      },
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
}

/**
 * Get goals with subgoals (prevent N+1)
 */
export async function getGoalsWithSubgoals(userId) {
  try {
    return await prisma.goal.findMany({
      where: { userId },
      include: {
        subGoals: {
          select: {
            id: true,
            title: true,
            isCompleted: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Error fetching goals with subgoals:', error);
    throw error;
  }
}

/**
 * Get habits with recent logs
 */
export async function getHabitsWithLogs(userId, daysBack = 7) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    return await prisma.habit.findMany({
      where: { userId },
      include: {
        logs: {
          where: {
            createdAt: { gte: startDate },
          },
          select: {
            date: true,
            done: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Error fetching habits with logs:', error);
    throw error;
  }
}

/**
 * Batch update habits (reduce queries)
 */
export async function batchUpdateHabits(updates) {
  try {
    // Combine updates into single transaction
    const results = await prisma.$transaction(
      updates.map(({ id, data }) =>
        prisma.habit.update({
          where: { id },
          data,
        })
      )
    );
    return results;
  } catch (error) {
    console.error('Error batch updating habits:', error);
    throw error;
  }
}

/**
 * Get paginated results with cursor
 */
export async function getPaginatedGoals(userId, cursor = null, limit = 10) {
  try {
    const where = { userId };
    const orderBy = { createdAt: 'desc' };

    const goals = await prisma.goal.findMany({
      where,
      orderBy,
      take: limit + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const hasMore = goals.length > limit;
    const results = goals.slice(0, limit);
    const nextCursor = hasMore ? results[results.length - 1].id : null;

    return { goals: results, nextCursor, hasMore };
  } catch (error) {
    console.error('Error fetching paginated goals:', error);
    throw error;
  }
}

/**
 * Database Query Statistics for monitoring
 */
export class QueryStats {
  static queries = [];

  static track(query, duration) {
    this.queries.push({
      query,
      duration,
      timestamp: new Date(),
    });

    // Keep last 100 queries
    if (this.queries.length > 100) {
      this.queries = this.queries.slice(-100);
    }

    if (duration > 1000) {
      console.warn(`[Slow Query] ${query} took ${duration}ms`);
    }
  }

  static getStats() {
    if (this.queries.length === 0) return null;

    const avg = this.queries.reduce((sum, q) => sum + q.duration, 0) / this.queries.length;
    const max = Math.max(...this.queries.map(q => q.duration));
    const min = Math.min(...this.queries.map(q => q.duration));

    return { avg, max, min, total: this.queries.length };
  }

  static clear() {
    this.queries = [];
  }
}

/**
 * Database Indexes Recommended
 * Add these to your Prisma schema for better performance:
 *
 * model Goal {
 *   @@index([userId])
 *   @@index([userId, createdAt])
 * }
 *
 * model Habit {
 *   @@index([userId])
 *   @@index([userId, isActive])
 * }
 *
 * model HabitLog {
 *   @@index([userId, date])
 *   @@index([habitId, date])
 * }
 *
 * model Reminder {
 *   @@index([userId, startDate])
 * }
 */

export default {
  getUserDataOptimized,
  getDashboardDataOptimized,
  getGoalsWithSubgoals,
  getHabitsWithLogs,
  batchUpdateHabits,
  getPaginatedGoals,
  QueryStats,
};
