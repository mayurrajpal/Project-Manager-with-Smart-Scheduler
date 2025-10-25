using Microsoft.AspNetCore.Mvc;
using ProjectManager.API.DTOs;
using ProjectManager.API.Services;

namespace ProjectManager.API.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            var result = await _authService.RegisterAsync(request);
            
            if (result == null)
            {
                return BadRequest(new { message = "User already exists" });
            }

            return Ok(result);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var result = await _authService.LoginAsync(request);
            
            if (result == null)
            {
                return Unauthorized(new { message = "Invalid credentials" });
            }

            return Ok(result);
        }
    }
}