const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'screenshot@dummy.com';
  
  // Clean up if it exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    await prisma.user.delete({ where: { email } });
    console.log('Deleted existing dummy user.');
  }

  const hashedPassword = await bcrypt.hash('dummy123', 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: 'Nitin Jaiswal',
      publicToken: 'dummy-token-' + Date.now(),
      onboarded: true,
      emailVerified: new Date(),
      plan: 'pro_yearly',
      settings: {
        create: {
          dob: new Date('2000-01-01'),
          theme: 'dark-minimal',
          showLifeGrid: true,
          showYearGrid: true,
          showAgeStats: true,
          yearGridMode: 'weeks'
        }
      }
    }
  });

  console.log('Created user:', user.email);

  // Create Habits
  const habitsData = [
    { title: 'Morning Meditation', scheduledTime: '07:00 AM' },
    { title: 'Exercise 30 min', scheduledTime: '08:00 AM' },
    { title: 'Read 20 pages', scheduledTime: '08:00 PM' },
    { title: 'Learn Spanish', scheduledTime: '06:00 PM' }
  ];

  const habits = [];
  for (const h of habitsData) {
    const habit = await prisma.habit.create({
      data: {
        userId: user.id,
        title: h.title,
        scheduledTime: h.scheduledTime,
        isActive: true,
      }
    });
    habits.push(habit);
  }
  
  console.log('Created habits.');

  // Create Habit Logs for the last 60 days
  const logsToCreate = [];
  const today = new Date();
  
  for (let i = 0; i < 60; i++) {
    const logDate = new Date(today);
    logDate.setDate(today.getDate() - i);
    
    for (const habit of habits) {
      let isDone = false;
      
      if (habit.title === 'Morning Meditation') {
        isDone = true; // Perfect streak
      } else if (habit.title === 'Exercise 30 min') {
        isDone = i !== 5 && i !== 12 && i !== 28; // Missed a few days
      } else if (habit.title === 'Read 20 pages') {
        isDone = i <= 21; // 21 day streak
      } else if (habit.title === 'Learn Spanish') {
        isDone = Math.random() > 0.3; // 70% success
      }

      if (isDone) {
        logsToCreate.push({
          habitId: habit.id,
          userId: user.id,
          date: logDate,
          done: true
        });
      }
    }
  }

  await prisma.habitLog.createMany({
    data: logsToCreate
  });
  console.log(`Created ${logsToCreate.length} habit logs.`);

  // Create Reminders (Events/Important Dates)
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 5);
  
  const lastWeek = new Date(today);
  lastWeek.setDate(today.getDate() - 4);

  const monthEnd = new Date(today);
  monthEnd.setDate(today.getDate() + 15);

  await prisma.reminder.createMany({
    data: [
      {
        userId: user.id,
        title: 'Project Deadline',
        description: 'Submit final report for the new app update',
        startDate: nextWeek,
        endDate: nextWeek,
        isFullDay: true,
        markerType: 'badge',
        markerColor: '#FF3B30', // Red
        priority: 4,
        isImportant: true
      },
      {
        userId: user.id,
        title: 'Doctor Appointment',
        description: 'Annual checkup at City Hospital',
        startDate: tomorrow,
        endDate: tomorrow,
        startTime: '10:00',
        endTime: '11:00',
        isFullDay: false,
        markerType: 'dot',
        markerColor: '#34C759', // Green
        priority: 2
      },
      {
        userId: user.id,
        title: 'Vacation Trip',
        description: 'Trip to Goa with friends',
        startDate: lastWeek,
        endDate: monthEnd,
        isFullDay: true,
        markerType: 'fill',
        markerColor: '#007AFF', // Blue
        priority: 3
      }
    ]
  });
  console.log('Created Reminders (Events/Tasks).');


  // Create Goals & SubGoals
  const fitnessGoal = await prisma.goal.create({
    data: {
      userId: user.id,
      title: 'Lose 10 Kgs & Get Fit',
      category: 'Health',
      description: 'Reach my target weight of 70 Kgs',
      progress: 60,
      isPinned: true,
      targetDeadline: new Date('2026-12-31')
    }
  });

  await prisma.subGoal.createMany({
    data: [
      { goalId: fitnessGoal.id, title: 'Join a local gym', isCompleted: true },
      { goalId: fitnessGoal.id, title: 'Workout 4x a week for a month', isCompleted: true },
      { goalId: fitnessGoal.id, title: 'Cut down sugar completely', isCompleted: false },
    ]
  });

  const wealthGoal = await prisma.goal.create({
    data: {
      userId: user.id,
      title: 'Build Startup Revenue to $10k/m',
      category: 'Wealth',
      progress: 40,
      isPinned: false
    }
  });

  await prisma.subGoal.createMany({
    data: [
      { goalId: wealthGoal.id, title: 'Launch App on Play Store', isCompleted: true },
      { goalId: wealthGoal.id, title: 'Get 1000 Premium Users', isCompleted: false },
    ]
  });
  console.log('Created Goals & Subgoals.');

  
  // Create Milestones
  await prisma.milestone.createMany({
    data: [
      { userId: user.id, title: 'Graduate College', age: 22, status: 'achieved', description: 'Finished B.Tech perfectly.' },
      { userId: user.id, title: 'Launch ConsistencyGrid', age: 26, status: 'achieved', description: 'Launched the first version!' },
      { userId: user.id, title: 'Buy a House', age: 30, status: 'targeting' },
      { userId: user.id, title: 'Financial Independence', age: 40, status: 'future' }
    ]
  });
  console.log('Created Milestones.');

  console.log('--- ALL DATA SEEDED SUCCESSFULLY ---');
  console.log('Login with email: screenshot@dummy.com / password: dummy123');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
