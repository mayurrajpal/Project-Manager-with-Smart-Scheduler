using ProjectManager.API.DTOs;

namespace ProjectManager.API.Services
{
    public interface ISmartSchedulerService
    {
        Task<ScheduleResponse> AutoScheduleTasksAsync(int userId);
        Task<List<TaskConflict>> DetectConflictsAsync(int userId);
        Task<ProductivityInsights> GetProductivityInsightsAsync(int userId);
    }
}