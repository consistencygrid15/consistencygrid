/**
 * Cypress Test Data Factory
 * Create test data for E2E tests
 */

export const testUsers = {
  standard: {
    email: 'test.user@example.com',
    password: 'TestPassword123!',
    name: 'Test User',
  },
  premium: {
    email: 'premium.user@example.com',
    password: 'PremiumPassword123!',
    name: 'Premium User',
  },
  invalid: {
    email: 'invalid',
    password: 'short',
    name: '',
  },
};

export const testGoals = {
  fitness: {
    name: 'Complete 5K Run',
    description: 'Run a 5 kilometer race',
    category: 'Health',
    duration: 30,
    target: 'Complete 1 race',
  },
  learning: {
    name: 'Learn Cypress Testing',
    description: 'Master E2E testing with Cypress',
    category: 'Learning',
    duration: 60,
    target: 'Complete 10 tests',
  },
  work: {
    name: 'Finish Project',
    description: 'Complete Consistency Grid project',
    category: 'Work',
    duration: 90,
    target: 'Deploy to production',
  },
  financial: {
    name: 'Save $5000',
    description: 'Save money for emergency fund',
    category: 'Finance',
    duration: 180,
    target: '$5000',
  },
};

export const testHabits = {
  morning: {
    name: 'Morning Meditation',
    description: '10 minutes of meditation',
    frequency: 'daily',
  },
  exercise: {
    name: 'Exercise',
    description: '30 minutes of physical activity',
    frequency: 'daily',
  },
  reading: {
    name: 'Read',
    description: 'Read for 30 minutes',
    frequency: 'daily',
  },
  journaling: {
    name: 'Journaling',
    description: 'Write in journal',
    frequency: 'daily',
  },
  social: {
    name: 'Social Activity',
    description: 'Spend time with friends/family',
    frequency: 'weekly',
  },
  learning: {
    name: 'Learn Something New',
    description: 'Learn or practice new skill',
    frequency: 'weekly',
  },
};

export const testReminders = {
  morning: {
    title: 'Morning Meditation',
    description: 'Time to meditate',
    time: '06:00',
    frequency: 'daily',
  },
  workout: {
    title: 'Workout Reminder',
    description: 'Time to exercise',
    time: '17:00',
    frequency: 'daily',
  },
  review: {
    title: 'Weekly Review',
    description: 'Review your progress',
    time: '18:00',
    frequency: 'weekly',
  },
};

/**
 * Generate random test data
 */
export function generateTestUser() {
  const timestamp = Date.now();
  return {
    email: `test-${timestamp}@example.com`,
    password: 'TestPassword123!',
    name: `Test User ${timestamp}`,
  };
}

export function generateTestGoal() {
  const names = ['Run', 'Read', 'Learn', 'Save', 'Build', 'Practice'];
  const actions = ['5K', 'a book', 'new skill', 'money', 'project', 'consistency'];
  const randomName = `${names[Math.floor(Math.random() * names.length)]} ${actions[Math.floor(Math.random() * actions.length)]}`;
  
  return {
    name: randomName,
    description: `Test goal: ${randomName}`,
    category: ['Health', 'Learning', 'Work', 'Finance'][Math.floor(Math.random() * 4)],
    duration: Math.floor(Math.random() * 90) + 30,
  };
}

export function generateTestHabit() {
  const names = ['Exercise', 'Meditate', 'Read', 'Journal', 'Code', 'Study'];
  const randomName = names[Math.floor(Math.random() * names.length)];
  
  return {
    name: randomName,
    description: `Daily ${randomName.toLowerCase()}`,
    frequency: Math.random() > 0.5 ? 'daily' : 'weekly',
  };
}

/**
 * Mock API responses
 */
export const mockResponses = {
  loginSuccess: {
    statusCode: 200,
    body: {
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      },
      token: 'mock-jwt-token',
    },
  },
  loginError: {
    statusCode: 401,
    body: {
      error: 'Invalid credentials',
    },
  },
  goalsSuccess: {
    statusCode: 200,
    body: [
      {
        id: '1',
        name: 'Goal 1',
        description: 'Test goal',
        progress: 50,
      },
    ],
  },
  habitsSuccess: {
    statusCode: 200,
    body: [
      {
        id: '1',
        name: 'Habit 1',
        completed: true,
        streak: 5,
      },
    ],
  },
};

export default {
  testUsers,
  testGoals,
  testHabits,
  testReminders,
  generateTestUser,
  generateTestGoal,
  generateTestHabit,
  mockResponses,
};
