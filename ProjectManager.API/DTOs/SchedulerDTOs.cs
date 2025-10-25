using ProjectManager.API.Models;

namespace ProjectManager.API.DTOs
{
    public class ScheduledTaskResponse
    {
        public int TaskId { get; set; }
        public string Title { get; set; } = string.Empty;
        public TaskPriority Priority { get; set; }
        public DateTime ScheduledStartTime { get; set; }
        public DateTime ScheduledEndTime { get; set; }
        public string ProjectTitle { get; set; } = string.Empty;
        public bool HasConflict { get; set; }
    }

    public class TaskConflict
    {
        public int Task1Id { get; set; }
        public string Task1Title { get; set; } = string.Empty;
        public int Task2Id { get; set; }
        public string Task2Title { get; set; } = string.Empty;
        public DateTime ConflictStart { get; set; }
        public DateTime ConflictEnd { get; set; }
    }

    public class ScheduleResponse
    {
        public List<ScheduledTaskResponse> ScheduledTasks { get; set; } = new();
        public List<TaskConflict> Conflicts { get; set; } = new();
        public int TotalTasks { get; set; }
        public int ScheduledCount { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    public class ProductivityInsights
    {
        public int CompletedTasksThisWeek { get; set; }
        public double AverageCompletionTime { get; set; }
        public double OnTimeDeliveryRate { get; set; }
        public string MostProductiveHour { get; set; } = string.Empty;
        public string MostProductiveDay { get; set; } = string.Empty;
        public int OverdueTasks { get; set; }
    }
}