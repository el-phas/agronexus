import { api, fetcher } from "./api";

export type Task = {
  id: number;
  farmer_id: number;
  title: string;
  description?: string;
  due_date?: string;
  priority?: 'low'|'medium'|'high';
  completed?: boolean;
}

export const getTasks = () => fetcher<Task[]>(api.get('/tasks'));
export const createTask = (payload: Partial<Task>) => fetcher<Task>(api.post('/tasks', payload));
export const updateTask = (id: number, payload: Partial<Task>) => fetcher<Task>(api.put(`/tasks/${id}`, payload));
export const deleteTask = (id: number) => fetcher(api.delete(`/tasks/${id}`));

export default { getTasks, createTask, updateTask, deleteTask };
