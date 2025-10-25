export interface User {
  email: string;
  token: string;
}

export enum TaskPriority {
  Low = 1,
  Medium = 2,
  High = 3
}

export interface Project {
  id: number;
  title: string;
  description?: string;
  createdAt: string;
  tasks: Task[];
}

export interface Task {
  id: number;
  title: string;
  dueDate?: string;
  isCompleted: boolean;
  projectId: number;
  priority: TaskPriority;
  estimatedHours: number;
  scheduledStartTime?: string;
  scheduledEndTime?: string;
}

export interface CreateProjectRequest {
  title: string;
  description?: string;
}

export interface CreateTaskRequest {
  title: string;
  dueDate?: string;
  priority: TaskPriority;
  estimatedHours: number;
}

export interface UpdateTaskRequest {
  title?: string;
  dueDate?: string;
  isCompleted?: boolean;
  priority?: TaskPriority;
  estimatedHours?: number;
}

export interface AuthResponse {
  token: string;
  email: string;
}

export interface ScheduledTask {
  taskId: number;
  title: string;
  priority: TaskPriority;
  scheduledStartTime: string;
  scheduledEndTime: string;
  projectTitle: string;
  hasConflict: boolean;
}

export interface TaskConflict {
  task1Id: number;
  task1Title: string;
  task2Id: number;
  task2Title: string;
  conflictStart: string;
  conflictEnd: string;
}

export interface ScheduleResponse {
  scheduledTasks: ScheduledTask[];
  conflicts: TaskConflict[];
  totalTasks: number;
  scheduledCount: number;
  message: string;
}

export interface ProductivityInsights {
  completedTasksThisWeek: number;
  averageCompletionTime: number;
  onTimeDeliveryRate: number;
  mostProductiveHour: string;
  mostProductiveDay: string;
  overdueTasks: number;
}