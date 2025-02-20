import { create } from 'zustand';
import { Todo } from '../types';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';

interface TodoState {
  todos: Todo[];
  setTodos: (todos: Todo[]) => void;
  addTodo: (todo: Omit<Todo, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  fetchTodos: () => Promise<void>;
}

export const useTodoStore = create<TodoState>((set, get) => ({
  todos: [],
  setTodos: (todos) => set({ todos }),
  addTodo: async (todo) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('todos')
      .insert([{ ...todo, user_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    set({ todos: [...get().todos, data] });
  },
  toggleTodo: async (id) => {
    const todo = get().todos.find((t) => t.id === id);
    if (!todo) return;

    const { error } = await supabase
      .from('todos')
      .update({ completed: !todo.completed })
      .eq('id', id);

    if (error) throw error;
    set({
      todos: get().todos.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      ),
    });
  },
  deleteTodo: async (id) => {
    const { error } = await supabase.from('todos').delete().eq('id', id);
    if (error) throw error;
    set({ todos: get().todos.filter((t) => t.id !== id) });
  },
  fetchTodos: async () => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    set({ todos: data });
  },
}));