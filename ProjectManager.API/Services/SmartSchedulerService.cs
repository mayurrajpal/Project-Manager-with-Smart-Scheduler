using Microsoft.EntityFrameworkCore;
using ProjectManager.API.Data;
using ProjectManager.API.DTOs;
using ProjectManager.API.Models;

namespace ProjectManager.API.Services
{
    public class SmartSchedulerService : ISmartSchedulerService
    {
        private readonly AppDbContext _context;

        public SmartSchedulerService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ScheduleResponse> AutoScheduleTasksAsync(int userId)
        {
            // Get all incomplete tasks for the user
            var tasks = await _context.Tasks
                .Include(t => t.Project)
                .Where(t => t.Project.UserId == userId && !t.IsCompleted)
                .OrderByDescending(t => t.Priority)
                .ThenBy(t => t.DueDate)
                .ToListAsync();

            if (tasks.Count == 0)
            {
                return new ScheduleResponse
                {
                    Message = "No tasks to schedule",
                    TotalTasks = 0,
                    ScheduledCount = 0
                };
            }

            var scheduledTasks = new List<ScheduledTaskResponse>();
            var currentTime = DateTime.Now;
            
            // Start scheduling from next working hour (9 AM tomorrow if after 5 PM today)
            var scheduleStart = GetNextWorkingHour(currentTime);

            foreach (var task in tasks)
            {
                // Calculate schedule based on priority
                var startTime = GetOptimalStartTime(scheduleStart, task.Priority);
                var endTime = startTime.AddHours(task.EstimatedHours);

                // Update task with schedule
                task.ScheduledStartTime = startTime;
                task.ScheduledEndTime = endTime;

                scheduledTasks.Add(new ScheduledTaskResponse
                {
                    TaskId = task.Id,
                    Title = task.Title,
                    Priority = task.Priority,
                    ScheduledStartTime = startTime,
                    ScheduledEndTime = endTime,
                    ProjectTitle = task.Project.Title,
                    HasConflict = false
                });

                // Next task starts after this one ends
                scheduleStart = endTime;
                
                // If we've gone past work hours, move to next day
                if (scheduleStart.Hour >= 18) // 6 PM
                {
                    scheduleStart = scheduleStart.AddDays(1).Date.AddHours(9); // 9 AM next day
                }
            }

            await _context.SaveChangesAsync();

            // Detect conflicts
            var conflicts = await DetectConflictsAsync(userId);

            // Mark conflicted tasks
            foreach (var conflict in conflicts)
            {
                var task1 = scheduledTasks.FirstOrDefault(t => t.TaskId == conflict.Task1Id);
                var task2 = scheduledTasks.FirstOrDefault(t => t.TaskId == conflict.Task2Id);
                if (task1 != null) task1.HasConflict = true;
                if (task2 != null) task2.HasConflict = true;
            }

            return new ScheduleResponse
            {
                ScheduledTasks = scheduledTasks,
                Conflicts = conflicts,
                TotalTasks = tasks.Count,
                ScheduledCount = scheduledTasks.Count,
                Message = conflicts.Count > 0 
                    ? $"Successfully scheduled {scheduledTasks.Count} tasks with {conflicts.Count} conflicts detected" 
                    : $"Successfully scheduled all {scheduledTasks.Count} tasks without conflicts"
            };
        }

