using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectManager.API.Data;
using ProjectManager.API.DTOs;
using ProjectManager.API.Models;
using System.Security.Claims;

namespace ProjectManager.API.Controllers
{
    [ApiController]
    [Route("api/projects")]
    [Authorize]
    public class ProjectsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProjectsController(AppDbContext context)
        {
            _context = context;
        }

        private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpGet]
        public async Task<ActionResult<List<ProjectResponse>>> GetProjects()
        {
            var userId = GetUserId();
            var projects = await _context.Projects
                .Where(p => p.UserId == userId)
                .Include(p => p.Tasks)
                .Select(p => new ProjectResponse
                {
                    Id = p.Id,
                    Title = p.Title,
                    Description = p.Description,
                    CreatedAt = p.CreatedAt,
                    Tasks = p.Tasks.Select(t => new TaskResponse
                    {
                        Id = t.Id,
                        Title = t.Title,
                        DueDate = t.DueDate,
                        IsCompleted = t.IsCompleted,
                        ProjectId = t.ProjectId,
                        Priority = t.Priority,
                        EstimatedHours = t.EstimatedHours,
                        ScheduledStartTime = t.ScheduledStartTime,
                        ScheduledEndTime = t.ScheduledEndTime
                    }).ToList()
                })
                .ToListAsync();

            return Ok(projects);
        }

        [HttpPost]
        public async Task<ActionResult<ProjectResponse>> CreateProject([FromBody] CreateProjectRequest request)
        {
            var userId = GetUserId();
            var project = new Project
            {
                Title = request.Title,
                Description = request.Description,
                UserId = userId
            };

            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            var response = new ProjectResponse
            {
                Id = project.Id,
                Title = project.Title,
                Description = project.Description,
                CreatedAt = project.CreatedAt,
                Tasks = new List<TaskResponse>()
            };

            return CreatedAtAction(nameof(GetProject), new { id = project.Id }, response);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ProjectResponse>> GetProject(int id)
        {
            var userId = GetUserId();
            var project = await _context.Projects
                .Include(p => p.Tasks)
                .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

            if (project == null)
            {
                return NotFound();
            }

            var response = new ProjectResponse
            {
                Id = project.Id,
                Title = project.Title,
                Description = project.Description,
                CreatedAt = project.CreatedAt,
                Tasks = project.Tasks.Select(t => new TaskResponse
                {
                    Id = t.Id,
                    Title = t.Title,
                    DueDate = t.DueDate,
                    IsCompleted = t.IsCompleted,
                    ProjectId = t.ProjectId,
                    Priority = t.Priority,
                    EstimatedHours = t.EstimatedHours,
                    ScheduledStartTime = t.ScheduledStartTime,
                    ScheduledEndTime = t.ScheduledEndTime
                }).ToList()
            };

            return Ok(response);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProject(int id)
        {
            var userId = GetUserId();
            var project = await _context.Projects.FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

            if (project == null)
            {
                return NotFound();
            }

            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("{projectId}/tasks")]
        public async Task<ActionResult<TaskResponse>> CreateTask(int projectId, [FromBody] CreateTaskRequest request)
        {
            var userId = GetUserId();
            var project = await _context.Projects.FirstOrDefaultAsync(p => p.Id == projectId && p.UserId == userId);

            if (project == null)
            {
                return NotFound();
            }

            var task = new ProjectTask
            {
                Title = request.Title,
                DueDate = request.DueDate,
                Priority = request.Priority,
                EstimatedHours = request.EstimatedHours,
                ProjectId = projectId
            };

            _context.Tasks.Add(task);
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

            return CreatedAtAction(nameof(GetProject), new { id = projectId }, response);
        }
    }
}