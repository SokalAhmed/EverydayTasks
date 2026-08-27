import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Calendar,
  RotateCcw,
  Check,
  ListTodo,
} from 'lucide-react';
import { Task } from './types';
import { getTodayString, formatDisplayDate, getDayName, addDays } from './utils/dateUtils';
import { loadAndRolloverTasks, saveTasks } from './utils/storage';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [rolledOverCount, setRolloverCount] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const today = getTodayString();
  const todayDayName = getDayName(today);
  const yesterdayDateStr = addDays(today, -1);
  const yesterdayDayName = getDayName(yesterdayDateStr);

  // On mount and window focus, load tasks and perform automatic rollover
  useEffect(() => {
    const { tasks: loadedTasks, rolledOverCount: count } = loadAndRolloverTasks();
    setTasks(loadedTasks);
    setRolloverCount(count);

    const handleFocus = () => {
      const { tasks: refreshedTasks } = loadAndRolloverTasks();
      setTasks(refreshedTasks);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Sync state changes with localStorage
  const updateTasks = (updated: Task[]) => {
    setTasks(updated);
    saveTasks(updated);
  };

  // Add a new task for today
  const handleAddTask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newTitle.trim();
    if (!trimmed) return;

    const newTask: Task = {
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      title: trimmed,
      completed: false,
      date: today,
      originalDate: today,
      isRolledOver: false,
      createdAt: new Date().toISOString(),
    };

    updateTasks([newTask, ...tasks]);
    setNewTitle('');
    inputRef.current?.focus();
  };

  // Toggle completion
  const handleToggleTask = (id: string) => {
    const updated = tasks.map((t) => {
      if (t.id === id) {
        const nextCompleted = !t.completed;
        return {
          ...t,
          completed: nextCompleted,
          completedAt: nextCompleted ? new Date().toISOString() : undefined,
        };
      }
      return t;
    });
    updateTasks(updated);
  };

  // Delete a task
  const handleDeleteTask = (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    updateTasks(updated);
  };

  // Start editing inline
  const handleStartEdit = (task: Task) => {
    setEditingId(task.id);
    setEditingText(task.title);
  };

  // Save inline edit
  const handleSaveEdit = (id: string) => {
    const trimmed = editingText.trim();
    if (!trimmed) {
      handleDeleteTask(id);
    } else {
      const updated = tasks.map((t) => (t.id === id ? { ...t, title: trimmed } : t));
      updateTasks(updated);
    }
    setEditingId(null);
    setEditingText('');
  };

  // Clear completed tasks
  const handleClearCompleted = () => {
    const updated = tasks.filter((t) => !t.completed);
    updateTasks(updated);
  };

  // Filter tasks for today's view
  const todayTasks = tasks.filter((t) => t.date === today);
  const pendingTasks = todayTasks.filter((t) => !t.completed);
  const completedTasks = todayTasks.filter((t) => t.completed);

  const retainedFromYesterdayCount = todayTasks.filter((t) => t.isRolledOver && !t.completed).length;

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#1f1f1f] flex flex-col font-sans selection:bg-[#c2e7ff] selection:text-[#001d35]">
      {/* Top Simple Header */}
      <header className="w-full bg-white border-b border-[#e1e3e1] sticky top-0 z-10 shadow-xs">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#e8f0fe] text-[#0b57d0] flex items-center justify-center border border-[#c2e7ff] shadow-xs">
              <ListTodo className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#1f1f1f] tracking-tight">{todayDayName}&apos;s Tasks</h1>
              <p className="text-xs text-[#5f6368] flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-[#0b57d0]" />
                <span>{formatDisplayDate(today)}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#f1f3f4] text-[#444746] border border-[#e1e3e1]">
              {pendingTasks.length} {pendingTasks.length === 1 ? 'task' : 'tasks'} remaining
            </span>
          </div>
        </div>
      </header>

      {/* Main Single-Screen Content Container */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 flex flex-col gap-5">
        {/* Retained from yesterday notice pill */}
        {retainedFromYesterdayCount > 0 && (
          <div
            id="retained-banner"
            className="flex items-center justify-between px-4 py-3 bg-[#e8f0fe] border border-[#c2e7ff] rounded-2xl text-xs text-[#0b57d0]"
          >
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-[#0b57d0] shrink-0" />
              <span className="font-medium">
                Retaining <strong className="font-bold">{retainedFromYesterdayCount}</strong> unfinished{' '}
                {retainedFromYesterdayCount === 1 ? 'task' : 'tasks'} carried over from {yesterdayDayName}.
              </span>
            </div>
          </div>
        )}

        {/* Add New Task Input Card */}
        <form
          onSubmit={handleAddTask}
          className="bg-white rounded-2xl border border-[#e1e3e1] shadow-xs p-2 flex items-center gap-2 transition-all focus-within:border-[#0b57d0] focus-within:ring-2 focus-within:ring-[#0b57d0]/20"
        >
          <input
            ref={inputRef}
            id="new-task-input"
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder={`Add a task for ${todayDayName}...`}
            className="flex-1 px-3 py-2 text-sm text-[#1f1f1f] bg-transparent outline-hidden placeholder:text-[#8e918f]"
          />
          <button
            id="add-task-btn"
            type="submit"
            disabled={!newTitle.trim()}
            className="h-9 px-4 rounded-xl bg-[#0b57d0] hover:bg-[#0842a0] disabled:bg-[#f1f3f4] disabled:text-[#8e918f] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs disabled:shadow-none cursor-pointer disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </form>

        {/* Task List Section */}
        <div className="space-y-3">
          {/* Active / Pending Tasks */}
          {pendingTasks.length > 0 ? (
            <div className="space-y-2">
              {pendingTasks.map((task) => {
                const taskOriginDay = task.originalDate ? getDayName(task.originalDate) : yesterdayDayName;
                return (
                  <div
                    key={task.id}
                    id={`task-${task.id}`}
                    className="group bg-white rounded-2xl border border-[#e1e3e1] hover:border-[#c2e7ff] p-3.5 flex items-center justify-between gap-3 shadow-xs hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => handleToggleTask(task.id)}
                        className="text-[#5f6368] hover:text-[#0b57d0] transition-colors shrink-0"
                        aria-label="Mark completed"
                      >
                        <Circle className="w-5 h-5" />
                      </button>

                      {editingId === task.id ? (
                        <input
                          type="text"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          onBlur={() => handleSaveEdit(task.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(task.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          autoFocus
                          className="flex-1 text-sm text-[#1f1f1f] bg-[#f8f9fa] px-2 py-1 rounded-lg border border-[#0b57d0] outline-hidden"
                        />
                      ) : (
                        <div className="flex items-center gap-2 flex-1 min-w-0" onClick={() => handleStartEdit(task)}>
                          <span className="text-sm font-medium text-[#1f1f1f] truncate cursor-text">
                            {task.title}
                          </span>

                          {task.isRolledOver && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#fff0d4] text-[#8f4a00] border border-[#ffd8a4] shrink-0">
                              <RotateCcw className="w-3 h-3" />
                              From {taskOriginDay}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1.5 rounded-lg text-[#747775] hover:text-[#ba1a1a] hover:bg-[#ffebee] transition-colors"
                        title="Delete task"
                        aria-label="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : completedTasks.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-[#c7c7c7] p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-[#f1f3f4] text-[#5f6368] flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-[#1f1f1f]">No tasks for {todayDayName}</h3>
              <p className="text-xs text-[#5f6368] mt-1">
                Type above to add your first task. Any unfinished tasks will automatically carry over.
              </p>
            </div>
          ) : null}

          {/* Completed Tasks Section */}
          {completedTasks.length > 0 && (
            <div className="pt-4 border-t border-[#e1e3e1] space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-[#5f6368] uppercase tracking-wider">
                  Completed ({completedTasks.length})
                </span>
                <button
                  onClick={handleClearCompleted}
                  className="text-xs font-medium text-[#747775] hover:text-[#ba1a1a] transition-colors"
                >
                  Clear completed
                </button>
              </div>

              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  id={`task-${task.id}`}
                  className="group bg-[#f8f9fa] rounded-2xl border border-[#e1e3e1] p-3.5 flex items-center justify-between gap-3 opacity-70 hover:opacity-100 transition-all"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => handleToggleTask(task.id)}
                      className="text-[#0b57d0] hover:text-[#5f6368] transition-colors shrink-0"
                      aria-label="Mark incomplete"
                    >
                      <CheckCircle2 className="w-5 h-5 fill-[#e8f0fe]" />
                    </button>

                    <span className="text-sm line-through text-[#747775] truncate">
                      {task.title}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1.5 rounded-lg text-[#747775] hover:text-[#ba1a1a] hover:bg-[#ffebee] opacity-0 group-hover:opacity-100 transition-all"
                    title="Delete task"
                    aria-label="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Simple Offline Status Footer */}
      <footer className="max-w-2xl w-full mx-auto px-4 py-4 text-center text-xs text-[#747775] flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#1e8e3e]"></span>
        <span>100% Offline • Automatically retains unfinished tasks</span>
      </footer>
    </div>
  );
}