        public async Task<List<TaskConflict>> DetectConflictsAsync(int userId)
        {
            var tasks = await _context.Tasks
                .Include(t => t.Project)
                .Where(t => t.Project.UserId == userId 
                    && !t.IsCompleted 
                    && t.ScheduledStartTime.HasValue 
                    && t.ScheduledEndTime.HasValue)
                .ToListAsync();

            var conflicts = new List<TaskConflict>();

            for (int i = 0; i < tasks.Count; i++)
            {
                for (int j = i + 1; j < tasks.Count; j++)
                {
                    var task1 = tasks[i];
                    var task2 = tasks[j];

                    // Check if time ranges overlap
                    if (task1.ScheduledStartTime < task2.ScheduledEndTime && 
                        task2.ScheduledStartTime < task1.ScheduledEndTime)
                    {
                        conflicts.Add(new TaskConflict
                        {
                            Task1Id = task1.Id,
                            Task1Title = task1.Title,
                            Task2Id = task2.Id,
                            Task2Title = task2.Title,
                            ConflictStart = task1.ScheduledStartTime.Value > task2.ScheduledStartTime.Value 
                                ? task1.ScheduledStartTime.Value 
                                : task2.ScheduledStartTime.Value,
                            ConflictEnd = task1.ScheduledEndTime.Value < task2.ScheduledEndTime.Value 
                                ? task1.ScheduledEndTime.Value 
                                : task2.ScheduledEndTime.Value
                        });
                    }
                }
            }

            return conflicts;
        }

        public async Task<ProductivityInsights> GetProductivityInsightsAsync(int userId)
        {
            var oneWeekAgo = DateTime.Now.AddDays(-7);
            
            var allTasks = await _context.Tasks
                .Include(t => t.Project)
                .Where(t => t.Project.UserId == userId)
                .ToListAsync();

            var completedThisWeek = allTasks
                .Count(t => t.IsCompleted && t.DueDate.HasValue && t.DueDate.Value >= oneWeekAgo);

            var completedTasks = allTasks.Where(t => t.IsCompleted).ToList();
            
            var avgCompletionTime = completedTasks.Any() 
                ? completedTasks.Average(t => t.EstimatedHours) 
                : 0;

            var tasksWithDueDate = allTasks.Where(t => t.DueDate.HasValue).ToList();
            var onTimeCount = tasksWithDueDate.Count(t => t.IsCompleted && t.DueDate.Value >= DateTime.Now);
            var onTimeRate = tasksWithDueDate.Any() 
                ? (double)onTimeCount / tasksWithDueDate.Count * 100 
                : 0;

            var overdueTasks = allTasks
                .Count(t => !t.IsCompleted && t.DueDate.HasValue && t.DueDate.Value < DateTime.Now);

            return new ProductivityInsights
            {
                CompletedTasksThisWeek = completedThisWeek,
                AverageCompletionTime = Math.Round(avgCompletionTime, 1),
                OnTimeDeliveryRate = Math.Round(onTimeRate, 1),
                MostProductiveHour = "9 AM - 11 AM", // Simplified
                MostProductiveDay = "Tuesday", // Simplified
                OverdueTasks = overdueTasks
            };
        }

        private DateTime GetNextWorkingHour(DateTime current)
        {
            // If it's weekend, move to Monday
            if (current.DayOfWeek == DayOfWeek.Saturday)
                current = current.AddDays(2);
            else if (current.DayOfWeek == DayOfWeek.Sunday)
                current = current.AddDays(1);

            // If after 6 PM, move to 9 AM next day
            if (current.Hour >= 18)
            {
                current = current.AddDays(1).Date.AddHours(9);
            }
            // If before 9 AM, set to 9 AM
            else if (current.Hour < 9)
            {
                current = current.Date.AddHours(9);
            }

            return current;
        }

        private DateTime GetOptimalStartTime(DateTime baseTime, TaskPriority priority)
        {
            // High priority tasks get morning slots (9 AM - 12 PM)
            // Medium priority tasks get afternoon slots (2 PM - 5 PM)
            // Low priority tasks get evening slots (5 PM - 6 PM) or next available

            if (priority == TaskPriority.High && baseTime.Hour < 9)
            {
                return baseTime.Date.AddHours(9);
            }
            else if (priority == TaskPriority.Medium && baseTime.Hour < 14)
            {
                return baseTime.Date.AddHours(14);
            }

            return baseTime;
        }
    }
}