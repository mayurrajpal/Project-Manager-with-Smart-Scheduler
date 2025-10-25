using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectManager.API.Data;
using ProjectManager.API.DTOs;
using System.Security.Claims;

namespace ProjectManager.API.Controllers
{
    [ApiController]
    [Route("api/tasks")]
    [Authorize]
    public class TasksController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TasksController(AppDbContext context)
        {
            _context = context;
        }

        private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpPut("{taskId}")]
        public async Task<ActionResult<TaskResponse>> UpdateTask(int taskId, [FromBody] UpdateTaskRequest request)
        {
            var userId = GetUserId();
            var task = await _context.Tasks
                .Include(t => t.Project)
                .FirstOrDefaultAsync(t => t.Id == taskId && t.Project.UserId == userId);

            if (task == null)
            {
                return NotFound();
            }

            if (request.Title != null)
                task.Title = request.Title;
            
            if (request.DueDate.HasValue)
                task.DueDate = request.DueDate;
            
            if (request.IsCompleted.HasValue)
                task.IsCompleted = request.IsCompleted.Value;

            if (request.Priority.HasValue)
                task.Priority = request.Priority.Value;

            if (request.EstimatedHours.HasValue)
                task.EstimatedHours = request.EstimatedHours.Value;

            await _context.SaveChangesAsync();

            var response = new TaskResponse
            {
                Id = task.Id,
                Title = task.Title,
                DueDate = task.DueDate,
                IsCompleted = task.IsCompleted,
                ProjectId = task.ProjectId,
                Priority = task.Priority,
                EstimatedHours = task.EstimatedHours,
                ScheduledStartTime = task.ScheduledStartTime,
                ScheduledEndTime = task.ScheduledEndTime
            };

            return Ok(response);
        }

        [HttpDelete("{taskId}")]
        public async Task<IActionResult> DeleteTask(int taskId)
        {
            var userId = GetUserId();
            var task = await _context.Tasks
                .Include(t => t.Project)
                .FirstOrDefaultAsync(t => t.Id == taskId && t.Project.UserId == userId);

            if (task == null)
            {
                return NotFound();
            }

            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}