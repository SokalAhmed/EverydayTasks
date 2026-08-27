export interface Task {
  id: string;
  title: string;
  completed: boolean;
  date: string; // YYYY-MM-DD
  originalDate: string; // YYYY-MM-DD (the date it was first added)
  isRolledOver: boolean; // true if it was carried over from yesterday/prior day
  createdAt: string;
  completedAt?: string;
}
