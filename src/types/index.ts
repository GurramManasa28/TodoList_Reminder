export interface Todo {
  id: string;
  user_id: string;
  title: string;
  completed: boolean;
  due_date: string | null;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
}