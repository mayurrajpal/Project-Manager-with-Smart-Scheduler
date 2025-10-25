using System.ComponentModel.DataAnnotations;

namespace ProjectManager.API.Models
{
    public class ProjectTask
    {
        public int Id { get; set; }
        
        [Required]
        public string Title { get; set; } = string.Empty;
        
        public DateTime? DueDate { get; set; }
        
        public bool IsCompleted { get; set; } = false;
        
        public TaskPriority Priority { get; set; } = TaskPriority.Medium;
        
        public int EstimatedHours { get; set; } = 1;
        
        public DateTime? ScheduledStartTime { get; set; }
        
        public DateTime? ScheduledEndTime { get; set; }
        
        public int ProjectId { get; set; }
        public Project Project { get; set; } = null!;
    }
}