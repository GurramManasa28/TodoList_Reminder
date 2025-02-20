import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { LogOut, Plus, Calendar, CheckCircle2, Trash2, Moon, Sun, Monitor } from 'lucide-react';
import useSound from 'use-sound';
import { useTodoStore } from '../store/todoStore';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

export default function TodoList() {
  const [newTodo, setNewTodo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const { todos, fetchTodos, addTodo, toggleTodo, deleteTodo } = useTodoStore();
  const { signOut } = useAuthStore();
  const { isDark, isSystemTheme, toggleTheme, setSystemTheme } = useThemeStore();
  const [playComplete] = useSound('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    // Validate due date if provided
    if (dueDate) {
      const selectedDate = new Date(dueDate);
      const now = new Date();
      
      if (selectedDate < now) {
        toast.error('Due date cannot be in the past');
        return;
      }
    }

    try {
      await addTodo({
        title: newTodo,
        completed: false,
        due_date: dueDate || null,
      });
      setNewTodo('');
      setDueDate('');
      toast.success('Task added successfully!');
    } catch (error) {
      toast.error('Failed to add task');
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await toggleTodo(id);
      playComplete();
      toast.success('Task updated!');
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTodo(id);
      toast.success('Task deleted!');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const handleThemeChange = () => {
    if (isSystemTheme) {
      setSystemTheme(false);
      toggleTheme();
    } else {
      if (!isDark) {
        toggleTheme();
      } else {
        setSystemTheme(true);
      }
    }
  };

  // Get current datetime string for min attribute
  const getCurrentDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-white dark:from-gray-900 dark:to-gray-800 py-8 px-4 transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-colors duration-200">
          <div className="p-6 bg-indigo-600 dark:bg-indigo-700">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="h-8 w-8" />
                TaskFlow
              </h1>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleThemeChange}
                  className="text-white hover:text-indigo-200 transition-colors duration-200"
                  aria-label="Toggle theme"
                >
                  {isSystemTheme ? (
                    <Monitor className="h-6 w-6" />
                  ) : isDark ? (
                    <Sun className="h-6 w-6" />
                  ) : (
                    <Moon className="h-6 w-6" />
                  )}
                </button>
                <button
                  onClick={handleSignOut}
                  className="text-white hover:text-indigo-200 transition-colors duration-200"
                >
                  <LogOut className="h-6 w-6" />
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="mt-6 flex gap-4">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Add a new task..."
                className="flex-1 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              />
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={getCurrentDateTime()}
                className="rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white dark:bg-gray-700 dark:text-white"
              />
              <button
                type="submit"
                className="bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 px-6 py-2 rounded-lg font-medium hover:bg-indigo-50 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Add
              </button>
            </form>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {todos.map((todo) => (
              <div
                key={todo.id}
                className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleToggle(todo.id)}
                    className={`rounded-full p-1 ${
                      todo.completed
                        ? 'text-green-500 hover:text-green-600 dark:text-green-400 dark:hover:text-green-500'
                        : 'text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400'
                    }`}
                  >
                    <CheckCircle2 className="h-6 w-6" />
                  </button>
                  <div>
                    <p
                      className={`text-gray-800 dark:text-gray-200 ${
                        todo.completed ? 'line-through text-gray-400 dark:text-gray-500' : ''
                      }`}
                    >
                      {todo.title}
                    </p>
                    {todo.due_date && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(todo.due_date).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(todo.id)}
                  className="text-red-400 hover:text-red-500 dark:text-red-500 dark:hover:text-red-400 transition-colors duration-200"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
            {todos.length === 0 && (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No tasks yet. Add your first task above!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}