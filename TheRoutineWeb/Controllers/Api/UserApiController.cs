using Microsoft.AspNetCore.Mvc;
using TheRoutineWeb.Models;
using TheRoutineWeb.Data; // adjust namespace based on where your AppDbContext is
using System.Linq;

namespace TheRoutineWeb.Controllers.Api
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserApiController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserApiController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            var user = _context.Users.FirstOrDefault(u => u.Email == request.Email);

            if (user == null)
                return Unauthorized(new { message = "Invalid credentials" });

            if (!string.IsNullOrEmpty(user.AppleId))
                return Unauthorized(new { message = "This account uses Apple Sign-In. Please log in with Apple." });

            if (user.Password != request.Password)
                return Unauthorized(new { message = "Invalid credentials" });

            return Ok(new { user.Id, user.Name, user.Email });
        }

        [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterRequest request)
        {
            if (_context.Users.Any(u => u.Email == request.Email))
                return BadRequest(new { message = "Email already in use" });

            var user = new User
            {
                Email = request.Email,
                Password = request.Password,
                Name = request.Name,
            };

            _context.Users.Add(user);
            _context.SaveChanges();

            return Ok(new { user.Id, user.Name, user.Email });
        }

        [HttpPost("apple-login")]
        public IActionResult AppleLogin([FromBody] AppleLoginRequest request)
        {
            var user = _context.Users.FirstOrDefault(u => u.AppleId == request.AppleId);

            // If no match by AppleId, fallback to email
            if (user == null)
            {
                user = _context.Users.FirstOrDefault(u => u.Email == request.Email);

                if (user != null)
                {
                    user.AppleId = request.AppleId;
                    _context.Users.Update(user);
                    _context.SaveChanges();
                }
            }

            if (user == null)
            {
                user = new User
                {
                    Email = request.Email,
                    Name = request.Name,
                    AppleId = request.AppleId,
                };
                _context.Users.Add(user);
                _context.SaveChanges();
            }

            return Ok(new { user.Id, user.Name, user.Email });
        }

    }
    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class RegisterRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
    }

    public class AppleLoginRequest
    {
        public string AppleId { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
    }
}
