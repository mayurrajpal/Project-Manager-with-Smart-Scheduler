using System.ComponentModel.DataAnnotations;
using ProjectManager.API.Models;

namespace ProjectManager.API.DTOs
{
    public class CreateTaskRequest
    {
        [Required]
        public string Title { get; set; } = string.Empty;
        
        public DateTime? DueDate { get; set; }
        
        public TaskPriority Priority { get; set; } = TaskPriority.Medium;
        
        [Range(1, 24)]
        public int EstimatedHours { get; set; } = 1;
    }

    public class UpdateTaskRequest
    {
        public string? Title { get; set; }
        public DateTime? DueDate { get; set; }
        public bool? IsCompleted { get; set; }
        public TaskPriority? Priority { get; set; }
        public int? EstimatedHours { get; set; }
    }

    public class TaskResponse
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public DateTime? DueDate { get; set; }
        public bool IsCompleted { get; set; }
        public int ProjectId { get; set; }
        public TaskPriority Priority { get; set; }
        public int EstimatedHours { get; set; }
        public DateTime? ScheduledStartTime { get; set; }
        public DateTime? ScheduledEndTime { get; set; }
    }
}