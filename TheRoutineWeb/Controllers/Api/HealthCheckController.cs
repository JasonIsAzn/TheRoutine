using Microsoft.AspNetCore.Mvc;
using TheRoutineWeb.Models;
using TheRoutineWeb.Data;
using System.Linq;

namespace TheRoutineWeb.Controllers.Api
{
    [Route("api/[controller]")]
    [ApiController]
    public class HealthCheckController : ControllerBase
    {

        [HttpGet("ping")]
        public IActionResult Ping()
        {
            return Ok(new { message = "Pong!", serverTime = DateTime.UtcNow });
        }

    }

}
