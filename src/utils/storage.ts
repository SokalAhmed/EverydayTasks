import { Task } from '../types';
import { getTodayString, addDays } from './dateUtils';

const STORAGE_KEY = 'everyday_tasks_offline_data_v1';

export function getInitialDemoTasks(): Task[] {
  const today = getTodayString();
  const yesterday = addDays(today, -1);

  return [
    {
      id: 'task-1',
      title: 'Review quarterly goals & project milestones',
      completed: false,
      date: today,
      originalDate: yesterday,
      isRolledOver: true,
      createdAt: `${yesterday}T14:30:00Z`,
    },
    {
      id: 'task-2',
      title: 'Reply to pending emails & team messages',
      completed: false,
      date: today,
      originalDate: yesterday,
      isRolledOver: true,
      createdAt: `${yesterday}T16:00:00Z`,
    },
    {
      id: 'task-3',
      title: 'Prepare prioritized work list',
      completed: true,
      date: today,
      originalDate: today,
      isRolledOver: false,
      createdAt: `${today}T08:30:00Z`,
      completedAt: `${today}T09:15:00Z`,
    },
    {
      id: 'task-4',
      title: '30-minute afternoon walk & stretch',
      completed: false,
      date: today,
      originalDate: today,
      isRolledOver: false,
      createdAt: `${today}T09:00:00Z`,
    },
  ];
}

/**
 * Loads tasks and automatically rolls over any unfinished tasks from yesterday / past days into today.
 */
export function loadAndRolloverTasks(): { tasks: Task[]; rolledOverCount: number } {
  const today = getTodayString();
  let tasks: Task[] = [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      tasks = JSON.parse(raw);
    } else {
      tasks = getInitialDemoTasks();
      saveTasks(tasks);
    }
  } catch {
    tasks = getInitialDemoTasks();
  }

  // Automatic rollover check:
  // Any uncompleted task from a previous day is retained and moved to today.
  let rolledOverCount = 0;
  let hasChanges = false;

  tasks = tasks.map((task) => {
    // Clean up old demo task title if present
    if (task.title === 'Prepare today’s prioritized work list') {
      hasChanges = true;
      task.title = 'Prepare prioritized work list';
    }

    if (!task.completed && task.date < today) {
      rolledOverCount++;
      hasChanges = true;
      return {
        ...task,
        date: today,
        isRolledOver: true,
      };
    }
    return task;
  });

  if (hasChanges) {
    saveTasks(tasks);
  }

  return { tasks, rolledOverCount };
}

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error('Failed to save tasks to localStorage', err);
  }
}
