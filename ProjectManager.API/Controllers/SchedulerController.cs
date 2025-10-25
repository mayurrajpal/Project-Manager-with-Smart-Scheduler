using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectManager.API.DTOs;
using ProjectManager.API.Services;
using System.Security.Claims;

namespace ProjectManager.API.Controllers
{
    [ApiController]
    [Route("api/scheduler")]
    [Authorize]
    public class SchedulerController : ControllerBase
    {
        private readonly ISmartSchedulerService _schedulerService;

        public SchedulerController(ISmartSchedulerService schedulerService)
        {
            _schedulerService = schedulerService;
        }

        private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpPost("auto-schedule")]
        public async Task<ActionResult<ScheduleResponse>> AutoSchedule()
        {
            try
            {
                var userId = GetUserId();
                var result = await _schedulerService.AutoScheduleTasksAsync(userId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("conflicts")]
        public async Task<ActionResult<List<TaskConflict>>> GetConflicts()
        {
            try
            {
                var userId = GetUserId();
                var conflicts = await _schedulerService.DetectConflictsAsync(userId);
                return Ok(conflicts);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("insights")]
        public async Task<ActionResult<ProductivityInsights>> GetInsights()
        {
            try
            {
                var userId = GetUserId();
                var insights = await _schedulerService.GetProductivityInsightsAsync(userId);
                return Ok(insights);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}